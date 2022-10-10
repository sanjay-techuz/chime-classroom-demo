// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router-dom";

import {
  Avatar,
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import KeyboardVoiceOutlinedIcon from "@mui/icons-material/KeyboardVoiceOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import ScreenShareOutlinedIcon from "@mui/icons-material/ScreenShareOutlined";
import StopScreenShareOutlinedIcon from "@mui/icons-material/StopScreenShareOutlined";
import RadioButtonCheckedOutlinedIcon from "@mui/icons-material/RadioButtonCheckedOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import CommentIcon from "@mui/icons-material/Comment";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import routes from "../constants/routes.json";
import getChimeContext from "../context/getChimeContext";
import getUIStateContext from "../context/getUIStateContext";
import getGlobalVarContext from '../context/getGlobalVarContext';
import ClassMode from "../enums/ClassMode";
import ViewMode from "../enums/ViewMode";
import styles from "./Controls.css";
// import Tooltip from './Tooltip';
import MessageTopic from "../enums/MessageTopic";
import { startRecording, stopRecording } from "../services";
import localStorageKeys from "../constants/localStorageKeys.json";
import { pink } from "@mui/material/colors";

const cx = classNames.bind(styles);

enum VideoStatus {
  Disabled,
  Loading,
  Enabled,
}

type Props = {
  viewMode: ViewMode;
  onClickShareButton: (flag: boolean) => void;
  onClickChatButton: (flag: boolean) => void;
  tab: number;
};

export default function Controls(props: Props) {
  const { viewMode, onClickShareButton, onClickChatButton, tab } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { globalVar } = useContext(getGlobalVarContext());
  const [state] = useContext(getUIStateContext());
  const history = useHistory();
  const [muted, setMuted] = useState(false);
  const [focus, setFocus] = useState(false);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaPipelineId, setMediaPipelineId] = useState("");
  const [videoStatus, setVideoStatus] = useState(VideoStatus.Disabled);
  const intl = useIntl();

  useEffect(() => {
    const callback = (localMuted: boolean) => {
      setMuted(localMuted);
    };
    chime?.audioVideo?.realtimeSubscribeToMuteAndUnmuteLocalAudio(callback);
    return () => {
      if (chime && chime?.audioVideo) {
        chime?.audioVideo?.realtimeUnsubscribeToMuteAndUnmuteLocalAudio(
          callback
        );
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
    const localVideo = globalVar?.localVideo;
    setVideoStatus(localVideo ? VideoStatus.Enabled : VideoStatus.Disabled)
  },[globalVar])

  const handleRecording = async () => {
    setRecording(!recording);
    if (recording) {
      try {
        const result = await stopRecording(mediaPipelineId);
        console.log(result);
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const result = await startRecording(chime?.meetingId);
        console.log(result);
        setMediaPipelineId(result.MediaPipelineId);
      } catch (err) {
        console.error(err);
      }
    }
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
        {state.classMode === ClassMode.Teacher && viewMode === ViewMode.Room && (
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
                const msgObject = {
                  sendingMessage: newFocusState
                    ? intl.formatMessage({ id: "Controls.focusOnMessage" })
                    : intl.formatMessage({ id: "Controls.focusOffMessage" }),
                  channel: MessageTopic.PublicChannel,
                };
                chime?.sendMessage(
                  MessageTopic.GroupChat,
                  JSON.stringify(msgObject)
                );
                setFocus(newFocusState);
              }}
              sx={
                focus
                  ? {
                      bgcolor: "#FFF",
                      border: "1px solid #1a3551",
                      color: "#1a3551",
                      cursor: "pointer",
                    }
                  : {
                      bgcolor: "#1a3551",
                      border: "1px solid #FFF",
                      color: "#FFF",
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
                    bgcolor: "#FFF",
                    border: "1px solid #1a3551",
                    color: "#1a3551",
                    cursor: "pointer",
                  }
                : {
                    bgcolor: "#1a3551",
                    border: "1px solid #FFF",
                    color: "#FFF",
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
                    bgcolor: "#FFF",
                    border: "1px solid #1a3551",
                    color: "#1a3551",
                    cursor: "pointer",
                  }
                : {
                    bgcolor: "#1a3551",
                    border: "1px solid #FFF",
                    color: "#FFF",
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
                    bgcolor: "#FFF",
                    border: "1px solid #1a3551",
                    color: "#1a3551",
                    cursor: "pointer",
                  }
                : {
                    bgcolor: "#1a3551",
                    border: "1px solid #FFF",
                    color: "#FFF",
                    cursor: "pointer",
                  }
            }
          >
            {openChat ? <CommentOutlinedIcon /> : <CommentIcon />}
          </Avatar>
        </Tooltip>

        {viewMode !== ViewMode.ScreenShare && (
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
                if (!isScreenShared) {
                  onClickShareButton(true);
                  setIsScreenShared(true);
                } else {
                  onClickShareButton(false);
                  setIsScreenShared(false);
                }
              }}
              sx={
                isScreenShared
                  ? {
                      bgcolor: "#FFF",
                      border: "1px solid #1a3551",
                      color: "#1a3551",
                      cursor: "pointer",
                    }
                  : {
                      bgcolor: "#1a3551",
                      border: "1px solid #FFF",
                      color: "#FFF",
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
        )}
        {state.classMode === ClassMode.Teacher && (
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
                      bgcolor: "#FFF",
                      border: "1px solid #1a3551",
                      color: pink[500],
                      cursor: "pointer",
                    }
                  : {
                      bgcolor: "#1a3551",
                      border: "1px solid #FFF",
                      color: "#FFF",
                      cursor: "pointer",
                    }
              }
            >
              <RadioButtonCheckedOutlinedIcon />
            </Avatar>
          </Tooltip>
        )}
        <Tooltip
          title={
            state.classMode === ClassMode.Teacher
              ? intl.formatMessage({ id: "Controls.endClassroomTooltip" })
              : intl.formatMessage({ id: "Controls.leaveClassroomTooltip" })
          }
          placement="bottom"
        >
          <Avatar
            onClick={() => {
              chime?.leaveRoom(state.classMode === ClassMode.Teacher);
              history.push(routes.HOME);
            }}
            sx={{
              bgcolor: "#1a3551",
              border: "1px solid #FFF",
              color: "#FFF",
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
