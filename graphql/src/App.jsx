import React, { Component } from "react";
import { Form } from "./Form";
import { Organization } from "./Organization";
import axios from "axios";
const BASE_URL = "https://api.github.com/graphql";
const INITIAL_LOAD_PATH = "facebook/react";

// GraphQL queries
const GET_ISSUES_OF_ORGANIZATION = `
    {
        organization(login: "facebook"){
            name
            url
            repository(name: "react"){
                name
                url
                issues(last: 5){
                    edges{
                        node{
                            id
                            title
                            url
                        }
                    }
                }
            }
        }
    }
`;

const GET_ISSUES_OF_REPOSITORY = `
    query(
        $organization: String!,
        $repository: String!,
        $cursor: String
    ){
        organization(login: $organization){
            name
            url
            repository(name: $repository){
                id
                name
                url
                stargazers{
                  totalCount
                }
                viewerHasStarred
                issues(first: 5, after: $cursor, states: [OPEN]){
                    edges{
                        node{
                            id
                            title
                            url
                            reactions(last: 3){
                                edges{
                                    node{
                                        id
                                        content
                                    }
                                }
                            }
                        }
                    }
                    totalCount
                    pageInfo{
                        endCursor
                        hasNextPage
                    }
                }
                
            }
        }
    }
`;

const ADD_STAR = `
    mutation($repositoryId: ID!){
      addStar(input: {starrableId: $repositoryId}){
        starrable{
          viewerHasStarred
        }
      }
    }
`;

const REMOVE_STAR = `
    mutation($repositoryId: ID!){
      removeStar(input: {starrableId: $repositoryId}){
        starrable{
          viewerHasStarred
        }
      }
    }
`;

const getIssuesOfRepositoryQuery = (organization, repository) => `
{
    organization(login: "${organization}"){
        name
        url
        repository(name: "${repository}"){
            name
            url
            issues(last: 5, states: [OPEN]){
                edges{
                    node{
                        id
                        title
                        url
                        reactions(last: 3){
                            edges{
                                node{
                                    id
                                    content
                                }
                            }
                        }
                    }
                }
                totalCount
                pageInfo{
                    endCursor
                    hasNextPage
                }
            }
            
        }
    }
}
`;
const axiosGitHubGraphQl = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `bearer ${process.env.PERSONAL_ACCESS_TOKEN_GITHUB}`
  }
});
const title = "React + GraphQl - Api Github Client";

const getIssuesOfRepository = (path, cursor) => {
  const [organization, repository] = path.split("/");

  return axiosGitHubGraphQl.post("", {
    query: GET_ISSUES_OF_REPOSITORY,
    variables: { organization, repository, cursor }
  });
};

const resolveQueryResult = (queryResult, cursor) => state => {
  const { data, errors } = queryResult.data;

  if (!cursor) {
    return {
      organization: data.organization,
      errors
    };
  }

  const { edges: oldIssues } = state.organization.repository.issues;
  const { edges: newIssues } = data.organization.repository.issues;
  const updateIssues = [...oldIssues, ...newIssues];

  return {
    organization: {
      ...data.organization,
      repository: {
        ...data.organization.repository,
        issues: {
          ...data.organization.repository.issues,
          edges: updateIssues
        }
      }
    },
    errors
  };

  //   organization: queryResult.data.data.organization,
  //   errors: queryResult.data.errors,
  //   endCursor: endCursor
};

const starRepository = (repositoryId, addStar, removeStar) => {
  let queryType;
  if (addStar) {
    queryType = ADD_STAR;
  } else if (removeStar) {
    queryType = REMOVE_STAR;
  }
  return axiosGitHubGraphQl.post("", {
    query: queryType,
    variables: { repositoryId }
  });
};

const resolveStarMutation = (mutationResult, starRepo, unstarRepo) => state => {
  const { data } = mutationResult.data;
  let viewerHasStarred;
  let totalStarGazers;
  const { totalCount } = state.organization.repository.stargazers;
  if (starRepo && data.addStar) {
    viewerHasStarred = data.addStar.starrable;
    totalStarGazers = totalCount + 1;
  } else if (unstarRepo && data.removeStar) {
    viewerHasStarred = data.removeStar.starrable;
    totalStarGazers = totalCount - 1;
  }

  return {
    ...state,
    organization: {
      ...state.organization,
      repository: {
        ...state.organization.repository,
        viewerHasStarred,
        stargazers: {
          totalCount: totalStarGazers
        }
      }
    }
  };
};

export class App extends Component {
  state = {
    path: INITIAL_LOAD_PATH,
    organization: null,
    errors: null
  };

  componentDidMount() {
    if (this.state.path) {
      this.onFetchFromGitHub(this.state.path);
    }
  }

  componentDidUpdate() {}

  onInputChange = e => {
    this.setState({ path: e.target.value });
  };

  onFormSubmit = e => {
    // fetch data again
    // e.preventdefault();
    this.onFetchFromGitHub(this.state.path);
  };

  onFetchFromGitHub = async (path, cursor) => {
    const graphqlResult = await getIssuesOfRepository(path, cursor);
    if (graphqlResult && graphqlResult.data && graphqlResult.data.data) {
      this.setState(resolveQueryResult(graphqlResult, cursor));
    }

    console.log(JSON.stringify(graphqlResult.data));
  };

  onStarRepository = async (repositoryId, viewerHasStarred) => {
    let unstarRepo = false;
    let starRepo = false;
    if (viewerHasStarred) {
      unstarRepo = true;
    } else {
      starRepo = true;
    }
    const addStartMutationResult = await starRepository(
      repositoryId,
      starRepo,
      unstarRepo
    );
    if (
      addStartMutationResult &&
      addStartMutationResult.data &&
      addStartMutationResult.data.data
    ) {
      this.setState(
        resolveStarMutation(addStartMutationResult, starRepo, unstarRepo)
      );
    }
  };

  onFetchMoreIssues = async () => {
    const { endCursor } = this.state.organization.repository.issues.pageInfo;
    this.onFetchFromGitHub(this.state.path, endCursor);
  };

  render() {
    const { path, organization, errors } = this.state;
    console.log(JSON.stringify(organization));
    return (
      <div>
        <h1>{title}</h1>
        <Form
          inputValuePath={path}
          onFormSubmit={this.onFormSubmit}
          onInputChange={this.onInputChange}
        />
        <hr />
        {/*result */}
        {organization && Object.entries(organization).length > 0 ? (
          <Organization
            organization={organization}
            errors={errors}
            onFetchMoreIssues={this.onFetchMoreIssues}
            onStarRepository={this.onStarRepository}
          />
        ) : (
          <p>No information yet ...</p>
        )}
      </div>
    );
  }
}
// const App = () =>
//   <div>{title}</div>;
// export default App;
