// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Modal from "react-modal";

import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import ArrowBackIosNewSharpIcon from "@mui/icons-material/ArrowBackIosNewSharp";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getMeetingStatusContext from "../context/getMeetingStatusContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
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
import CheckMediaPermissions from "./CheckMediaPermissions";
import RemoteVideoGroup from "./RemoteVideoGroup";
import Roster from "./Roster";
import Main from "../custom/classroom/Main";
import AppBar from "../custom/classroom/AppBar";
import DrawerHeader from "../custom/classroom/DrawerHeader";

const cx = classNames.bind(styles);
const drawerWidth = 290;

export default function Classroom() {
  Modal.setAppElement("body");
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [state] = useContext(getUIStateContext());
  const { globalVar } = useContext(getGlobalVarContext());
  const { activeSpeakerAttendeeId } = globalVar;
  const { meetingStatus, errorMessage } = useContext(getMeetingStatusContext());
  const [isContentShareEnabled, setIsContentShareEnabled] = useState(false);
  const [isScreenShareView, setIsScreenShareView] = useState(false);

  const [tryToReload, setTryToReload] = useState(true);
  const [viewMode, setViewMode] = useState(ViewMode.Room);
  const [isMobileView, setIsMobileView] = useState(false);
  const [tab, setTab] = useState(0);
  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isGridView, setIsGridView] = useState(false);
  const open = Boolean(anchorEl);

  useRemoteControl();

  useEffect(() => {
    if (window.innerWidth < 600) {
      setIsMobileView(true);
    } else {
      setIsMobileView(false);
    }
  }, []);

  const stopContentShare = async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    try {
      chime?.audioVideo?.stopContentShare();
    } catch (error) {
      // eslint-disable-next-line
      console.error(error);
    } finally {
      setViewMode(ViewMode.Room);
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
      setIsScreenShareView(enabled);
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

  const openDrawerRightToggle = () => {
    setRightDrawerOpen(true);
  };

  const closeDrawerRightToggle = () => {
    setRightDrawerOpen(false);
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
        <Box sx={{ display: "flex", width: "100%", height: "100%" }}>
          {meetingStatus === MeetingStatus.Loading && <LoadingSpinner />}
          {meetingStatus === MeetingStatus.Failed && (
            <Error errorMessage={errorMessage} />
          )}
          {meetingStatus === MeetingStatus.Succeeded && (
            <Box sx={{ display: "flex", width: "100%", height: "100%" }}>
              <AppBar
                position="fixed"
                leftopen={leftDrawerOpen}
                rightopen={rightDrawerOpen}
                anchor="top"
                mobileview={isMobileView}
                background={"#142230"}
                drawerWidth={drawerWidth}
              >
                <Toolbar>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerLeftToggle}
                  >
                    {leftDrawerOpen && <KeyboardArrowLeftIcon />}
                    <PeopleAltOutlinedIcon />
                    {!leftDrawerOpen && <KeyboardArrowRightIcon />}
                  </IconButton>
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{ flexGrow: 1, textTransform: "capitalize" }}
                    component="div"
                    align="center"
                  >
                    {chime?.roster[activeSpeakerAttendeeId]?.name}
                  </Typography>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="end"
                    // onClick={handleDrawerRightToggle}
                    onClick={handleClick}
                  >
                    <Avatar
                      sx={{ bgcolor: "#142230", border: "1px solid #FFF" }}
                    >
                      <MoreVertOutlinedIcon />
                    </Avatar>
                  </IconButton>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "basic-button",
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        setTab(3);
                        openDrawerRightToggle();
                        handleClose();
                      }}
                    >
                      Meeting info
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setTab(2);
                        openDrawerRightToggle();
                        handleClose();
                      }}
                    >
                      Device settings
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        // setTab(0);
                        setIsGridView(!isGridView);
                        setIsScreenShareView(false);
                        handleClose();
                      }}
                    >
                      {isGridView ? "Active speaker view" : "Grid view"}
                    </MenuItem>
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
                <Main
                  rightopen={rightDrawerOpen}
                  leftopen={leftDrawerOpen}
                  mobileview={isMobileView}
                  drawerWidth={drawerWidth}
                >
                  <DrawerHeader />
                  <div className={cx("ClassRoom_left")}>
                    <div
                      className={cx("ClassRoom_contentVideoWrapper", {
                        isContentShareEnabled,
                        screenShareView: !isScreenShareView,
                        screenShareViewDrawerOpen:
                          !isScreenShareView && leftDrawerOpen,
                      })}
                      onClick={() => {
                        setIsScreenShareView(true);
                        setIsGridView(false);
                      }}
                    >
                      <ContentVideo
                        onContentShareEnabled={onContentShareEnabled}
                      />
                    </div>
                    <div className={cx("ClassRoom_remoteVideoGroupWrapper")}>
                      <RemoteVideoGroup
                        viewMode={viewMode}
                        isContentShareEnabled={isContentShareEnabled}
                        isGridView={isGridView}
                        isScreenShareView={isScreenShareView}
                      />
                    </div>
                    {/* <div className={cx("ClassRoom_localVideoWrapper")}>
                      <div className={cx("ClassRoom_localVideo")}>
                        <LocalVideo />
                      </div>
                    </div> */}
                  </div>
                </Main>
                <Drawer
                  variant={isMobileView ? "temporary" : "persistent"}
                  anchor="right"
                  sx={{
                    "& .MuiDrawer-paper": {
                      boxSizing: "border-box",
                      width: drawerWidth,
                      overflow: "hidden",
                    },
                  }}
                  open={rightDrawerOpen}
                  onClose={() => {
                    setTab(0);
                    closeDrawerRightToggle();
                  }}
                >
                  <ListItem>
                    <ListItemIcon
                      onClick={() => {
                        setTab(0);
                        closeDrawerRightToggle();
                        handleClose();
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "#FFF",
                          border: "1px solid black",
                          color: "black",
                          cursor: "pointer",
                        }}
                      >
                        <ArrowBackIosNewSharpIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText>
                      <Typography variant="h5">
                        {tab === 1 && "Chat"}
                        {tab === 2 && "Device settings"}
                        {tab === 3 && "Meeting info"}
                      </Typography>
                    </ListItemText>
                  </ListItem>
                  <Divider />
                  <div
                    className={cx("ClassRoom_chat_parent_div", {
                      ClassRoom_chat_parent_div_open: tab === 1,
                      ClassRoom_chat_parent_div_close: tab !== 1,
                    })}
                  >
                    <Chat />
                  </div>
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
                drawerWidth={drawerWidth}
              >
                {/* <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "auto",
                  }}
                > */}
                <Controls
                  viewMode={viewMode}
                  tab={tab}
                  onClickShareButton={async (flag: boolean) => {
                    try {
                      if (flag) {
                        await chime?.audioVideo?.startContentShareFromScreenCapture();
                      } else {
                        await chime?.audioVideo?.stopContentShare();
                      }
                    } catch (err) {
                      console.log("err.....", err);
                    }
                  }}
                  onClickChatButton={(flag: boolean) => {
                    if (flag) {
                      openDrawerRightToggle();
                      setTab(1);
                    } else {
                      closeDrawerRightToggle();
                      setTab(0);
                    }
                  }}
                />
                {/* </Box> */}
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
