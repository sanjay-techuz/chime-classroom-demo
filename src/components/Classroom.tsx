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
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowBackIosNewSharpIcon from "@mui/icons-material/ArrowBackIosNewSharp";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getMeetingStatusContext from "../context/getMeetingStatusContext";
import getGlobalVarContext from "../context/getGlobalVarContext";

// import getUIStateContext from "../context/getUIStateContext";
import ClassMode from "../enums/ClassMode";
import MeetingStatus from "../enums/MeetingStatus";
import ViewMode from "../enums/ViewMode";
// import useRemoteControl from "../hooks/useRemoteControl";
import Chat from "./Chat";
import styles from "./Classroom.css";
import ContentVideo from "./ContentVideo";
import Controls from "./Controls";
// import CopyInfo from "./CopyInfo";
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
import {
  useNotificationDispatch,
  Type as NotifType,
} from "../providers/NotificationProvider";
// import common from "../constants/common.json";

const cx = classNames.bind(styles);
const drawerWidth = 290;

var resizeTo = 0;
export default function Classroom() {
  Modal.setAppElement("body");
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  // const [state] = useContext(getUIStateContext());
  const intl = useIntl();
  const notifDispatch = useNotificationDispatch();

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
  const [isGridView, setIsGridView] = useState(false);
  const location = useLocation();
  const locationState = location?.state || null;

  // useRemoteControl();

  useEffect(() => {
    if(locationState){
      const { meetingName, meetingID, id, batchId, userName, mode, userID, duration, isRecording }: any = locationState;
      const teacherId =id;
      const info = {
        teacherId,
        meetingID,
        meetingName,
        batchId,
        userName,
        mode,
        userID,
        duration,
        isRecording
      }
      updateGlobalVar("userInfo",info);
      if(mode){
        updateGlobalVar("classMode", mode === "mp" ? ClassMode.Teacher : ClassMode.Student);
      }
    }
  },[locationState]);

  useEffect(() => {
    if(localStorage.getItem("screenSharePermit")){
      updateGlobalVar("screenSharePermit",JSON.parse(localStorage.getItem("screenSharePermit") as string));
    }
    if (window.innerWidth < 1100) {
      setIsMobileView(true);
      updateGlobalVar("isMobileView",true);
    } else {
      setIsMobileView(false);
      updateGlobalVar("isMobileView",false);
    }
    return () => {
      resizeTo = 0;
    };  
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
          const {meetingID, batchId, mode, userID }: any = location.state;
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

  const updateMobileView = () => {
    if (window.innerWidth < 1100) {
      setIsMobileView(true);
      updateGlobalVar("isMobileView",true);
    } else {
      setIsMobileView(false);
      updateGlobalVar("isMobileView",false);
    }
  }

  window.addEventListener("resize", () => {
    // We execute the same script as before
    if(resizeTo) clearTimeout(resizeTo);
    resizeTo = window.setTimeout(() => updateMobileView(), 500);

  });


  useEffect(() => {
    if(tab === 1){
      updateGlobalVar("isChatOpen", true);
    }else{
      updateGlobalVar("isChatOpen", false);
    }
  },[tab])



    // OBSERVE INTERNET CONNECTION
    const observer = {
      connectionDidBecomePoor: () => {
        notifDispatch({ type: NotifType.POOR_INTERNET_CONNECTION, payload: { message: intl.formatMessage({ id: "Classroom.poorConnection" })} });
        setTimeout(() => {
          notifDispatch({ type: NotifType.REMOVE_POOR_INTERNET_CONNECTION, payload: 'POOR_INTERNET_CONNECTION' });
        }, 15000);
      },
      connectionDidSuggestStopVideo: () => {
        notifDispatch({ type: NotifType.POOR_INTERNET_CONNECTION, payload: { message: intl.formatMessage({ id: "Classroom.poorConnection" })} });
        setTimeout(() => {
          notifDispatch({ type: NotifType.REMOVE_POOR_INTERNET_CONNECTION, payload: 'POOR_INTERNET_CONNECTION' });
        }, 15000);
      },
      videoSendDidBecomeUnavailable: () => {
        // Chime SDK allows a total of 25 simultaneous videos per meeting.
        // If you try to share more video, this method will be called.
        // See videoAvailabilityDidChange below to find out when it becomes available.
        notifDispatch({ type: NotifType.POOR_INTERNET_CONNECTION, payload: { message: intl.formatMessage({ id: "Classroom.videoTileLimitExceeded" })} });
        setTimeout(() => {
          notifDispatch({ type: NotifType.REMOVE_POOR_INTERNET_CONNECTION, payload: 'POOR_INTERNET_CONNECTION' });
        }, 10000);
      },
    };
  
    chime?.audioVideo?.addObserver(observer);

  const handleGridView = () => {
    setIsGridView(!isGridView);
    setIsScreenShareView(false);
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
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{ flexGrow: 1, textTransform: "capitalize" }}
                    component="div"
                    align="center"
                  >
                    {chime?.roster[activeSpeakerAttendeeId]?.name}
                  </Typography>
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
                        // handleClose();
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
                        {/* {tab === 3 && intl.formatMessage({ id: "Classroom.meetingInfo"})} */}
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
                  {/* {tab === 3 && <CopyInfo />} */}
                </Drawer>
              </Box>
              <AppBar
                position="fixed"
                leftopen={leftDrawerOpen}
                rightopen={rightDrawerOpen}
                anchor="bottom"
                sx={{ height: "82px" }}
                mobileview={isMobileView}
                background={"var(--secondary_blue_color)"}
                drawerWidth={drawerWidth}
              >
                <Controls
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
                  handleDrawerLeftToggle={handleDrawerLeftToggle}
                  handleGridView={handleGridView}
                  isGridView={isGridView}
                  leftDrawerOpen={leftDrawerOpen}
                />
              </AppBar>
            </Box>
          )}
        </Box>
      )}
    </>
  );
}
