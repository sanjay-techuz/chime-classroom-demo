// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import classNames from "classnames/bind";

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
// import AutoModeIcon from "@mui/icons-material/AutoMode";
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
// import ViewMode from "../enums/ViewMode";
// import MessageTopic from "../enums/MessageTopic";
// import { startRecording, stopRecording } from "../services";
import SmallAvatar from "../custom/roster/SmallAvatar";
import { attendanceWenhook } from "../services";
import MoreSettings from "./MoreSettings";
import styles from "./Controls.css";

const cx = classNames.bind(styles);

enum VideoStatus {
  Disabled,
  Loading,
  Enabled,
}

type Props = {
  onClickShareButton: (flag: boolean) => void;
  onClickChatButton: (flag: boolean) => void;
  handleDrawerLeftToggle: () => void;
  handleGridView: () => void;
  isGridView: boolean;
  openParticipants: boolean;
  openChat: boolean;
};

export default function Controls(props: Props) {
  const {
    onClickShareButton,
    onClickChatButton,
    openChat,
    handleDrawerLeftToggle,
    handleGridView,
    isGridView,
    openParticipants,
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
  // const [focus, setFocus] = useState(false);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [openScreenSharePermit, setOpenScreenSharePermit] = useState(false);
  const [onChat, setOnChat] = useState(false);
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
    if (openChat) {
      setOnChat(true);
    } else {
      setOnChat(false);
    }
  }, [openChat]);

  useEffect(() => {
    setVideoStatus(localVideo ? VideoStatus.Enabled : VideoStatus.Disabled);
  }, [localVideo]);

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
          maxWidth: 700,
        }}
      >
        <Tooltip
          title={
            muted
              ? intl.formatMessage({ id: "Controls.unmuteTooltip" })
              : intl.formatMessage({ id: "Controls.muteTooltip" })
          }
          placement="bottom"
        >
          <Button
            onClick={async () => {
              if (muted) {
                chime?.audioVideo?.realtimeUnmuteLocalAudio();
              } else {
                chime?.audioVideo?.realtimeMuteLocalAudio();
              }
              // Adds a slight delay to close the tooltip before rendering the updated text in it
              await new Promise((resolve) => setTimeout(resolve, 10));
            }}
            className={cx(
              muted ? "Controls_btn_active" : "Controls_btn_not_active"
            )}
          >
            {muted ? (
              <>
                <MicOffOutlinedIcon className={cx("Controls_avtr_size")} />
                {intl.formatMessage({ id: "Controls.unmuteTooltip" })}
              </>
            ) : (
              <>
                <KeyboardVoiceOutlinedIcon
                  className={cx("Controls_avtr_size")}
                />
                {intl.formatMessage({ id: "Controls.muteTooltip" })}
              </>
            )}
          </Button>
        </Tooltip>

        <Tooltip
          title={
            videoStatus === VideoStatus.Disabled
              ? intl.formatMessage({ id: "Controls.turnOnVideoTooltip" })
              : intl.formatMessage({ id: "Controls.turnOffVideoTooltip" })
          }
          placement="bottom"
        >
          <Button
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
            sx={{ width: "100px" }}
            className={cx(
              videoStatus === VideoStatus.Enabled
                ? "Controls_btn_active"
                : "Controls_btn_not_active"
            )}
          >
            {videoStatus === VideoStatus.Enabled ? (
              <>
                <VideocamOutlinedIcon className={cx("Controls_avtr_size")} />
                {intl.formatMessage({ id: "Controls.startVideo" })}
              </>
            ) : (
              <>
                <VideocamOffOutlinedIcon className={cx("Controls_avtr_size")} />
                {intl.formatMessage({ id: "Controls.stopVideo" })}
              </>
            )}
          </Button>
        </Tooltip>

        <Tooltip
          title={
            isScreenShared
              ? intl.formatMessage({ id: "Controls.shareScreenStopTooltip" })
              : intl.formatMessage({ id: "Controls.shareScreenTooltip" })
          }
          placement="bottom"
        >
          <Button
            sx={{ width: "120px" }}
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
            className={cx(
              isScreenShared ? "Controls_btn_active" : "Controls_btn_not_active"
            )}
          >
            {isScreenShared ? (
              <>
                <StopScreenShareOutlinedIcon
                  className={cx("Controls_avtr_size")}
                />
                {intl.formatMessage({
                  id: "Controls.shareScreenStopTooltip",
                })}
              </>
            ) : (
              <>
                <ScreenShareOutlinedIcon className={cx("Controls_avtr_size")} />
                {intl.formatMessage({ id: "Controls.shareScreenTooltip" })}
              </>
            )}
          </Button>
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
            <Button
              onClick={() => {
                if (!onChat) {
                  onClickChatButton(true);
                  setOnChat(true);
                } else {
                  onClickChatButton(false);
                  setOnChat(false);
                }
              }}
              className={cx(
                onChat ? "Controls_btn_active" : "Controls_btn_not_active"
              )}
            >
              {onChat ? (
                <>
                  <CommentOutlinedIcon className={cx("Controls_avtr_size")} />
                  {intl.formatMessage({ id: "Controls.Chat" })}
                </>
              ) : (
                <>
                  <CommentIcon className={cx("Controls_avtr_size")} />{" "}
                  {intl.formatMessage({ id: "Controls.Chat" })}
                </>
              )}
            </Button>
          </Badge>
        </Tooltip>

        <Tooltip
          title={intl.formatMessage({ id: "Controls.participants" })}
          placement="bottom"
        >
          <Button
            sx={{ width: "100px" }}
            onClick={handleDrawerLeftToggle}
            className={cx(
              openParticipants
                ? "Controls_btn_active"
                : "Controls_btn_not_active"
            )}
          >
            <PeopleAltOutlinedIcon className={cx("Controls_avtr_size")} />
            {intl.formatMessage({ id: "Controls.participants" })}
          </Button>
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
