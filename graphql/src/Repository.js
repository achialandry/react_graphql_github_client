import React, { memo } from "react";

export const Repository = memo(
  ({ repository, onFetchMoreIssues, onStarRepository }) => {
    const viewStarType = typeof repository.viewerHasStarred === "object";
    let viewerHasStarred;
    if (viewStarType) {
      viewerHasStarred = repository.viewerHasStarred.viewerHasStarred;
    } else {
      viewerHasStarred = repository.viewerHasStarred;
    }
    return (
      <div>
        <p>
          <strong>In Repository:</strong>
          <a href={repository.url}>{repository.name}</a>
          {repository && repository.id && (
            <button
              style={{
                marginLeft: "7px",
                backgroundColor: `${viewerHasStarred ? "#BD2F10" : "#0D5505"}`,
                color: "#ffffff",
                borderRadius: "8px",
                cursor: "pointer",
                transitionDuration: "0.2s",
                WebkitTransitionDuration: "0.2s",
                "&:hover": {
                  backgroundColor: "#555555",
                  color: "white"
                }
              }}
              type="button"
              onClick={() => onStarRepository(repository.id, viewerHasStarred)}
            >
              <span style={{ marginRight: "3px" }}>
                {repository.stargazers.totalCount}
              </span>

              {viewerHasStarred
                ? "unStar"
                : `${repository.stargazers.totalCount > 1 ? "Stars" : "Star"}`}
            </button>
          )}
        </p>
        <ul>
          {repository.issues &&
            repository.issues.edges &&
            repository.issues.edges.map(issue => (
              <li key={issue.node.id}>
                <a href={issue.node.url}>{issue.node.title}</a>
                {issue.node.reactions &&
                  issue.node.reactions.edges &&
                  issue.node.reactions.edges.length > 0 && (
                    <ul>
                      {<strong>Reactions:</strong>}
                      {issue.node.reactions.edges.map(reaction => (
                        <li key={reaction.node.id}>{reaction.node.content}</li>
                      ))}
                    </ul>
                  )}
              </li>
            ))}
        </ul>

        <hr />
        {repository.issues && repository.issues.pageInfo.hasNextPage && (
          <button onClick={onFetchMoreIssues}>More</button>
        )}
      </div>
    );
  }
);
