// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import Modal from "react-modal";

import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";

import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Avatar } from "@mui/material";
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowBackIosNewSharpIcon from '@mui/icons-material/ArrowBackIosNewSharp';

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getMeetingStatusContext from "../context/getMeetingStatusContext";
import getUIStateContext from "../context/getUIStateContext";
import ClassMode from "../enums/ClassMode";
import MeetingStatus from "../enums/MeetingStatus";
import ViewMode from "../enums/ViewMode";
import useRemoteControl from "../hooks/useRemoteControl";
import Chat from "./Chat";
import styles from "./Classroom.css";
import ContentVideo from "./ContentVideo";
import Controls from "./Controls";
import CopyInfo from "./CopyInfo";
import DeviceSwitcher from "./DeviceSwitcher";
import Error from "./Error";
import LoadingSpinner from "./LoadingSpinner";
import LocalVideo from "./LocalVideo";
import CheckMediaPermissions from "./CheckMediaPermissions";
import RemoteVideoGroup from "./RemoteVideoGroup";
import Roster from "./Roster";
import Tooltip from "./Tooltip";

const cx = classNames.bind(styles);
const drawerWidth = 290;

interface AppBarProps extends MuiAppBarProps {
  leftopen?: boolean;
  rightopen?: boolean;
  anchor?: string;
  mobileview?: boolean;
  background?: string;
}

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  leftopen?: boolean;
  rightopen?: boolean;
  mobileview?: boolean;
}>(({ theme, leftopen, rightopen, mobileview}) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  backgroundColor: '#142230 !important',
  // transition: theme.transitions.create("margin", {
  //   easing: theme.transitions.easing.sharp,
  //   duration: theme.transitions.duration.leavingScreen,
  // }),
  marginLeft: `0`,
  marginRight: `0`,
  width: "100%",
  height:"100%",
  ...(leftopen &&
    !rightopen && !mobileview && {
      width: `calc(100% - ${drawerWidth}px)`,
      // transition: theme.transitions.create("margin", {
      //   easing: theme.transitions.easing.easeOut,
      //   duration: theme.transitions.duration.enteringScreen,
      // }),
      marginLeft: `${drawerWidth}px`,
    }),
  ...(!leftopen &&
    rightopen && !mobileview && {
      width: `calc(100% - ${drawerWidth}px)`,
      // transition: theme.transitions.create("margin", {
      //   easing: theme.transitions.easing.easeIn,
      //   duration: theme.transitions.duration.enteringScreen,
      // }),
      marginRight: `${drawerWidth}px`,
    }),
  ...(leftopen &&
    rightopen && !mobileview && {
      width: `calc(100% - ${drawerWidth + drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      marginRight: `${drawerWidth}px`,
    }),
  ...(!leftopen &&
    !rightopen && {
      width: `100%`,
      height: `100%`,
      marginLeft: `0`,
      marginRight: `0`,
    }),
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, leftopen, rightopen, anchor, mobileview, background }) => ({
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
  boxShadow: 'none'
}));


const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  minHeight: '36px !important'
}));

export default function Classroom() {
  Modal.setAppElement("body");
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [state] = useContext(getUIStateContext());
  const { meetingStatus, errorMessage } = useContext(getMeetingStatusContext());
  const [isContentShareEnabled, setIsContentShareEnabled] = useState(false);
  const [tryToReload, setTryToReload] = useState(true);
  const [viewMode, setViewMode] = useState(ViewMode.Room);
  const [isMobileView, setIsMobileView] = useState(false);
  const [tab, setTab] = useState(0);
  const [isModeTransitioning, setIsModeTransitioning] = useState(false);
  const [openRightBar, setOpenRightBar] = useState(true);
  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const intl = useIntl();

  useRemoteControl();

  useEffect(() => {
    if (window.innerWidth < 600) {
      setIsMobileView(true);
    } else {
      setIsMobileView(false);
    }
  }, []);

  const stopContentShare = async () => {
    setIsModeTransitioning(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    try {
      chime?.audioVideo?.stopContentShare();
    } catch (error) {
      // eslint-disable-next-line
      console.error(error);
    } finally {
      setViewMode(ViewMode.Room);
      setIsModeTransitioning(false);
    }
  };

  // Must pass a memoized callback to the ContentVideo component using useCallback().
  // ContentVideo will re-render only when one dependency "viewMode" changes.
  // See more comments in ContentVideo.
  const onContentShareEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled && viewMode === ViewMode.ScreenShare) {
        await stopContentShare();
      }
      setIsContentShareEnabled(enabled);
    },
    [viewMode]
  );

  if (process.env.NODE_ENV === "production") {
    useEffect(() => {
      // Recommend using "onbeforeunload" over "addEventListener"
      window.onbeforeunload = async (event: BeforeUnloadEvent) => {
        // Prevent the window from closing immediately
        // eslint-disable-next-line
        event.returnValue = true;
        try {
          await chime?.leaveRoom(state.classMode === ClassMode.Teacher);
        } catch (error) {
          // eslint-disable-next-line
          console.error(error);
        } finally {
          window.onbeforeunload = null;
        }
      };
      return () => {
        window.onbeforeunload = null;
      };
    }, []);
  }

  const handleDrawerLeftToggle = () => {
    setLeftDrawerOpen(!leftDrawerOpen);
  };

  const handleDrawerRightToggle = () => {
    setRightDrawerOpen(!rightDrawerOpen);
  };

  window.addEventListener("resize", () => {
    // We execute the same script as before

    if (window.innerWidth < 600) {
      setIsMobileView(true);
    } else {
      setIsMobileView(false);
    }
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  return (
    <>
      <CheckMediaPermissions
        isRetry={() => {
          setTryToReload(false);
          setTryToReload(true);
        }}
      />
      {tryToReload && (
        <Box sx={{ display: "flex", width:'100%', height:'100%' }}>
          {meetingStatus === MeetingStatus.Loading && <LoadingSpinner />}
          {meetingStatus === MeetingStatus.Failed && (
            <Error errorMessage={errorMessage} />
          )}
          {meetingStatus === MeetingStatus.Succeeded && (
            <Box sx={{ display: "flex",width:'100%', height:'100%' }}>
              <AppBar
                position="fixed"
                leftopen={leftDrawerOpen}
                rightopen={rightDrawerOpen}
                anchor="top"
                mobileview={isMobileView}
                background={"#142230"}
              >
                <Toolbar>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerLeftToggle}
                  >
                    <PeopleAltOutlinedIcon />
                  </IconButton>
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{ flexGrow: 1 }}
                    component="div"
                    align="center"
                  >
                    Persistent drawer
                  </Typography>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="end"
                    // onClick={handleDrawerRightToggle}
                    onClick={handleClick}
                  >
                    <Avatar sx={{ bgcolor: '#142230', border: '1px solid #FFF'}}><MoreVertOutlinedIcon /></Avatar>
                  </IconButton>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                  >
                    <MenuItem onClick={() => {
                      setTab(3);
                      handleDrawerRightToggle();
                      handleClose();
                    }}>Meeting info</MenuItem>
                    <MenuItem onClick={() => {
                      setTab(2);
                      handleDrawerRightToggle();
                      handleClose();
                    }}>Device settings</MenuItem>
                    <MenuItem onClick={() => {
                      // setTab(0);
                      handleClose();
                    }}>Grid View</MenuItem>
                  </Menu>
                </Toolbar>
              </AppBar>
              <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
              >
                <Drawer
                  variant={isMobileView ? "temporary" : "persistent"}
                  anchor="left"
                  sx={{
                    "& .MuiDrawer-paper": {
                      boxSizing: "border-box",
                      width: drawerWidth,
                    },
                  }}
                  open={leftDrawerOpen}
                  onClose={handleDrawerLeftToggle}
                >
                  <Roster />
                </Drawer>
                <Main rightopen={rightDrawerOpen} leftopen={leftDrawerOpen} mobileview={isMobileView}>
                <DrawerHeader />
                  <div className={cx("ClassRoom_left")}>
                    <div className={cx("ClassRoom_contentVideoWrapper")}>
                      <ContentVideo
                        onContentShareEnabled={onContentShareEnabled}
                      />
                    </div>
                    <div className={cx("ClassRoom_remoteVideoGroupWrapper")}>
                      <RemoteVideoGroup
                        viewMode={viewMode}
                        isContentShareEnabled={isContentShareEnabled}
                      />
                    </div>
                    <div className={cx("ClassRoom_localVideoWrapper")}>
                      <div className={cx("ClassRoom_localVideo")}>
                        <LocalVideo />
                      </div>
                    </div>
                  </div>
                </Main>
                <Drawer
                  variant={isMobileView ? "temporary" : "persistent"}
                  anchor="right"
                  sx={{
                    "& .MuiDrawer-paper": {
                      boxSizing: "border-box",
                      width: drawerWidth,
                    },
                  }}
                  open={rightDrawerOpen}
                  onClose={handleDrawerRightToggle}
                >
                  <ListItem>
                    <ListItemIcon onClick={() => {
                      setTab(0);
                      handleDrawerRightToggle();
                      handleClose();
                    }}>
                      <Avatar sx={{ bgcolor: '#FFF', border: '1px solid black', color:"black", cursor:'pointer'}}>
                        <ArrowBackIosNewSharpIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText>
                      <Typography variant="h5">
                      {tab === 1 && 'Chat'}
                    {tab === 2 && 'Device settings'}
                    {tab === 3 && 'Meeting info'}
                      </Typography>
                    </ListItemText>
                  </ListItem>
                  <Divider />
                  {tab === 1 && <Chat />}
                  {tab === 2 && <DeviceSwitcher />}
                  {tab === 3 && <CopyInfo />}
                </Drawer>
              </Box>
              <AppBar
                position="fixed"
                leftopen={leftDrawerOpen}
                rightopen={rightDrawerOpen}
                anchor="bottom"
                sx={{ height: "100px" }}
                mobileview={isMobileView}
                background={"#1a3551"}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "auto",
                  }}
                >
                  <Controls
                    viewMode={viewMode}
                    onClickShareButton={async () => {
                      try {
                        await chime?.audioVideo?.startContentShareFromScreenCapture();
                      } catch (err) {
                        console.log("err.....", err);
                      }
                    }}
                  />
                </Box>
              </AppBar>
            </Box>
          )}
        </Box>
      )}

      {/* {tryToReload && <div
      className={cx("ClassRoom_classroom", {
        ClassRoom_roomMode: viewMode === ViewMode.Room,
        ClassRoom_screenShareMode: viewMode === ViewMode.ScreenShare,
        isModeTransitioning,
        isContentShareEnabled,
      })}
    >
      {meetingStatus === MeetingStatus.Loading && <LoadingSpinner />}
      {meetingStatus === MeetingStatus.Failed && (
        <Error errorMessage={errorMessage} />
      )}
      {meetingStatus === MeetingStatus.Succeeded && (
        <>
          <>
            <div className={cx("ClassRoom_left")}>
              <div className={cx("ClassRoom_contentVideoWrapper")}>
                <ContentVideo onContentShareEnabled={onContentShareEnabled} />
              </div>
              <div className={cx("ClassRoom_remoteVideoGroupWrapper")}>
                <RemoteVideoGroup
                  viewMode={viewMode}
                  isContentShareEnabled={isContentShareEnabled}
                />
              </div>
              <div className={cx("ClassRoom_localVideoWrapper")}>
                <div className={cx("ClassRoom_controls")}>
                  <Controls
                    viewMode={viewMode}
                    onClickShareButton={async () => {
                      try {
                        await chime?.audioVideo?.startContentShareFromScreenCapture();
                      } catch (err) {
                        console.log("err.....", err);
                      }
                    }}
                  />
                </div>
                <div className={cx("ClassRoom_localVideo")}>
                  <LocalVideo />
                </div>
              </div>
            </div>

            <div className={cx("ClassRoom_right",{
              Classroom_right_none: !openRightBar
            })}>
              <div className={cx("ClassRoom_titleWrapper")}>
                <Tooltip
                    tooltip={intl.formatMessage({ id: 'Classroom.closeRightMenu' })}
                  >
                <div className={cx('ClassRoom_right_close')} onClick={() => setOpenRightBar(false)}><i className="fas fa-2x fa-times" /></div>
                </Tooltip>
                <div className={cx("ClassRoom_label")}>
                  <FormattedMessage id="Classroom.classroom" />
                </div>
                <CopyInfo />
              </div>
              <div className={cx("ClassRoom_deviceSwitcher")}>
                <DeviceSwitcher />
              </div>
              <div className={cx("ClassRoom_roster")}>
                <Roster />
              </div>
              <div className={cx("ClassRoom_chat")}>
                <Chat />
              </div>
            </div>
            
            {
              !openRightBar && (<Tooltip
                tooltip={intl.formatMessage({ id: 'Classroom.openRightMenu' })}
              >
                <div className={cx('ClassRoom_right_open')} onClick={() => setOpenRightBar(true)}><i className="fas fa-2x fa-bars" /></div>
              </Tooltip>  
              )
            }                    
          </>
        </>
      )}
    </div>} */}
    </>
  );
}
