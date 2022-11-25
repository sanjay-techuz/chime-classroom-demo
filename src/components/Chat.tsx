// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import moment from "moment";
import React, { useContext, useEffect, useRef, useState } from "react";
import { DataMessage } from "amazon-chime-sdk-js";
import { useIntl } from "react-intl";

import {
  Avatar,
  Box,
  ImageList,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Typography,
  Badge,
  Tooltip,
  IconButton,
} from "@mui/material";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
import useRoster from "../hooks/useRoster";
import styles from "./Chat.css";
import ChatInput from "./ChatInput";
import MessageTopic from "../enums/MessageTopic";
import RosterAttendeeType from "../types/RosterAttendeeType";
import localStorageKeys from "../constants/localStorageKeys.json";
import { clipBoard, createPrivateChannel, nameInitials } from "../utils";
import useRemoteControl from "../hooks/useRemoteControl";
import SmallAvatar from "../custom/roster/SmallAvatar";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const cx = classNames.bind(styles);
var chatPannelOpen = false;
var grpCnt = 0;
var gbRoster: any;
var currentChannel: string = MessageTopic.PublicChannel;
var publicChannelCnt = 0;
export default function Chat() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const intl = useIntl();

  const { globalVar, updateGlobalVar } = useContext(getGlobalVarContext());
  const { isChatOpen } = globalVar;
  const [messages, setMessages] = useState<DataMessage[]>([]);
  const [filterMessage, setFilterMessage] = useState<DataMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>(
    MessageTopic.PublicChannel
  );
  const [activeChatAttendee, setActiveChatAttendee] = useState<string>(
    MessageTopic.PublicChannel
  );

  const bottomElement = useRef(null);
  const roster = useRoster();
  const localUserId =
    chime?.meetingSession?.configuration?.credentials?.attendeeId;

  let chatAttendeeIds: Array<string> = [];
  if (chime?.meetingSession && roster) {
    gbRoster = roster;
    chatAttendeeIds = Object.keys(roster).filter(
      (attendeeId: string) => attendeeId !== localUserId
    );
    chatAttendeeIds = chatAttendeeIds.filter(
      (attendeeId: string) =>
        attendeeId !==
        localStorage.getItem(localStorageKeys.CURRENT_RECORDER_ID)
    );
  }
  useRemoteControl();

  useEffect(() => {
    chatPannelOpen = isChatOpen;
  }, [isChatOpen]);

  const messageCounter = async (message: DataMessage) => {
    if (message.topic === MessageTopic.GroupChat) {
      const msgObj = JSON.parse(new TextDecoder().decode(message.data));
      if (message.senderAttendeeId !== localUserId) {
        if (!chatPannelOpen) {
          if (msgObj.channel === currentChannel) {
            if (msgObj.channel !== MessageTopic.PublicChannel) {
              if (msgObj.targetId === localUserId) {
                chime?.updateChatMessageCounter(
                  message.senderAttendeeId,
                  gbRoster[message.senderAttendeeId].msgCount + 1
                );
                grpCnt = grpCnt + 1;
                updateGlobalVar("groupChatCounter", grpCnt + publicChannelCnt);
              }
            } else {
              publicChannelCnt = publicChannelCnt + 1;
              updateGlobalVar("groupChatCounter", grpCnt + publicChannelCnt);
            }
          } else {
            if (msgObj.channel !== MessageTopic.PublicChannel) {
              if (msgObj.targetId === localUserId) {
                chime?.updateChatMessageCounter(
                  message.senderAttendeeId,
                  gbRoster[message.senderAttendeeId].msgCount + 1
                );
                grpCnt = grpCnt + 1;
                updateGlobalVar("groupChatCounter", grpCnt + publicChannelCnt);
              }
            } else {
              publicChannelCnt = publicChannelCnt + 1;
              updateGlobalVar("groupChatCounter", grpCnt + publicChannelCnt);
            }
          }
        } else {
          if (msgObj.channel !== currentChannel) {
            if (msgObj.channel !== MessageTopic.PublicChannel) {
              if (msgObj.targetId === localUserId) {
                chime?.updateChatMessageCounter(
                  message.senderAttendeeId,
                  gbRoster[message.senderAttendeeId].msgCount + 1
                );
                grpCnt = grpCnt + 1;
                updateGlobalVar("groupChatCounter", grpCnt + publicChannelCnt);
              }
            } else {
              publicChannelCnt = publicChannelCnt + 1;
              updateGlobalVar("groupChatCounter", grpCnt + publicChannelCnt);
            }
          }
        }
      }
    }
  };

  useEffect(() => {
    const realTimeMessages: DataMessage[] = [];
    const callback = (message: DataMessage) => {
      messageCounter(message);
      realTimeMessages.push(message);
      setMessages(realTimeMessages.slice() as DataMessage[]);
    };

    const chatMessageUpdateCallback = {
      topic: MessageTopic.GroupChat,
      callback,
    };

    const raiseHandMessageUpdateCallback = {
      topic: MessageTopic.RaiseHand,
      callback,
    };

    chime?.subscribeToMessageUpdate(chatMessageUpdateCallback);
    chime?.subscribeToMessageUpdate(raiseHandMessageUpdateCallback);
    return () => {
      chime?.unsubscribeFromMessageUpdate(chatMessageUpdateCallback);
      chime?.unsubscribeFromMessageUpdate(raiseHandMessageUpdateCallback);
      chatPannelOpen = false;
      grpCnt = 0;
      gbRoster = [];
      currentChannel = MessageTopic.PublicChannel;
      publicChannelCnt = 0;
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      (bottomElement.current as unknown as HTMLDivElement).scrollIntoView({
        behavior: "smooth",
      });
    }, 10);
  }, [messages, activeChannel]);

  useEffect(() => {
    const filteredArry: DataMessage[] = [];
    messages.forEach((message) => {
      if (message.topic === MessageTopic.GroupChat) {
        const msgObj = JSON.parse(new TextDecoder().decode(message.data));
        if (msgObj.channel === activeChannel) {
          filteredArry.push(message);
        }
      }
    });
    setFilterMessage([...filteredArry]);
  }, [messages, activeChannel]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        margin: "auto",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "10%",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--primary_blue_color)",
        }}
      >
        <ImageList
          sx={{
            gridAutoFlow: "column",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(50px,1fr)) !important",
            gridAutoColumns: "minmax(50px, 1fr)",
            p: 1,
            margin: 0,
          }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            badgeContent={
              <SmallAvatar
                sx={{
                  display: publicChannelCnt === 0 ? "none" : "flex",
                  fontSize: publicChannelCnt <= 99 ? "1rem" : "0.6rem",
                }}
                bgcolor={"var(--color_pink)"}
              >
                {publicChannelCnt <= 99 ? publicChannelCnt : "99+"}
              </SmallAvatar>
            }
          >
            <Avatar
              sx={{
                bgcolor:
                  activeChatAttendee === MessageTopic.PublicChannel
                    ? "var(--color_green)"
                    : "var(--primary_blue_color)",
                cursor:"pointer"
              }}
              variant="rounded"
              onClick={() => {
                setActiveChatAttendee(MessageTopic.PublicChannel);
                setActiveChannel(MessageTopic.PublicChannel);
                currentChannel = MessageTopic.PublicChannel;
                publicChannelCnt = 0;
                updateGlobalVar("groupChatCounter", grpCnt + publicChannelCnt);
              }}
            >
              {intl.formatMessage({ id: "Chat.all"})}
            </Avatar>
          </Badge>
          {chatAttendeeIds.map((chatAttdId: string) => {
            const rosterAttendee: RosterAttendeeType = roster[chatAttdId];
            const initials = nameInitials(rosterAttendee?.name);
            const msgCount = rosterAttendee?.msgCount
              ? rosterAttendee?.msgCount
              : 0;
            return (
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                badgeContent={
                  <SmallAvatar
                    sx={{
                      display: msgCount === 0 ? "none" : "flex",
                      fontSize: msgCount <= 99 ? "1rem" : "0.6rem",
                    }}
                    bgcolor={"var(--color_pink)"}
                  >
                    {msgCount <= 99 ? msgCount : "99+"}
                  </SmallAvatar>
                }
              >
                <Avatar
                  key={chatAttdId}
                  sx={{
                    bgcolor:
                      activeChatAttendee === chatAttdId
                        ? "var(--color_green)"
                        : "var(--primary_blue_color)",
                        cursor:"pointer"
                  }}
                  variant="rounded"
                  onClick={() => {
                    setActiveChatAttendee(chatAttdId);
                    grpCnt = grpCnt - msgCount;
                    chime?.updateChatMessageCounter(chatAttdId, 0);
                    setActiveChannel(
                      createPrivateChannel(localUserId as string, chatAttdId)
                    );
                    currentChannel = createPrivateChannel(
                      localUserId as string,
                      chatAttdId
                    );
                    updateGlobalVar(
                      "groupChatCounter",
                      grpCnt + publicChannelCnt
                    );
                  }}
                >
                  {initials}
                </Avatar>
              </Badge>
            );
          })}
        </ImageList>
      </Box>
      <Box
        sx={{
          width: "100%",
          height: "90%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className={cx("Chat_messages")}>
          {filterMessage.map((message, index) => {
            let messageString: string = "";
            if (message.topic === MessageTopic.GroupChat) {
              messageString = JSON.parse(
                new TextDecoder().decode(message.data)
              ).sendingMessage;
            } else if (message.topic === MessageTopic.RaiseHand) {
              messageString = `✋`;
            }

            if (message.senderAttendeeId === localUserId) {
              const avtr = nameInitials(
                chime?.roster[message.senderAttendeeId]?.name
              );
              return (
                <ListItem
                  key={message.timestampMs}
                  component="div"
                  sx={{
                    flexDirection: "row-reverse",
                    alignItems: "flex-start",
                  }}
                  onMouseEnter={() => {
                    const elem = document.getElementsByClassName(`moreButton_${index}`)[0] as HTMLElement;
                    elem.style.opacity = "1";
                  }}
                  onMouseLeave={() => {
                    const elem = document.getElementsByClassName(`moreButton_${index}`)[0] as HTMLElement;
                    elem.style.opacity = "0";
                  }}
                >
                  <ListItemAvatar
                    sx={{
                      marginTop: "4px",
                    }}
                  >
                    <Avatar
                      sx={{ bgcolor: "var(--color_green)" }}
                      variant="rounded"
                    >
                      {avtr}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    sx={{ mr: 2, mt: 0, textAlign: "right", fontSize: "14px" }}
                  >
                    <div
                      style={{
                        height: "24px",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "flex-end",
                      }}
                    >
                    <Tooltip title={chime?.roster[message.senderAttendeeId]?.name} placement="bottom">
                      <span
                        style={{
                          width: "100px",
                          display: "inline-block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {chime?.roster[message.senderAttendeeId]?.name}
                      </span>
                      </Tooltip>
                      ,{` `}
                      <Typography variant="caption">
                        {moment(message.timestampMs).format("h:mm A")}
                      </Typography>
                    </div>
                    <Paper
                      elevation={0}
                      sx={{
                        color: "var(--color_grey)",
                      }}
                    >
                      <Typography
                        sx={{
                          overflowWrap: "anywhere",
                          minWidth: "75px",
                        }}
                        variant="body1"
                      >
                        {messageString}
                      </Typography>
                    </Paper>
                  </ListItemText>
                  <div className={cx(`moreButton_${index}`)} style={{ opacity:0 }} defaultValue={messageString} >
                  <Tooltip title={"Copy"} placement="bottom">
                    <IconButton onClick={() => {
                        clipBoard(messageString);                         
                    }} sx={{ padding: "0px !important"}}>
                      <ContentCopyIcon sx={{
                        height:"20px !important"
                      }}/>
                    </IconButton>
                  </Tooltip>
                  </div>
                </ListItem>
              );
            } else {
              const avtr = nameInitials(
                chime?.roster[message.senderAttendeeId]?.name
              );
              return (
                <ListItem
                  key={message.timestampMs}
                  component="div"
                  sx={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                  onMouseEnter={() => {
                    const elem = document.getElementsByClassName(`moreButton_${index}`)[0] as HTMLElement;
                    elem.style.opacity = "1";
                  }}
                  onMouseLeave={() => {
                    const elem = document.getElementsByClassName(`moreButton_${index}`)[0] as HTMLElement;
                    elem.style.opacity = "0";
                  }}
                >
                  <ListItemAvatar
                    sx={{
                      marginTop: "4px",
                    }}
                  >
                    <Avatar
                      sx={{ bgcolor: "var(--primary_blue_color)" }}
                      variant="rounded"
                    >
                      {avtr}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    sx={{ mr: 2, mt: 0, textAlign: "left", fontSize: "14px" }}
                  >
                    <div
                      style={{
                        height: "24px",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Typography variant="caption">
                        {moment(message.timestampMs).format("h:mm A")}
                      </Typography>
                      ,{` `}  
                      <Tooltip title={chime?.roster[message.senderAttendeeId]?.name} placement="bottom">
                      <span
                        style={{
                          width: "100px",
                          display: "inline-block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {chime?.roster[message.senderAttendeeId]?.name}
                      </span>
                      </Tooltip>                      
                    </div>
                    <Paper
                      elevation={0}
                      sx={{
                        color: "var(--color_grey)",
                      }}
                    >
                      <Typography
                        sx={{
                          overflowWrap: "anywhere",
                          minWidth: "75px",
                        }}
                        variant="body1"
                      >
                        {messageString}
                      </Typography>
                    </Paper>
                  </ListItemText>
                  <div className={cx(`moreButton_${index}`)} style={{ opacity:0 }} defaultValue={messageString} >
                  <Tooltip title={"Copy"} placement="bottom">
                    <IconButton onClick={() => {
                        clipBoard(messageString);                         
                    }} sx={{ padding: "0px !important"}}>
                      <ContentCopyIcon sx={{
                        height:"20px !important"
                      }}/>
                    </IconButton>
                  </Tooltip>
                  </div>
                </ListItem>
              );
            }
          })}
          <div className="bottom" ref={bottomElement} />
        </div>
        <div className={cx("Chat_chatInput")}>
          <ChatInput
            activeChannel={activeChannel}
            activeChatAttendee={activeChatAttendee}
          />
        </div>
      </Box>
    </Box>
  );
}
