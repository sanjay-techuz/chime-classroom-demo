// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { useIntl } from "react-intl";
import { useLocation } from "react-router-dom";

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
// import getUIStateContext from "../context/getUIStateContext";
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
import { attendanceWenhook } from "../services";
// import common from "../constants/common.json";

const cx = classNames.bind(styles);
const drawerWidth = 290;

export default function Classroom() {
  Modal.setAppElement("body");
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  // const [state] = useContext(getUIStateContext());
  const intl = useIntl();

  const { globalVar, updateGlobalVar } = useContext(getGlobalVarContext());
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
  const [enterFullScreen, setEnterFullScreen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isGridView, setIsGridView] = useState(false);
  const open = Boolean(anchorEl);
  const query = new URLSearchParams(useLocation().search);
  const teacherId = query.get("id") || "";
  const meetingName = query.get('meetingName') || query.get('meetingID') || "";
  const meetingID = query.get('meetingID') || "";
  const batchId = query.get('batchId') || "";
  const userName = query.get('userName') || "";
  const mode = query.get('mode') || "";
  const userID = query.get('userID') || "";
  const duration = query.get('duration') || "";

  useRemoteControl();

  useEffect(() => {
    const info = {
      teacherId,
      meetingID,
      meetingName,
      batchId,
      userName,
      mode,
      userID,
      duration
    }
    updateGlobalVar("userInfo",info);
    if(mode){
      updateGlobalVar("classMode", mode === "mp" ? ClassMode.Teacher : ClassMode.Student);
    }
  },[meetingID]);

  useEffect(() => {
    if (window.innerWidth < 1100) {
      setIsMobileView(true);
      updateGlobalVar("isMobileView",true);
    } else {
      setIsMobileView(false);
      updateGlobalVar("isMobileView",false);
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


  if (process.env.NODE_ENV === 'production') {
    useEffect(() => {
      // Recommend using "onbeforeunload" over "addEventListener"
      window.onbeforeunload = async (event: BeforeUnloadEvent) => {
        // Prevent the window from closing immediately
        // eslint-disable-next-line
        event.preventDefault();
        event.returnValue = true;
        try {
          if(mode !== "mp"){
            const webhookRes = {
              meetingId: meetingID,
              internal_meeting_id: chime?.meetingId || "",
              user_id: userID,
              batch_id: batchId,
              isJoin: false
            }
            
            console.log("🏣🏣🏣🏣",webhookRes)
            await attendanceWenhook(webhookRes);
          }
          await chime?.leaveRoom(false);
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

    if (window.innerWidth < 1100) {
      setIsMobileView(true);
      updateGlobalVar("isMobileView",true);
    } else {
      setIsMobileView(false);
      updateGlobalVar("isMobileView",false);
    }
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if(tab === 1){
      updateGlobalVar("isChatOpen", true);
    }else{
      updateGlobalVar("isChatOpen", false);
    }
  },[tab])

  document.addEventListener('fullscreenchange', exitHandler, false);
  document.addEventListener('mozfullscreenchange', exitHandler, false);
  document.addEventListener('MSFullscreenChange', exitHandler, false);
  document.addEventListener('webkitfullscreenchange', exitHandler, false);
  document.addEventListener('keydown',(event)=>{
    if (event.which == 122) {
      event.preventDefault();
      exitHandler
  }
  });

  function exitHandler(){
    const element:any = document;
    if (element.webkitIsFullScreen === false){
      setEnterFullScreen(false);
    }else if (element.mozFullScreen === false){
      setEnterFullScreen(false);
    }else if (element.msFullscreenElement === false){
      setEnterFullScreen(false);
    }
    } 

  const handleFullScreen = () => {
    if(enterFullScreen){
      setEnterFullScreen(false);
      const docWithBrowsersExitFunctions = document as Document & {
        mozCancelFullScreen(): Promise<void>;
        webkitExitFullscreen(): Promise<void>;
        msExitFullscreen(): Promise<void>;
      };
      if (docWithBrowsersExitFunctions.exitFullscreen) {
        docWithBrowsersExitFunctions.exitFullscreen();
      } else if (docWithBrowsersExitFunctions.mozCancelFullScreen) { /* Firefox */
        docWithBrowsersExitFunctions.mozCancelFullScreen();
      } else if (docWithBrowsersExitFunctions.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        docWithBrowsersExitFunctions.webkitExitFullscreen();
      } else if (docWithBrowsersExitFunctions.msExitFullscreen) { /* IE/Edge */
        docWithBrowsersExitFunctions.msExitFullscreen();
      }
    }else{
      setEnterFullScreen(true);
      const docElmWithBrowsersFullScreenFunctions = document.documentElement as HTMLElement & {
        mozRequestFullScreen(): Promise<void>;
        webkitRequestFullscreen(): Promise<void>;
        msRequestFullscreen(): Promise<void>;
      };
    
      if (docElmWithBrowsersFullScreenFunctions.requestFullscreen) {
        docElmWithBrowsersFullScreenFunctions.requestFullscreen();
      } else if (docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen) { /* Firefox */
        docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen();
      } else if (docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen();
      } else if (docElmWithBrowsersFullScreenFunctions.msRequestFullscreen) { /* IE/Edge */
        docElmWithBrowsersFullScreenFunctions.msRequestFullscreen();
      }
    
    }
    handleClose();
  }

  return (
    <>
      <CheckMediaPermissions
        isRetry={() => {
          setTryToReload(false);
          setTryToReload(true);
        }}
      />
      {tryToReload && (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
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
                background={"var(--primary_blue_color)"}
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
                      sx={{
                        bgcolor: "var(--primary_blue_color)",
                        border: "1px solid var(--pure_white_color)",
                      }}
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
                      {intl.formatMessage({ id: "Classroom.meetingInfo"})}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setTab(2);
                        openDrawerRightToggle();
                        handleClose();
                      }}
                    >
                      {intl.formatMessage({ id: "Classroom.deviceSettings"})}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setIsGridView(!isGridView);
                        setIsScreenShareView(false);
                        handleClose();
                      }}
                    >
                      {isGridView ? intl.formatMessage({ id: "Classroom.activeSpeakerView"}) : intl.formatMessage({ id: "Classroom.gridView"})}
                    </MenuItem>
                    <MenuItem
                      onClick={handleFullScreen}
                    >
                      {enterFullScreen ? intl.formatMessage({ id: "Classroom.exitFullScreen"}) : intl.formatMessage({ id: "Classroom.fullScreen"})}
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
                  </div>
                </Main>
                <Drawer
                  variant={"persistent"}
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
                          bgcolor: "var(--pure_white_color)",
                          border: "1px solid var(--color_black)",
                          color: "var(--color_black)",
                          cursor: "pointer",
                        }}
                      >
                        <ArrowBackIosNewSharpIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText>
                      <Typography variant="h5">
                        {tab === 1 && intl.formatMessage({ id: "Classroom.chat"})}
                        {tab === 2 && intl.formatMessage({ id: "Classroom.deviceSettings"})}
                        {tab === 3 && intl.formatMessage({ id: "Classroom.meetingInfo"})}
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
                background={"var(--secondary_blue_color)"}
                drawerWidth={drawerWidth}
              >
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
              </AppBar>
            </Box>
          )}
        </Box>
      )}
    </>
  );
}
