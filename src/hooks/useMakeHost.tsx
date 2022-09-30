// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import { useContext, useEffect, useState } from 'react';
import { DataMessage } from 'amazon-chime-sdk-js';
import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import MessageTopic from '../enums/MessageTopic';
import { getAttendee } from '../services';

export default function useMakeHost() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [makeHost, setMAkeHpst] = useState(false);
  const localUserId = chime?.meetingSession?.configuration?.credentials?.attendeeId;

  useEffect(() => {
    const callback = async(message: DataMessage) => {
      if (message.senderAttendeeId === localUserId) {
        return;
      }
      const { focus, targetId } = message.json();
      if(targetId === localUserId){
        const res = await getAttendee(chime?.title,localUserId);
        chime.isHost = res.AttendeeInfo?.Host === "true" ? true : false || false;
      }
      setMAkeHpst(!!focus);
    };
    const makeHostCallback = { topic: MessageTopic.MakeHost, callback };
    chime?.subscribeToMessageUpdate(makeHostCallback);
    return () => {
      chime?.unsubscribeFromMessageUpdate(makeHostCallback);
    };
  }, []);
  return makeHost;
}
