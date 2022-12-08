// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
// import getUIStateContext from "../context/getUIStateContext";
import ClassMode from "../enums/ClassMode";
import styles from "./ChatInput.css";
import MessageTopic from "../enums/MessageTopic";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import CheckIcon from "@mui/icons-material/Check";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  ListItem,
  MenuItem,
  Popover,
} from "@mui/material";
import useRoster from "../hooks/useRoster";
import localStorageKeys from "../constants/localStorageKeys.json";
import RosterAttendeeType from "../types/RosterAttendeeType";
import { createPrivateChannel } from "../utils";

const cx = classNames.bind(styles);

let timeoutId: number;

type Props = {
  publicChannelCnt: number;
  changeChannel: (type: string, chatAttdId: string, msgCount: number) => void;
};

export default React.memo(function ChatInput(props: Props) {
  const { changeChannel, publicChannelCnt } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { globalVar } = useContext(getGlobalVarContext());
  const { classMode } = globalVar;
  // const [state] = useContext(getUIStateContext());
  const [inputText, setInputText] = useState("");
  const [currentChatter, setCurrentChatter] = useState("Everyone");
  const [activeChatAttendee, setActiveChatAttendee] = useState<string>(
    MessageTopic.PublicChannel
  );
  const [activeChannel, setActiveChannel] = useState<string>(
    MessageTopic.PublicChannel
  );
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [raised, setRaised] = useState(false);
  const intl = useIntl();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const roster = useRoster();
  const localUserId =
    chime?.meetingSession?.configuration?.credentials?.attendeeId;

  let chatAttendeeIds: Array<string> = [];
  if (chime?.meetingSession && roster) {
    chatAttendeeIds = Object.keys(roster).filter(
      (attendeeId: string) => attendeeId !== localUserId
    );
    chatAttendeeIds = chatAttendeeIds.filter(
      (attendeeId: string) =>
        attendeeId !==
        localStorage.getItem(localStorageKeys.CURRENT_RECORDER_ID)
    );
  }

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

  function onClick(emojiData: EmojiClickData, _event: MouseEvent) {
    setInputText(inputText + emojiData.emoji);
  }

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box sx={{
        display: openEmojiPicker ? "block" : "none"
      }}>
        <EmojiPicker
          height={300}
          width={300}
          onEmojiClick={onClick}
          autoFocusSearch={true}
      />
      </Box>
      <Box sx={{ height: 70 }}>
        <Box sx={{ height: "40%" }}>
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
            <MenuItem
              sx={{ padding: "0px 10px" }}
              onClick={() => {
                setActiveChatAttendee(MessageTopic.PublicChannel);
                setActiveChannel(MessageTopic.PublicChannel);
                setCurrentChatter("Everyone");
                changeChannel(MessageTopic.PublicChannel, "", 0);
              }}
            >
              <CheckIcon
                sx={{
                  mr: 1,
                  color:
                  activeChatAttendee === MessageTopic.PublicChannel ? "black" : "transparent",
                }}
              />
              <ListItem sx={{ padding: "0px 10px" }}>Everyone</ListItem>
              <Avatar
                sx={{
                  backgroundColor: "var(--color_pink)",
                  display: publicChannelCnt === 0 ? "none" : "flex",
                  height: 20,
                  width: 20,
                  fontSize: "1rem",
                }}
              >
                {publicChannelCnt}
              </Avatar>
            </MenuItem>
            {chatAttendeeIds.map((chatAttdId: string) => {
              const rosterAttendee: RosterAttendeeType = roster[chatAttdId];
              const msgCount = rosterAttendee?.msgCount
                ? rosterAttendee?.msgCount
                : 0;
              return (
                <MenuItem
                  sx={{ padding: "0px 10px" }}
                  onClick={() => {
                    setActiveChatAttendee(chatAttdId);
                    setActiveChannel(
                      createPrivateChannel(localUserId as string, chatAttdId)
                    );
                    setCurrentChatter(rosterAttendee?.name as string);
                    changeChannel("private", chatAttdId, msgCount);
                  }}
                >
                  <CheckIcon
                    sx={{
                      mr: 1,
                      color:
                      activeChatAttendee === chatAttdId
                          ? "black"
                          : "transparent",
                    }}
                  />
                  <ListItem sx={{ padding: "0px 10px" }}>
                    {rosterAttendee?.name}
                  </ListItem>
                  <Avatar
                    sx={{
                      backgroundColor: "var(--color_pink)",
                      display: msgCount === 0 ? "none" : "flex",
                      height: 20,
                      width: 20,
                      fontSize: "1rem",
                    }}
                  >
                    {msgCount}
                  </Avatar>
                </MenuItem>
              );
            })}
          </Popover>
          To: <Button onClick={handleClick}>{currentChatter}</Button>
          <IconButton
            onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
            color="inherit"
            sx={{
              position: "absolute",
              right: "40px",
              width: "25px",
              height: "25px",
              color: " #FFF",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <EmojiEmotionsOutlinedIcon />
          </IconButton>
          {classMode === ClassMode.Student && (
            <button
              type="button"
              className={cx("raiseHandButton", {
                raised,
              })}
              onClick={() => {
                setRaised(!raised);
              }}
            >
              <span
                role="img"
                aria-label={intl.formatMessage({
                  id: "ChatInput.raiseHandAriaLabel",
                })}
              >
                ✋
              </span>
            </button>
          )}
        </Box>
        <div className={cx("chatInput")}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
            }}
            className={cx("form")}
          >
            <input
              className={cx("input")}
              value={inputText}
              onChange={(event) => {
                setInputText(event.target.value);
              }}
              onKeyUp={(event) => {
                event.preventDefault();
                if (event.keyCode === 13) {
                  setOpenEmojiPicker(false);
                  const sendingMessage = inputText.trim();
                  const msgObject = {
                    sendingMessage,
                    channel: activeChannel,
                    targetId: activeChatAttendee,
                  };
                  const attendeeId =
                    chime?.configuration?.credentials?.attendeeId;
                  if (sendingMessage !== "" && attendeeId) {
                    chime?.sendMessage(
                      MessageTopic.GroupChat,
                      JSON.stringify(msgObject)
                    );
                    setInputText("");
                  }
                }
              }}
              placeholder={intl.formatMessage({
                id: "ChatInput.inputPlaceholder",
              })}
            />
          </form>
        </div>
      </Box>
    </>
  );
});
