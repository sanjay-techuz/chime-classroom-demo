// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useContext, useEffect, useRef, useState } from "react";
import { DataMessage } from "amazon-chime-sdk-js";
import { useIntl } from "react-intl";

import {
  Box,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Tooltip,
  IconButton,
  Divider,
  ListItemIcon,
} from "@mui/material";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
import useRoster from "../hooks/useRoster";
import styles from "./Chat.css";
import ChatInput from "./ChatInput";
import MessageTopic from "../enums/MessageTopic";
import localStorageKeys from "../constants/localStorageKeys.json";
import { clipBoard, createPrivateChannel } from "../utils";
import useRemoteControl from "../hooks/useRemoteControl";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Icons from "../custom/Icons";

const cx = classNames.bind(styles);
var chatPannelOpen = false;
var grpCnt = 0;
var gbRoster: any;
var currentChannel: string = MessageTopic.PublicChannel;
var publicChannelCnt = 0;

type Props = {
  openParticipants: boolean;
  closeChatPanel: () => void;
};
export default function Chat(props: Props) {
  const { openParticipants, closeChatPanel } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const intl = useIntl();

  const { globalVar, updateGlobalVar } = useContext(getGlobalVarContext());
  const { isChatOpen } = globalVar;
  const [messages, setMessages] = useState<DataMessage[]>([]);
  const [filterMessage, setFilterMessage] = useState<DataMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>(
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
        <Box>
          <ListItem>
            <ListItemText>
              <span className={cx("Chat_chat_header")}>{intl.formatMessage({ id: "Classroom.chat" })}</span>
            </ListItemText>
            <ListItemIcon sx={{ justifyContent: "flex-end", color: "var(--pure_white_color)", cursor: "pointer" }} onClick={closeChatPanel}><Icons src={"/icons/close.svg"} height={15} width={15} /></ListItemIcon>
          </ListItem>
        </Box>
        <Divider
          sx={{
            margin: "auto",
            borderColor: "rgb(77 76 76 / 80%)",
            borderBottomWidth: "thin",
            width: "90%",
          }}
        />
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={openParticipants ? { maxHeight:"240px"} : {maxHeight: "590px"}} className={cx("Chat_messages")}>
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
              return (
                <ListItem
                  key={message.timestampMs}
                  component="div"
                  sx={{
                    flexDirection: "row-reverse",
                    alignItems: "flex-start",
                    padding: 0
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
                          fontStyle: "normal",
                          fontWeight: 500,
                          fontSize: "10px",
                          lineHeight: "14px",
                          letterSpacing: "0.08px",
                          color: "#FFFFFF"
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
                        backgroundColor: "transparent"
                      }}
                    >
                      <Typography
                        sx={{
                          overflowWrap: "anywhere",
                          minWidth: "75px",
                          display:"flex",
                          justifyContent: "flex-end"
                        }}
                        variant="body1"
                      >
                        <div className={cx("Chat_message_string_parent")}><span className={cx("Chat_message_string")}>{messageString}</span></div>
                      </Typography>
                    </Paper>
                  </ListItemText>
                  <div className={cx(`moreButton_${index}`)} style={{ opacity:0, padding: "15px" }} defaultValue={messageString} >
                  <Tooltip title={"Copy"} placement="bottom">
                    <IconButton onClick={() => {
                        clipBoard(messageString);                         
                    }} sx={{ padding: "0px !important"}}>
                      <ContentCopyIcon sx={{
                        height: "12px !important",
                        color: "var(--pure_white_color)"
                      }}/>
                    </IconButton>
                  </Tooltip>
                  </div>
                </ListItem>
              );
            } else {
              return (
                <ListItem
                  key={message.timestampMs}
                  component="div"
                  sx={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    padding: 0
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
                  <ListItemText
                    sx={{ ml: 2, mt: 0, textAlign: "left", fontSize: "14px" }}
                  >
                    <div
                      style={{
                        height: "24px",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "flex-start",
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
                          fontStyle: "normal",
                          fontWeight: 500,
                          fontSize: "10px",
                          lineHeight: "14px",
                          letterSpacing: "0.08px",
                          color: "#FFFFFF"
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
                        backgroundColor: "transparent"
                      }}
                    >
                      <Typography
                        sx={{
                          overflowWrap: "anywhere",
                          minWidth: "75px",
                          display:"flex",
                          justifyContent: "flex-start"
                        }}
                        variant="body1"
                      >
                        <div className={cx("Chat_message_string_parent")}><span className={cx("Chat_message_string")}>{messageString}</span></div>
                      </Typography>
                    </Paper>
                  </ListItemText>
                  <div className={cx(`moreButton_${index}`)} style={{ opacity:0, padding: "15px"  }} defaultValue={messageString} >
                  <Tooltip title={"Copy"} placement="bottom">
                    <IconButton onClick={() => {
                        clipBoard(messageString);                         
                    }} sx={{ padding: "0px !important"}}>
                      <ContentCopyIcon sx={{
                        height:"12px !important",
                        color: "var(--pure_white_color)"
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
          publicChannelCnt={publicChannelCnt}
            changeChannel={(type: string,chatAttdId: string,msgCount: number) => {
              if(type === MessageTopic.PublicChannel){
                setActiveChannel(MessageTopic.PublicChannel);
                currentChannel = MessageTopic.PublicChannel;
                publicChannelCnt = 0;
                updateGlobalVar("groupChatCounter", grpCnt + publicChannelCnt);
              }else{
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
              }
            }}
          />
        </div>
      </Box>
    </Box>
  );
}
