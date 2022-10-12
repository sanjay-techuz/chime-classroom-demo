// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import moment from "moment";
import React, { useContext, useEffect, useRef, useState } from "react";
import { DataMessage } from "amazon-chime-sdk-js";

import {
  Avatar,
  Box,
  ImageList,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Typography,
} from "@mui/material";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import useRoster from "../hooks/useRoster";
import styles from "./Chat.css";
import ChatInput from "./ChatInput";
import MessageTopic from "../enums/MessageTopic";
import RosterAttendeeType from "../types/RosterAttendeeType";
import localStorageKeys from "../constants/localStorageKeys.json";
import { createPrivateChannel, nameInitials } from "../utils";
import useRemoteControl from "../hooks/useRemoteControl";

const cx = classNames.bind(styles);

export default function Chat() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
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
    const realTimeMessages: DataMessage[] = [];
    const callback = (message: DataMessage) => {
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
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      (bottomElement.current as unknown as HTMLDivElement).scrollIntoView({
        behavior: "smooth",
      });
    }, 10);
  }, [messages]);

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
          <Avatar
            sx={{
              bgcolor:
                activeChatAttendee === MessageTopic.PublicChannel
                  ? "var(--color_green)"
                  : "var(--primary_blue_color)",
            }}
            variant="rounded"
            onClick={() => {
              setActiveChatAttendee(MessageTopic.PublicChannel);
              setActiveChannel(MessageTopic.PublicChannel);
            }}
          >
            All
          </Avatar>
          {chatAttendeeIds.map((chatAttdId: string) => {
            const rosterAttendee: RosterAttendeeType = roster[chatAttdId];
            const initials = nameInitials(rosterAttendee?.name);
            return (
              <Avatar
                key={chatAttdId}
                sx={{
                  bgcolor:
                    activeChatAttendee === chatAttdId ? "var(--color_green)" : "var(--primary_blue_color)",
                }}
                variant="rounded"
                onClick={() => {
                  setActiveChatAttendee(chatAttdId);
                  setActiveChannel(
                    createPrivateChannel(localUserId as string, chatAttdId)
                  );
                }}
              >
                {initials}
              </Avatar>
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
          {filterMessage.map((message) => {
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
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "var(--color_green)" }} variant="rounded">
                      {avtr}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    sx={{ mr: 2, textAlign: "right", fontSize: "14px" }}
                  >
                    {chime?.roster[message.senderAttendeeId]?.name},{` `}
                    <Typography variant="caption">
                      {moment(message.timestampMs).format("h:mm A")}
                    </Typography>
                    <Paper elevation={0}>
                      <Typography variant="body1">{messageString}</Typography>
                    </Paper>
                  </ListItemText>
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
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "var(--primary_blue_color)" }} variant="rounded">
                      {avtr}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    sx={{ mr: 2, textAlign: "left", fontSize: "14px" }}
                  >
                    {chime?.roster[message.senderAttendeeId]?.name},{` `}
                    <Typography variant="caption">
                      {moment(message.timestampMs).format("h:mm A")}
                    </Typography>
                    <Paper elevation={0}>
                      <Typography variant="body1">{messageString}</Typography>
                    </Paper>
                  </ListItemText>
                </ListItem>
              );
            }
          })}
          <div className="bottom" ref={bottomElement} />
        </div>
        <div className={cx("Chat_chatInput")}>
          <ChatInput activeChannel={activeChannel} />
        </div>
      </Box>
    </Box>
  );
}
