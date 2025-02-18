// import React from "react";
// import "./MainButton.css";

// const MainButton = ({
//   href,
//   children,
//   bgColor = "#b3c7f9",
//   textColor = "black",
//   hoverColor = "#8f9fc7",
// }) => {
//   return (
//     <a
//       href={href}
//       className="blue-button"
//       style={{
//         backgroundColor: bgColor,
//         color: textColor,
//         "--hover-bg": hoverColor,
//       }}
//     >
//       {children}
//     </a>
//   );
// };

// export default MainButton;

import React from "react";
import "./MainButton.css";

const MainButton = ({
  href,
  onClick,
  children,
  bgColor = "#b3c7f9",
  textColor = "black",
  hoverColor = "#8f9fc7",
}) => {
  const isLink = !!href;

  return isLink ? (
    <a
      href={href}
      className="blue-button"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        "--hover-bg": hoverColor,
      }}
    >
      {children}
    </a>
  ) : (
    <button
      className="blue-button"
      onClick={onClick}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        "--hover-bg": hoverColor,
      }}
    >
      {children}
    </button>
  );
};

export default MainButton;
