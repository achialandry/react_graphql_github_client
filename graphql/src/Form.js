import React, { memo } from "react";

// const onFormSubmit = () => {

// };

// onInputChange = () => {

// };

export const Form = memo(({ inputValuePath, onFormSubmit, onInputChange }) => {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
      }}
    >
      <label htmlFor="url">Show open issues for https://github.com/</label>
      <input
        id="url"
        type="text"
        value={inputValuePath}
        onChange={onInputChange}
        style={{ width: "300px" }}
      />
      <button type="submit" onClick={onFormSubmit}>
        Submit
      </button>
    </form>
  );
});
