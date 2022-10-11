import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { styled, useTheme } from "@mui/material/styles";

interface AppBarProps extends MuiAppBarProps {
  leftopen?: boolean;
  rightopen?: boolean;
  anchor?: string;
  mobileview?: boolean;
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
    mobileview,
    background,
    drawerWidth,
  }) => ({
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(leftopen &&
      !rightopen &&
      !mobileview && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }),
    ...(rightopen &&
      !leftopen &&
      !mobileview && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginRight: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }),
    ...(rightopen &&
      leftopen &&
      !mobileview && {
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
      bottom: 0,
    }),
    backgroundColor: `${background} !important`,
    boxShadow: "none",
  })
);

export default AppBar;
