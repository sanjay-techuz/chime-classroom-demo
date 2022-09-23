// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import classNames from 'classnames/bind';
import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { DataMessage } from 'amazon-chime-sdk-js';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import useRoster from '../hooks/useRoster';
import styles from './Chat.css';
import ChatInput from './ChatInput';
import MessageTopic from '../enums/MessageTopic';
import RosterAttendeeType from '../types/RosterAttendeeType';
import localStorageKeys from '../constants/localStorageKeys.json'
import { createPrivateChannel } from '../utils';

const cx = classNames.bind(styles);

export default function Chat() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [messages, setMessages] = useState<DataMessage[]>([]);
  const [filterMessage, setFilterMessage] = useState<DataMessage[]>([]);
  const [activeChannel,setActiveChannel] = useState<string>(MessageTopic.PublicChannel);
  const [activeChatAttendee,setActiveChatAttendee] = useState<string>(MessageTopic.PublicChannel);
  const bottomElement = useRef(null);
  const roster = useRoster();
  const localUserId: string = chime?.meetingSession?.configuration?.credentials?.attendeeId;

  let chatAttendeeIds;
  if (chime?.meetingSession && roster) {
    chatAttendeeIds = Object.keys(roster).filter((attendeeId: string) => attendeeId !== localUserId);
    chatAttendeeIds = chatAttendeeIds.filter((attendeeId: string) => attendeeId !== localStorage.getItem(localStorageKeys.CURRENT_RECORDER_ID));
  }

  useEffect(() => {
    const realTimeMessages: DataMessage[] = [];
    const callback = (message: DataMessage) => {
      realTimeMessages.push(message);
      setMessages(realTimeMessages.slice() as DataMessage[]);
    };

    const chatMessageUpdateCallback = { topic: MessageTopic.GroupChat, callback };

    const raiseHandMessageUpdateCallback = {
      topic: MessageTopic.RaiseHand,
      callback
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
      ((bottomElement.current as unknown) as HTMLDivElement).scrollIntoView({
        behavior: 'smooth'
      });
    }, 10);
  }, [messages]);

  useEffect(() => {
    const filteredArry = [];
    messages.forEach((message) => {
      if(message.topic === MessageTopic.GroupChat){
          const msgObj = JSON.parse(new TextDecoder().decode(message.data));
        if(msgObj.channel === activeChannel){
          filteredArry.push(message);
        }
      }
    })
    setFilterMessage([...filteredArry]);
  },[messages,activeChannel])

  return (
    <div className={cx('Chat_chat')}>
      <div className={cx('Chat_attendee_list')}>
      <span className={cx('Chat_initials',{
            Chat_active_initials: activeChatAttendee === MessageTopic.PublicChannel
          })} onClick={() => {
        setActiveChatAttendee(MessageTopic.PublicChannel);
        setActiveChannel(MessageTopic.PublicChannel);
      } 
        }>All</span>
        {chatAttendeeIds.map((chatAttdId: string) => {
        const rosterAttendee: RosterAttendeeType = roster[chatAttdId];
        const initials = rosterAttendee?.name?.replace(/[^a-zA-Z- ]/g, "").match(/\b\w/g)?.join('')
        return (
          <span key={`${new Date().getTime()}_${chatAttdId}`} className={cx('Chat_initials',{
            Chat_active_initials: activeChatAttendee === chatAttdId
          })} onClick={() => {
            setActiveChatAttendee(chatAttdId);
            setActiveChannel(createPrivateChannel(localUserId, chatAttdId))
          }}>{initials}</span>
        )
      })}
      </div>
      <div className={cx('Chat_messages')}>
        {filterMessage.map(message => {
          let messageString: string;
          if (message.topic === MessageTopic.GroupChat) {
            messageString = JSON.parse(new TextDecoder().decode(message.data)).sendingMessage;
          } else if (message.topic === MessageTopic.RaiseHand) {
            messageString = `✋`;
          }

          if(message.senderAttendeeId === localUserId){
            return (
              <div
                key={message.timestampMs}
                className={cx('Chat_sender_messageWrapper', {
                  Chat_raiseHand: message.topic === MessageTopic.RaiseHand
                })}
              >
                <div className={cx('Chat_right_Wrapper')}>
                <div className={cx('Chat_senderWrapper')}>
                  <div className={cx('Chat_senderName')}>
                    {chime?.roster[message.senderAttendeeId]?.name}
                  </div>
                  <div className={cx('Chat_date')}>
                    {moment(message.timestampMs).format('h:mm A')}
                  </div>
                </div>
                <div className={cx('Chat_message')}>{messageString}</div>
                </div>
              </div>
            );
          }else{
            return (
              <div
                key={message.timestampMs}
                className={cx('Chat_reciever_messageWrapper', {
                  Chat_raiseHand: message.topic === MessageTopic.RaiseHand
                })}
              >
              <div className={cx('Chat_left_Wrapper')}>
                <div className={cx('Chat_senderWrapper')}>
                  <div className={cx('Chat_senderName')}>
                    {chime?.roster[message.senderAttendeeId]?.name}
                  </div>
                  <div className={cx('Chat_date')}>
                    {moment(message.timestampMs).format('h:mm A')}
                  </div>
                </div>
                <div className={cx('Chat_message')}>{messageString}</div>
                </div>
              </div>
            );
          }
        })}
        <div className="bottom" ref={bottomElement} />
      </div>
      <div className={cx('Chat_chatInput')}>
        <ChatInput activeChannel={activeChannel} />
      </div>
    </div>
  );
}