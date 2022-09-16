// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import classNames from 'classnames/bind';
import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { DataMessage } from 'amazon-chime-sdk-js';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import styles from './Chat.css';
import ChatInput from './ChatInput';
import MessageTopic from '../enums/MessageTopic';

const cx = classNames.bind(styles);

export default function Chat() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [messages, setMessages] = useState<DataMessage[]>([]);
  const bottomElement = useRef(null);

  useEffect(() => {
    const realTimeMessages: DataMessage[] = [];
    const callback = (message: DataMessage) => {
      realTimeMessages.push(message);
      setMessages(realTimeMessages.slice() as DataMessage[]);
    };

    const chatMessageUpdateCallback = { topic: MessageTopic.Chat, callback };
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

  return (
    <div className={cx('Chat_chat')}>
      <div className={cx('Chat_messages')}>
        {messages.map(message => {
          let messageString;
          if (message.topic === MessageTopic.Chat) {
            messageString = message.text();
          } else if (message.topic === MessageTopic.RaiseHand) {
            messageString = `✋`;
          }

          return (
            <div
              key={message.timestampMs}
              className={cx('Chat_messageWrapper', {
                Chat_raiseHand: message.topic === MessageTopic.RaiseHand
              })}
            >
              <div className={cx('Chat_senderWrapper')}>
                <div className={cx('Chat_senderName')}>
                  {chime?.roster[message.senderAttendeeId].name}
                </div>
                <div className={cx('Chat_date')}>
                  {moment(message.timestampMs).format('h:mm A')}
                </div>
              </div>
              <div className={cx('Chat_message')}>{messageString}</div>
            </div>
          );
        })}
        <div className="bottom" ref={bottomElement} />
      </div>
      <div className={cx('Chat_chatInput')}>
        <ChatInput />
      </div>
    </div>
  );
}
