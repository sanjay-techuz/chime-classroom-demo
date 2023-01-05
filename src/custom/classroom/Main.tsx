import { styled } from "@mui/material/styles";

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  leftopen?: boolean;
  rightopen?: number;
  drawerwidth?: number;
}>(({ theme, leftopen, rightopen, drawerwidth = 0 }) => ({
  flexGrow: 1,
  padding: theme.spacing(1),
  backgroundColor: "var(--primary_blue_color) !important",
  // transition: theme.transitions.create("margin", {
  //   easing: theme.transitions.easing.sharp,
  //   duration: theme.transitions.duration.leavingScreen,
  // }),
  marginLeft: `0`,
  marginRight: `0`,
  width: "100%",
  height: "100%",
  ...(leftopen &&
    !rightopen &&
    {
      width: `calc(100% - ${drawerwidth}px)`,
      // transition: theme.transitions.create("margin", {
      //   easing: theme.transitions.easing.easeOut,
      //   duration: theme.transitions.duration.enteringScreen,
      // }),
      marginLeft: `${drawerwidth}px`,
    }),
  ...(!leftopen &&
    rightopen &&
    {
      width: `calc(100% - ${drawerwidth}px)`,
      // transition: theme.transitions.create("margin", {
      //   easing: theme.transitions.easing.easeIn,
      //   duration: theme.transitions.duration.enteringScreen,
      // }),
      marginRight: `${drawerwidth}px`,
    }),
  ...(leftopen &&
    rightopen &&
    {
      width: `calc(100% - ${drawerwidth + drawerwidth}px)`,
      marginLeft: `${drawerwidth}px`,
      marginRight: `${drawerwidth}px`,
    }),
  ...(!leftopen &&
    !rightopen && {
      width: `100%`,
      height: `100%`,
      marginLeft: `0`,
      marginRight: `0`,
    }),
}));

export default Main;
