// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Modal from "react-modal";
import { useIntl } from "react-intl";
import { useLocation } from "react-router-dom";

import {
  Box,
  Divider,
  Drawer,
} from "@mui/material";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getMeetingStatusContext from "../context/getMeetingStatusContext";
import getGlobalVarContext from "../context/getGlobalVarContext";

import ClassMode from "../enums/ClassMode";
import MeetingStatus from "../enums/MeetingStatus";
import ViewMode from "../enums/ViewMode";
import Chat from "./Chat";
import styles from "./Classroom.css";
import ContentVideo from "./ContentVideo";
import Controls from "./Controls";
import Error from "./Error";
import LoadingSpinner from "./LoadingSpinner";
import CheckMediaPermissions from "./CheckMediaPermissions";
import RemoteVideoGroup from "./RemoteVideoGroup";
import Roster from "./Roster";
import Main from "../custom/classroom/Main";
import AppBar from "../custom/classroom/AppBar";
import { attendanceWenhook } from "../services";
import {
  useNotificationDispatch,
  Type as NotifType,
} from "../providers/NotificationProvider";
import RosterSliderView from "./RosterSliderView";

const cx = classNames.bind(styles);
const drawerWidth = 360;

var resizeTo = 0;
export default function Classroom() {
  Modal.setAppElement("body");
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const intl = useIntl();
  const notifDispatch = useNotificationDispatch();

  const { updateGlobalVar } = useContext(getGlobalVarContext());
  const { meetingStatus, errorMessage } = useContext(getMeetingStatusContext());
  const [isContentShareEnabled, setIsContentShareEnabled] = useState(false);
  const [isScreenShareView, setIsScreenShareView] = useState(false);

  const [tryToReload, setTryToReload] = useState(true);
  const [viewMode, setViewMode] = useState(ViewMode.Room);
  const [isMobileView, setIsMobileView] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [openParticipants, setOpenParticipants] = useState(false);

  const [rightDrawerOpen, setRightDrawerOpen] = React.useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const location = useLocation();
  const locationState = location?.state || null;

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
    if(openParticipants && !openChat){
      closeDrawerRightToggle();
    }else{
      openDrawerRightToggle();
    }
    setOpenParticipants(!openParticipants);
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
    if(openChat){
      updateGlobalVar("isChatOpen", true);
    }else{
      updateGlobalVar("isChatOpen", false);
    }
  },[openChat])



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
              <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
              >                
                <Main
                  rightopen={rightDrawerOpen}
                  mobileview={isMobileView}
                  drawerWidth={drawerWidth}
                >
                  <div className={cx("ClassRoom_left")}>
                    <div
                      className={cx("ClassRoom_contentVideoWrapper", {
                        isContentShareEnabled,
                        screenShareView: !isScreenShareView,
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
                      {!isGridView ? <RosterSliderView 
                        viewMode={viewMode}
                        isContentShareEnabled={isContentShareEnabled}
                        isScreenShareView={isScreenShareView}
                        rightDrawerOpen={rightDrawerOpen}
                      /> :
                       <RemoteVideoGroup
                        viewMode={viewMode}
                        isContentShareEnabled={isContentShareEnabled}
                        isGridView={isGridView}
                        isScreenShareView={isScreenShareView}
                      /> }
                    </div>
                  </div>
                </Main>
                <Drawer
                  variant={"persistent"}
                  anchor="right"
                  sx={{
                    "& .MuiDrawer-paper": {
                      boxSizing: "border-box",
                        width: `calc(${drawerWidth}px - 16px)`,
                      right: "8px",
                      top: "8px",
                      bottom: "8px",
                      marginLeft: "8px",
                      borderRadius: "8px",
                      height: "calc(100% - 16px)",
                      overflow: "hidden",
                      backgroundColor: "var(--secondary_blue_color) !important",
                      color: "var(--pure_white_color) !important"
                    },
                  }}
                  open={rightDrawerOpen}
                  onClose={() => {
                    setOpenChat(false);
                    setOpenChat(false);
                    closeDrawerRightToggle();
                  }}
                >
                  <div style={{ width: "100%", height: "100%" }}>
                  {openParticipants && <div className={cx({
                        ClassRoom_chat_open_one: !openChat && openParticipants,
                        ClassRoom_chat_open_both: openChat && openParticipants
                    })}>
                      <Roster closeParticipantsPanel={handleDrawerLeftToggle}/>
                    </div>}
                    <Divider sx={{
                      margin: "auto",
                      borderColor: "rgb(77 76 76 / 80%)",
                      borderBottomWidth: "unset",
                    }}/>
                    <div
                      className={cx("ClassRoom_chat_parent_div", {
                        ClassRoom_chat_parent_div_open: openChat,
                        ClassRoom_chat_parent_div_close: !openChat,
                        ClassRoom_chat_open_one: openChat && !openParticipants,
                        ClassRoom_chat_open_both: openChat && openParticipants
                      })}
                    >
                      <Chat openParticipants={openParticipants} closeChatPanel={() => {
                        if(!openParticipants){
                        closeDrawerRightToggle();
                      }
                      setOpenChat(false);
                      }} />
                    </div>
                  </div>
                </Drawer>
              </Box>
              <AppBar
                position="fixed"
                rightopen={rightDrawerOpen}
                anchor="bottom"
                sx={{ height: "70px", width: `calc(100% - 16px)` }}
                mobileview={isMobileView}
                background={"var(--secondary_blue_color)"}
                drawerWidth={drawerWidth}
              >
                <Controls
                  openChat={openChat}
                  openParticipants={openParticipants}
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
                      setOpenChat(true);
                    } else {
                      if(!openParticipants){
                        closeDrawerRightToggle();
                      }
                      setOpenChat(false);
                    }
                  }}
                  handleDrawerLeftToggle={handleDrawerLeftToggle}
                  handleGridView={handleGridView}
                  isGridView={isGridView}
                />
              </AppBar>
            </Box>
          )}
        </Box>
      )}
    </>
  );
}
