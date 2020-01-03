import React, { memo } from "react";
import { Repository } from "./Repository";

export const Organization = memo(
  ({ organization, errors, onFetchMoreIssues, onStarRepository }) => {
    if (errors) {
      return (
        <p>
          <strong>Something went wrong:</strong>
          {errors.map(error => error.message).join(" ")}
        </p>
      );
    }
    return (
      <div>
        <p>
          <strong>Issues from Organization:</strong>
          <a href={organization.url}>{organization.name}</a>
        </p>
        <Repository
          repository={organization.repository}
          onFetchMoreIssues={onFetchMoreIssues}
          onStarRepository={onStarRepository}
        />
      </div>
    );
  }
);
