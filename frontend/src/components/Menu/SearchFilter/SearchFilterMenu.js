import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TuneIcon from "@mui/icons-material/Tune";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function SearchFilterPositionedMenu({ fetchPopularPosts }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="demo-positioned-button"
        aria-controls={open ? "demo-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{
          color: "black",
          fontStyle: "bold",
          border: "1px solid #c4c4c4",
          borderRadius: "5px",
          height: "56px",
          marginLeft: "10px",
        }}
      >
        <TuneIcon sx={{ marginRight: "5px" }} /> Filter{" "}
        <KeyboardArrowDownIcon sx={{ marginLeft: "5px" }} />
      </Button>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{ paper: { sx: { minWidth: "120px" } } }}
      >
        <MenuItem onClick={fetchPopularPosts}>Popular</MenuItem>
        <MenuItem onClick={handleClose}>Relevant</MenuItem>
        <MenuItem onClick={handleClose}>Date</MenuItem>
      </Menu>
    </div>
  );
}
