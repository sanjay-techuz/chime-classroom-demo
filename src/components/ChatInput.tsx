// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import styles from "./ChatInput.css";
import MessageTopic from "../enums/MessageTopic";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
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
import Icons from "../custom/Icons";

const cx = classNames.bind(styles);

type Props = {
  publicChannelCnt: number;
  changeChannel: (type: string, chatAttdId: string, msgCount: number) => void;
};
let chatMessageText: string = ""

export default React.memo(function ChatInput(props: Props) {
  const { changeChannel, publicChannelCnt } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());

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
    height={260}
    width={260}
    theme={Theme.DARK}
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
      <Box sx={{ height: 50 }}>
        <Box sx={{ height: "40%", padding: "0px 10px", color: '#5F5F5F', fontSize: "14px" }}>
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
                bottom: "70px !important",
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
                  left: "10%",
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
            <MenuItem
              sx={{ padding: "3px 10px" }}
              onClick={() => {
                setActiveChatAttendee(MessageTopic.PublicChannel);
                setActiveChannel(MessageTopic.PublicChannel);
                setCurrentChatter("Everyone");
                changeChannel(MessageTopic.PublicChannel, "", 0);
              }}
            >
              {activeChatAttendee === MessageTopic.PublicChannel ? <Icons src={"/icons/check_icon.svg"} height={16} width={16} /> : <Icons src={"/icons/check_icon_black.svg"} height={16} width={16} />}
              <ListItem sx={{ padding: "0px 10px", fontSize: "12px" }}>Everyone</ListItem>
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
                  {activeChatAttendee === chatAttdId ? <Icons src={"/icons/check_icon.svg"} height={16} width={16} /> : <Icons src={"/icons/check_icon_black.svg"} height={16} width={16} />}
                  <ListItem sx={{ padding: "0px 10px", fontSize: "12px" }}>
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
          To: <Button sx={{ padding: 0, color: "#FFF", textTransform: "none", fontSize: "14px" }} onClick={handleClick}>{currentChatter} ^</Button>
          <IconButton
            onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
            color="inherit"
            sx={{
              position: "absolute",
              right: "20px",
              width: "20px",
              height: "20px",
              color: " #FFF",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <EmojiEmotionsOutlinedIcon sx={{fontSize: "14px"}} />
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
