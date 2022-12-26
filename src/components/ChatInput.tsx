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
let chatMessageText: string = "";

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
    chatMessageText = inputText;
  }, [inputText]);

  const emojiPickerVal = useMemo(() => {
    return (
      <EmojiPicker
        height={260}
        width={260}
        theme={Theme.DARK}
        onEmojiClick={onClick}
        autoFocusSearch={true}
      />
    );
  }, [openEmojiPicker]);
  return (
    <>
      <Box
        className={cx({
          Mui_chat_input_display_none: !openEmojiPicker,
          Mui_chat_input_display_block: openEmojiPicker,
        })}
      >
        {emojiPickerVal}
      </Box>
      <Box className={cx("Mui_chat_input_parent_container")}>
        <Box className={cx("Mui_chat_input_child_container")}>
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
              className={cx("Mui_chat_input_popover_everyone_menu_item")}
              onClick={() => {
                setActiveChatAttendee(MessageTopic.PublicChannel);
                setActiveChannel(MessageTopic.PublicChannel);
                setCurrentChatter("Everyone");
                changeChannel(MessageTopic.PublicChannel, "", 0);
              }}
            >
              {activeChatAttendee === MessageTopic.PublicChannel ? (
                <Icons src={"/icons/check_icon.svg"} />
              ) : (
                <Icons src={"/icons/check_icon_black.svg"} />
              )}
              <ListItem
                className={cx("Mui_chat_input_popover_everyone_menu_listitem")}
              >
                Everyone
              </ListItem>
              <Avatar
                className={cx(
                  "Mui_chat_input_popover_everyone_menu_listitem_avatar",
                  {
                    Mui_chat_input_display_flex: publicChannelCnt !== 0,
                    Mui_chat_input_display_none: publicChannelCnt === 0,
                  }
                )}
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
                  className={cx("Mui_chat_input_popover_private_menu_item")}
                  onClick={() => {
                    setActiveChatAttendee(chatAttdId);
                    setActiveChannel(
                      createPrivateChannel(localUserId as string, chatAttdId)
                    );
                    setCurrentChatter(rosterAttendee?.name as string);
                    changeChannel("private", chatAttdId, msgCount);
                  }}
                >
                  {activeChatAttendee === chatAttdId ? (
                    <Icons src={"/icons/check_icon.svg"} />
                  ) : (
                    <Icons src={"/icons/check_icon_black.svg"} />
                  )}
                  <ListItem
                    className={cx(
                      "Mui_chat_input_popover_everyone_menu_listitem"
                    )}
                  >
                    {rosterAttendee?.name}
                  </ListItem>
                  <Avatar
                    className={cx(
                      "Mui_chat_input_popover_everyone_menu_listitem_avatar",
                      {
                        Mui_chat_input_display_flex: msgCount !== 0,
                        Mui_chat_input_display_none: msgCount === 0,
                      }
                    )}
                  >
                    {msgCount}
                  </Avatar>
                </MenuItem>
              );
            })}
          </Popover>
          To:{" "}
          <Button
            className={cx("Mui_chat_input_message_to")}
            onClick={handleClick}
          >
            {currentChatter} ^
          </Button>
          <IconButton
            onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
            color="inherit"
            className={cx("Mui_chat_input_emoji_icon")}
          >
            <EmojiEmotionsOutlinedIcon sx={{ fontSize: "14px" }} />
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
