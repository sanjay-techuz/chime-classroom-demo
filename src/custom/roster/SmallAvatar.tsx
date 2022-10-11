import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";

const SmallAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== "open",
})<{
  bgcolor?: any;
}>(({ theme, bgcolor }) => ({
  width: 22,
  height: 22,
  border: `2px solid ${theme.palette.background.paper}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: bgcolor,
}));

export default SmallAvatar;
