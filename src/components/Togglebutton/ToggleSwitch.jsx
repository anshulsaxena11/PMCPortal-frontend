import React from "react";
import { Switch, FormControlLabel } from "@mui/material";

/**
 * MUI Toggle Switch Component
 * ---------------------------
 * Props:
 * - labelOn / labelOff → optional text shown beside toggle
 * - checked → controlled state
 * - onChange → function to handle toggle
 */

const ToggleSwitch = ({
  checked,
  onChange,
  labelOn = "On",
  labelOff = "Off",
  disabled = false,
  color = "success",
}) => {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          color={color}
          disabled={disabled}
        />
      }
      label={checked ? labelOn : labelOff}
      sx={{
        "& .MuiFormControlLabel-label": {
          fontWeight: 500,
        },
      }}
    />
  );
};

export default ToggleSwitch;
