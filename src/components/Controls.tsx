// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router-dom";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  MenuItem,
  Popover,
  Tooltip,
} from "@mui/material";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import KeyboardVoiceOutlinedIcon from "@mui/icons-material/KeyboardVoiceOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import ScreenShareOutlinedIcon from "@mui/icons-material/ScreenShareOutlined";
import StopScreenShareOutlinedIcon from "@mui/icons-material/StopScreenShareOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
// import RadioButtonCheckedOutlinedIcon from "@mui/icons-material/RadioButtonCheckedOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import CommentIcon from "@mui/icons-material/Comment";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import routes from "../constants/routes.json";
// import common from "../constants/common.json";
import getChimeContext from "../context/getChimeContext";
// import getUIStateContext from "../context/getUIStateContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
import ClassMode from "../enums/ClassMode";
import ViewMode from "../enums/ViewMode";
import MessageTopic from "../enums/MessageTopic";
// import { startRecording, stopRecording } from "../services";
import SmallAvatar from "../custom/roster/SmallAvatar";
import { attendanceWenhook } from "../services";
import MoreSettings from "./MoreSettings";

enum VideoStatus {
  Disabled,
  Loading,
  Enabled,
}

type Props = {
  viewMode: ViewMode;
  onClickShareButton: (flag: boolean) => void;
  onClickChatButton: (flag: boolean) => void;
  handleDrawerLeftToggle: () => void;
  handleGridView: () => void;
  isGridView: boolean;
  leftDrawerOpen: boolean;
  tab: number;
};

export default function Controls(props: Props) {
  const {
    viewMode,
    onClickShareButton,
    onClickChatButton,
    tab,
    handleDrawerLeftToggle,
    handleGridView,
    isGridView,
    leftDrawerOpen,
  } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { globalVar } = useContext(getGlobalVarContext());
  const {
    localVideo,
    groupChatCounter,
    userInfo,
    classMode,
    screenSharePermit,
  } = globalVar;
  // const [state] = useContext(getUIStateContext());
  const history = useHistory();
  const [muted, setMuted] = useState(false);
  const [focus, setFocus] = useState(false);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [openScreenSharePermit, setOpenScreenSharePermit] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  // const [recording, setRecording] = useState(false);
  // const [mediaPipelineId, setMediaPipelineId] = useState("");
  const [videoStatus, setVideoStatus] = useState(VideoStatus.Disabled);
  const intl = useIntl();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const callback = (localMuted: boolean) => {
      setMuted(localMuted);
    };

    const screenShareCb = {
      contentShareDidStart: () => {
        setIsScreenShared(true);
      },
      contentShareDidStop: () => {
        setIsScreenShared(false);
      },
    };

    chime?.audioVideo?.realtimeSubscribeToMuteAndUnmuteLocalAudio(callback);
    chime?.audioVideo?.addContentShareObserver(screenShareCb);
    return () => {
      if (chime && chime?.audioVideo) {
        chime?.audioVideo?.realtimeUnsubscribeToMuteAndUnmuteLocalAudio(
          callback
        );
        chime?.audioVideo?.removeContentShareObserver(screenShareCb);
      }
    };
  }, []);

  useEffect(() => {
    if (tab === 1) {
      setOpenChat(true);
    } else {
      setOpenChat(false);
    }
  }, [tab]);

  useEffect(() => {
    setVideoStatus(localVideo ? VideoStatus.Enabled : VideoStatus.Disabled);
  }, [localVideo]);

  // const handleRecording = async () => {
  //   setRecording(!recording);
  //   if (recording) {
  //     try {
  //       const result = await stopRecording(mediaPipelineId);
  //       console.log(result);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   } else {
  //     try {
  //       const result = await startRecording(chime?.meetingId as string);
  //       console.log(result);
  //       setMediaPipelineId(result.MediaPipelineId);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }
  // };

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseScreenShareDialog = () => {
    setOpenScreenSharePermit(false);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "auto",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-around",
          m: 1,
          p: 1,
          maxWidth: 500,
        }}
      >
        {classMode === ClassMode.Teacher && viewMode === ViewMode.Room && (
          <Tooltip
            title={
              focus
                ? intl.formatMessage({ id: "Controls.turnOffFocusTooltip" })
                : intl.formatMessage({ id: "Controls.turnOnFocusTooltip" })
            }
            placement="bottom"
          >
            <Avatar
              onClick={() => {
                const newFocusState = !focus;
                chime?.sendMessage(MessageTopic.Focus, {
                  focus: newFocusState,
                });
                setFocus(newFocusState);
              }}
              sx={
                focus
                  ? {
                      bgcolor: "var(--pure_white_color)",
                      border: "1px solid var(--secondary_blue_color)",
                      color: "var(--secondary_blue_color)",
                      cursor: "pointer",
                    }
                  : {
                      bgcolor: "var(--secondary_blue_color)",
                      border: "1px solid var(--pure_white_color)",
                      color: "var(--pure_white_color)",
                      cursor: "pointer",
                    }
              }
            >
              <AutoModeIcon />
            </Avatar>
          </Tooltip>
        )}
        <Tooltip
          title={
            muted
              ? intl.formatMessage({ id: "Controls.unmuteTooltip" })
              : intl.formatMessage({ id: "Controls.muteTooltip" })
          }
          placement="bottom"
        >
          <Avatar
            onClick={async () => {
              if (muted) {
                chime?.audioVideo?.realtimeUnmuteLocalAudio();
              } else {
                chime?.audioVideo?.realtimeMuteLocalAudio();
              }
              // Adds a slight delay to close the tooltip before rendering the updated text in it
              await new Promise((resolve) => setTimeout(resolve, 10));
            }}
            sx={
              muted
                ? {
                    bgcolor: "var(--pure_white_color)",
                    border: "1px solid var(--secondary_blue_color)",
                    color: "var(--secondary_blue_color)",
                    cursor: "pointer",
                  }
                : {
                    bgcolor: "var(--secondary_blue_color)",
                    border: "1px solid var(--pure_white_color)",
                    color: "var(--pure_white_color)",
                    cursor: "pointer",
                  }
            }
          >
            {muted ? <MicOffOutlinedIcon /> : <KeyboardVoiceOutlinedIcon />}
          </Avatar>
        </Tooltip>

        <Tooltip
          title={
            videoStatus === VideoStatus.Disabled
              ? intl.formatMessage({ id: "Controls.turnOnVideoTooltip" })
              : intl.formatMessage({ id: "Controls.turnOffVideoTooltip" })
          }
          placement="bottom"
        >
          <Avatar
            onClick={async () => {
              // Adds a slight delay to close the tooltip before rendering the updated text in it
              await new Promise((resolve) => setTimeout(resolve, 10));
              if (videoStatus === VideoStatus.Disabled) {
                setVideoStatus(VideoStatus.Loading);
                try {
                  if (!chime?.currentVideoInputDevice) {
                    throw new Error("currentVideoInputDevice does not exist");
                  }
                  await chime?.chooseVideoInputDevice(
                    chime?.currentVideoInputDevice
                  );
                  chime?.audioVideo?.startLocalVideoTile();
                  setVideoStatus(VideoStatus.Enabled);
                } catch (error) {
                  // eslint-disable-next-line
                  console.error(error);
                  setVideoStatus(VideoStatus.Disabled);
                }
              } else if (videoStatus === VideoStatus.Enabled) {
                setVideoStatus(VideoStatus.Loading);
                chime?.audioVideo?.stopLocalVideoTile();
                setVideoStatus(VideoStatus.Disabled);
              }
            }}
            sx={
              videoStatus === VideoStatus.Enabled
                ? {
                    bgcolor: "var(--pure_white_color)",
                    border: "1px solid var(--secondary_blue_color)",
                    color: "var(--secondary_blue_color)",
                    cursor: "pointer",
                  }
                : {
                    bgcolor: "var(--secondary_blue_color)",
                    border: "1px solid var(--pure_white_color)",
                    color: "var(--pure_white_color)",
                    cursor: "pointer",
                  }
            }
          >
            {videoStatus === VideoStatus.Enabled ? (
              <VideocamOutlinedIcon />
            ) : (
              <VideocamOffOutlinedIcon />
            )}
          </Avatar>
        </Tooltip>

        <Tooltip
          title={intl.formatMessage({ id: "Controls.Chat" })}
          placement="bottom"
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            badgeContent={
              <SmallAvatar
                sx={{
                  display: groupChatCounter === 0 ? "none" : "flex",
                  fontSize: groupChatCounter <= 99 ? "1rem" : "0.6rem",
                }}
                bgcolor={"var(--color_pink)"}
              >
                {groupChatCounter <= 99 ? groupChatCounter : "99+"}
              </SmallAvatar>
            }
          >
            <Avatar
              onClick={() => {
                if (!openChat) {
                  onClickChatButton(true);
                  setOpenChat(true);
                } else {
                  onClickChatButton(false);
                  setOpenChat(false);
                }
              }}
              sx={
                openChat
                  ? {
                      bgcolor: "var(--pure_white_color)",
                      border: "1px solid var(--secondary_blue_color)",
                      color: "var(--secondary_blue_color)",
                      cursor: "pointer",
                    }
                  : {
                      bgcolor: "var(--secondary_blue_color)",
                      border: "1px solid var(--pure_white_color)",
                      color: "var(--pure_white_color)",
                      cursor: "pointer",
                    }
              }
            >
              {openChat ? <CommentOutlinedIcon /> : <CommentIcon />}
            </Avatar>
          </Badge>
        </Tooltip>

        <Tooltip
          title={intl.formatMessage({ id: "Controls.participants" })}
          placement="bottom"
        >
          <Avatar
            onClick={handleDrawerLeftToggle}
            sx={
              leftDrawerOpen
                ? {
                    bgcolor: "var(--pure_white_color)",
                    border: "1px solid var(--secondary_blue_color)",
                    color: "var(--secondary_blue_color)",
                    cursor: "pointer",
                  }
                : {
                    bgcolor: "var(--secondary_blue_color)",
                    border: "1px solid var(--pure_white_color)",
                    color: "var(--pure_white_color)",
                    cursor: "pointer",
                  }
            }
          >
            <PeopleAltOutlinedIcon />
          </Avatar>
        </Tooltip>

        <MoreSettings handleGridView={handleGridView} isGridView={isGridView} />

        <Dialog
          open={openScreenSharePermit}
          onClose={handleCloseScreenShareDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {intl.formatMessage({
                id: "Controls.screenSharePermitDialogMessage",
              })}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseScreenShareDialog} autoFocus>
              {intl.formatMessage({ id: "Controls.dialogOk" })}
            </Button>
          </DialogActions>
        </Dialog>

        {
          <Tooltip
            title={
              isScreenShared
                ? intl.formatMessage({ id: "Controls.shareScreenStopTooltip" })
                : intl.formatMessage({ id: "Controls.shareScreenTooltip" })
            }
            placement="bottom"
          >
            <Avatar
              onClick={() => {
                if (classMode === ClassMode.Teacher || screenSharePermit) {
                  if (!isScreenShared) {
                    onClickShareButton(true);
                  } else {
                    onClickShareButton(false);
                  }
                } else {
                  setOpenScreenSharePermit(true);
                }
              }}
              sx={
                isScreenShared
                  ? {
                      bgcolor: "var(--pure_white_color)",
                      border: "1px solid var(--secondary_blue_color)",
                      color: "var(--secondary_blue_color)",
                      cursor: "pointer",
                    }
                  : {
                      bgcolor: "var(--secondary_blue_color)",
                      border: "1px solid var(--pure_white_color)",
                      color: "var(--pure_white_color)",
                      cursor: "pointer",
                    }
              }
            >
              {isScreenShared ? (
                <StopScreenShareOutlinedIcon />
              ) : (
                <ScreenShareOutlinedIcon />
              )}
            </Avatar>
          </Tooltip>
        }
        {/* {classMode === ClassMode.Teacher && (
          <Tooltip
            title={
              recording
                ? intl.formatMessage({
                    id: "Controls.stopRecordingScreenTooltip",
                  })
                : intl.formatMessage({
                    id: "Controls.startRecordingScreenTooltip",
                  })
            }
          >
            <Avatar
              onClick={() => {
                handleRecording();
              }}
              sx={
                recording
                  ? {
                      bgcolor: "var(--pure_white_color)",
                      border: "1px solid var(--secondary_blue_color)",
                      color: "var(--color_pink)",
                      cursor: "pointer",
                    }
                  : {
                      bgcolor: "var(--secondary_blue_color)",
                      border: "1px solid var(--pure_white_color)",
                      color: "var(--pure_white_color)",
                      cursor: "pointer",
                    }
              }
            >
              <RadioButtonCheckedOutlinedIcon />
            </Avatar>
          </Tooltip>
        )} */}
        <Popover
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          {classMode === ClassMode.Teacher && (
            <MenuItem
              onClick={() => {
                chime?.leaveRoom(true);
                history.push(`${routes.MAIN}?id=${userInfo.teacherId}`);
                // window.location.href = `${common.domain}complete?id=${userInfo.teacherId}`;
              }}
            >
              {intl.formatMessage({ id: "Controls.EndMeeting" })}
            </MenuItem>
          )}
          <MenuItem
            onClick={async () => {
              if (classMode !== ClassMode.Teacher) {
                const webhookRes = {
                  meetingId: userInfo.meetingID,
                  internal_meeting_id: chime?.meetingId || "",
                  user_id: userInfo.userID,
                  batch_id: userInfo.batchId,
                  isJoin: false,
                };

                console.log("🏣🏣🏣🏣", webhookRes);
                await attendanceWenhook(webhookRes);
              }
              chime?.leaveRoom(false);
              history.push(routes.MAIN);
              // window.location.href = `${common.domain}complete`;
            }}
          >
            {intl.formatMessage({ id: "Controls.LeaveMeeting" })}
          </MenuItem>
        </Popover>
        <Tooltip
          title={
            classMode === ClassMode.Teacher
              ? intl.formatMessage({ id: "Controls.endClassroomTooltip" })
              : intl.formatMessage({ id: "Controls.leaveClassroomTooltip" })
          }
          placement="bottom"
        >
          <Avatar
            onClick={handleClick}
            sx={{
              bgcolor: "var(--color_thunderbird)",
              // border: "1px solid var(--pure_white_color)",
              color: "var(--pure_white_color)",
              cursor: "pointer",
            }}
          >
            <CallOutlinedIcon />
          </Avatar>
        </Tooltip>
      </Box>
    </Box>
  );
}
