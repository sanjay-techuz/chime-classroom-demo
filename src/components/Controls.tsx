// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
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
import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import routes from "../constants/routes.json";
import getChimeContext from "../context/getChimeContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
import ClassMode from "../enums/ClassMode";
import SmallAvatar from "../custom/roster/SmallAvatar";
import { attendanceWenhook } from "../services";
import MoreSettings from "./MoreSettings";
import styles from "./Controls.css";
import MessageTopic from "../enums/MessageTopic";
import Icons from "../custom/Icons";

const cx = classNames.bind(styles);
let timeoutId: number;

enum VideoStatus {
  Disabled,
  Loading,
  Enabled,
}

type Props = {
  onClickShareButton: (flag: boolean) => void;
  onClickChatButton: (flag: boolean) => void;
  handleDrawerLeftToggle: () => void;
  openParticipants: boolean;
  openChat: boolean;
  isContentShareEnabled: boolean;
};

export default function Controls(props: Props) {
  const {
    onClickShareButton,
    onClickChatButton,
    openChat,
    handleDrawerLeftToggle,
    openParticipants,
    isContentShareEnabled
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
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [openScreenSharePermit, setOpenScreenSharePermit] = useState(false);
  const [onChat, setOnChat] = useState(false);
  const [raised, setRaised] = useState(false);
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

  useEffect(() => {
    const attendeeId = chime?.configuration?.credentials?.attendeeId;
    if (!attendeeId) {
      return;
    }

    chime?.sendMessage(
      raised ? MessageTopic.RaiseHand : MessageTopic.DismissHand,
      attendeeId
    );

    if (raised) {
      timeoutId = window.setTimeout(() => {
        chime?.sendMessage(MessageTopic.DismissHand, attendeeId);
        setRaised(false);
      }, 10000);
    } else {
      clearTimeout(timeoutId);
    }
  }, [raised, chime?.configuration]);

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
    <Box className={cx("Mui_controls_parent_container_box")}>
      <Box className={cx("Mui_controls_child_container_box")}>
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
                <Icons src={"/icons/microphone_off_black.svg"} />
                <span className={cx("Controls_margin_right")}>
                  {intl.formatMessage({ id: "Controls.unmuteTooltip" })}
                </span>
              </>
            ) : (
              <>
                <Icons src={"/icons/microphone_on_white.svg"} />
                <span className={cx("Controls_margin_right")}>
                  {intl.formatMessage({ id: "Controls.muteTooltip" })}
                </span>
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
            sx={{ width: "130px" }}
            className={cx(
              videoStatus === VideoStatus.Enabled
                ? "Controls_btn_active"
                : "Controls_btn_not_active"
            )}
          >
            {videoStatus === VideoStatus.Enabled ? (
              <>
                <Icons src={"/icons/camera_off_black.svg"} />
                <span className={cx("Controls_margin_right")}>
                  {intl.formatMessage({ id: "Controls.startVideo" })}
                </span>
              </>
            ) : (
              <>
                <Icons src={"/icons/camera_on_white.svg"} />
                <span className={cx("Controls_margin_right")}>
                  {intl.formatMessage({ id: "Controls.stopVideo" })}
                </span>
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
            onClick={() => {
              if (classMode === ClassMode.Teacher || screenSharePermit) {
                if (!isScreenShared) {
                  if(isContentShareEnabled){
                    setOpenScreenSharePermit(true);
                  }else{
                    onClickShareButton(true);
                  }
                } else {
                  onClickShareButton(false);
                }
              } else {
                setOpenScreenSharePermit(true);
              }
            }}
            className={cx(
              isScreenShared
                ? "Controls_sc_btn_active"
                : "Controls_sc_btn_not_active"
            )}
          >
            {isScreenShared ? (
              <>
                <Icons src={"/icons/screen_share_white.svg"} />
                <span className={cx("Controls_margin_right")}>
                  {intl.formatMessage({
                    id: "Controls.shareScreenStopTooltip",
                  })}
                </span>
              </>
            ) : (
              <>
                <Icons src={"/icons/screen_share_black.svg"} />
                <span className={cx("Controls_margin_right")}>
                  {intl.formatMessage({ id: "Controls.shareScreenTooltip" })}
                </span>
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
                  <Icons src={"/icons/chat_black.svg"} />
                  <span className={cx("Controls_margin_right")}>
                    {intl.formatMessage({ id: "Controls.Chat" })}
                  </span>
                </>
              ) : (
                <>
                  <Icons src={"/icons/chat.svg"} />
                  <span className={cx("Controls_margin_right")}>
                    {intl.formatMessage({ id: "Controls.Chat" })}
                  </span>
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
            sx={{ width: "127px" }}
            onClick={handleDrawerLeftToggle}
            className={cx(
              openParticipants
                ? "Controls_btn_active"
                : "Controls_btn_not_active"
            )}
          >
            {openParticipants ? (
              <Icons src={"/icons/participants_black.svg"} />
            ) : (
              <Icons src={"/icons/participants.svg"} />
            )}
            <span className={cx("Controls_margin_right")}>
              {intl.formatMessage({ id: "Controls.participants" })}
            </span>
          </Button>
        </Tooltip>

        <MoreSettings />

        <Dialog
          open={openScreenSharePermit}
          onClose={handleCloseScreenShareDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <DialogContentText
              id="alert-dialog-description"
            >
              {isContentShareEnabled && (screenSharePermit || classMode === ClassMode.Teacher) ? intl.formatMessage({
                id: "Controls.screenShareAlreadySharedDialogMessage",
              }) : intl.formatMessage({
                id: "Controls.screenSharePermitDialogMessage",
              })}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseScreenShareDialog}
              autoFocus
            >
              {intl.formatMessage({ id: "Controls.dialogOk" })}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box className={cx("Mui_classroom_control_second_container")}>
        {classMode === ClassMode.Student && (
          <Tooltip
            title={
              raised
                ? intl.formatMessage({ id: "ChatInput.dismissHandAriaLabel" })
                : intl.formatMessage({ id: "ChatInput.raiseHandAriaLabel" })
            }
            placement="bottom"
          >
            <Avatar
              className={cx({
                Mui_controls_raised_hand: raised,
                Mui_controls_dismiss_hand: !raised,
              })}
              onClick={() => {
                setRaised(!raised);
              }}
            >
              {raised ? (
                <Icons src={"/icons/hand.svg"} />
              ) : (
                <Icons src={"/icons/hand_white.svg"} />
              )}
            </Avatar>
          </Tooltip>
        )}
        <Popover
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              bottom: "75px !important",
              top: "initial !important",
              bgcolor: "var(--third_blue_color)",
              color: "var(--pure_white_color)",
              border: "1px solid var(--controls_border_color)",
              overflow: "visible",
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                bottom: -10,
                left: "50%",
                width: 10,
                height: 10,
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
                borderBottom: "1px solid var(--controls_border_color)",
                borderRight: "1px solid var(--controls_border_color)",
                backgroundColor: "var(--third_blue_color)",
              },
            },
          }}
        >
          {classMode === ClassMode.Teacher && (
            <MenuItem
              sx={{ fontSize: "12px" }}
              onClick={() => {
                chime?.leaveRoom(true);
                navigate(`${routes.MAIN}?id=${userInfo.teacherId}`);
              }}
            >
              {intl.formatMessage({ id: "Controls.EndMeeting" })}
            </MenuItem>
          )}
          <MenuItem
            sx={{ fontSize: "12px" }}
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
              navigate(routes.MAIN);
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
            className={cx("Mui_controls_end_meeting_btn")}
          >
            <Icons src={"/icons/endmeeting.svg"} />
          </Avatar>
        </Tooltip>
      </Box>
    </Box>
  );
}
