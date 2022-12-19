// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
// import getUIStateContext from "../context/getUIStateContext";
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

type Props = {
  publicChannelCnt: number;
  changeChannel: (type: string, chatAttdId: string, msgCount: number) => void;
};
let chatMessageText: string = ""

export default React.memo(function ChatInput(props: Props) {
  const { changeChannel, publicChannelCnt } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());

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


  function onClick(emojiData: EmojiClickData, _event: MouseEvent) {
    setInputText(chatMessageText + emojiData.emoji);
  }

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    chatMessageText = inputText
  },[inputText])

  const emojiPickerVal = useMemo(() => {
    return <EmojiPicker
    height={300}
    width={300}
    onEmojiClick={onClick}
    autoFocusSearch={true}
/>
  },[openEmojiPicker])       
  return (
    <>
      <Box sx={{
        display: openEmojiPicker ? "block" : "none"
      }}>
        {emojiPickerVal}
      </Box>
      <Box sx={{ height: 70 }}>
        <Box sx={{ height: "40%" }}>
          <Popover
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                bottom: "90px !important",
                top: "initial !important",
                bgcolor: "var(--secondary_blue_color)",
                color: "var(--pure_white_color)",
                border: "1px solid var(--pure_white_color)",
                overflow: "visible",
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  bottom: -10,
                  left: "10%",
                  width: 10,
                  height: 10,
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                  borderBottom: "1px solid",
                  borderRight: "1px solid",
                  backgroundColor: "var(--secondary_blue_color)",
                },
              },
            }}
          >
            <MenuItem
              sx={{ padding: "3px 10px" }}
              onClick={() => {
                setActiveChatAttendee(MessageTopic.PublicChannel);
                setActiveChannel(MessageTopic.PublicChannel);
                setCurrentChatter("Everyone");
                changeChannel(MessageTopic.PublicChannel, "", 0);
              }}
            >
               <Avatar
                    sx={{
                      height: 20,
                      width: 20,
                      backgroundColor:
                      activeChatAttendee === MessageTopic.PublicChannel
                          ? "var(--color_green)"
                          : "transparent",
                      marginRight: 1,
                    }}
                  >
                    <CheckIcon
                      sx={{
                        fontSize: "1rem",
                        color:
                        activeChatAttendee === MessageTopic.PublicChannel
                            ? "var(--pure_white_color)"
                            : "transparent",
                      }}
                    />
                  </Avatar>{" "}
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
                <Avatar
                    sx={{
                      height: 20,
                      width: 20,
                      backgroundColor:
                      activeChatAttendee === chatAttdId
                          ? "var(--color_green)"
                          : "transparent",
                      marginRight: 1,
                    }}
                  >
                    <CheckIcon
                      sx={{
                        fontSize: "1rem",
                        color:
                        activeChatAttendee === chatAttdId
                            ? "var(--pure_white_color)"
                            : "transparent",
                      }}
                    />
                  </Avatar>{" "}
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
