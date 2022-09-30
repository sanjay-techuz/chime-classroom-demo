// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import { useContext, useEffect, useState } from 'react';

import { DataMessage } from 'amazon-chime-sdk-js';
import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import MessageTopic from '../enums/MessageTopic';

export default function useRaisedHandAttendees() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [raisedHandAttendees, setRaisedHandAttendees] = useState(new Set());
  useEffect(() => {
    const realTimeRaisedHandAttendees = new Set();
    const callback = (message: DataMessage) => {
      const attendeeId = message.text();
      if (attendeeId) {
        if (message.topic === MessageTopic.RaiseHand) {
          realTimeRaisedHandAttendees.add(attendeeId);
        } else if (message.topic === MessageTopic.DismissHand) {
          realTimeRaisedHandAttendees.delete(attendeeId);
        }
        setRaisedHandAttendees(new Set(realTimeRaisedHandAttendees));
      }
    };
    const raiseHandMessageUpdateCallback = {
      topic: MessageTopic.RaiseHand,
      callback
    };
    const dismissHandMessageUpdateCallback = {
      topic: MessageTopic.DismissHand,
      callback
    };
    chime?.subscribeToMessageUpdate(raiseHandMessageUpdateCallback);
    chime?.subscribeToMessageUpdate(dismissHandMessageUpdateCallback);
    return () => {
      chime?.unsubscribeFromMessageUpdate(raiseHandMessageUpdateCallback);
      chime?.subscribeToMessageUpdate(dismissHandMessageUpdateCallback);
    };
  }, []);
  return raisedHandAttendees;
}
