import React from "react";
import { Typography } from "@mui/material";

const StickerLabel = ({ title, bgColor = "#AAC9D5", textColor = "black" }) => {
  return (
    <Typography
      variant="h6"
      sx={{
        position: "relative",
        display: "inline-block",
        padding: "16px 40px",
        color: textColor,
        fontWeight: "bold",
        backgroundColor: bgColor,
        borderTopLeftRadius: "6px",
        borderBottomLeftRadius: "6px",
        boxShadow: "4px 0 6px rgba(0,0,0,0.15)",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          right: "-30px", // arrow width
          width: 0,
          height: 0,
          borderTop: "32px solid transparent", // arrow height
          borderBottom: "32px solid transparent", // arrow height
          borderLeft: `30px solid ${bgColor}`, // arrow color
        },
      }}
    >
      {title}
    </Typography>
  );
};

export default StickerLabel;
