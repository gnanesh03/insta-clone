import React from "react";

const VerticalLine = () => {
  const lineStyle = {
    width: "2px",
    height: "20px",
    backgroundColor: "grey",
    display: "inline-block",
    verticalAlign: "middle",
    marginRight: "5px",
    marginTop: "-2px",
  };

  return <span style={lineStyle}></span>;
};

export default VerticalLine;
