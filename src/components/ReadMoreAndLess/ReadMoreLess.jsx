import React, { useState } from "react";

const ReadMoreLess = ({ text, limit = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const toggle = () => setIsExpanded(!isExpanded);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", textAlign: "justify" }}>
        {isExpanded ? text : text.slice(0, limit)}
      </div>
      {text.length > limit && (
        <div style={{ textAlign: "right" }}>
          <button
            type="button"
            onClick={toggle}
            className="btn btn-link p-0"
            style={{ fontSize: "0.9rem" }}
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReadMoreLess;
