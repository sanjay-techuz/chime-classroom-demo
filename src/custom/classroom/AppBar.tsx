import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { styled } from "@mui/material/styles";

interface AppBarProps extends MuiAppBarProps {
  leftopen?: boolean;
  rightopen?: boolean;
  anchor?: string;
  background?: string;
  drawerWidth?: number;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(
  ({
    theme,
    leftopen,
    rightopen,
    anchor,
    background,
    drawerWidth = 0,
  }) => ({
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(leftopen &&
      !rightopen &&
      {
        width: `calc(100% - ${drawerWidth + 16}px) !important`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }),
    ...(rightopen &&
      !leftopen &&
      {
        width: `calc(100% - ${drawerWidth + 16}px) !important`,
        marginRight: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }),
    ...(rightopen &&
      leftopen &&
      {
        width: `calc(100% - ${drawerWidth + drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        marginRight: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }),
    ...(anchor === "top" && {
      top: 0,
      bottom: "auto",
    }),
    ...(anchor === "bottom" && {
      top: "auto",
      bottom: "8px",
    }),
    backgroundColor: `${background} !important`,
    boxShadow: "none",
    left: "8px",
    right: "8px",
    borderRadius: "8px"
  })
);

export default AppBar;
