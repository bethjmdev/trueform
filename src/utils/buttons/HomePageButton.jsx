import React from "react";
import "./HomePageButton.css";

const HomePageButton = ({ onClick, children }) => {
  return (
    <button className="homepage-button" onClick={onClick}>
      {children}
    </button>
  );
};

export default HomePageButton;
