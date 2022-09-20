// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { DataMessage } from 'amazon-chime-sdk-js';
import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import MessageTopic from '../enums/MessageTopic';

export default function useRemoteAttendeeRemove() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [remoteAttendeeRemove, setRemoteAttendeeRemove] = useState(false);
  const [state] = useContext(getUIStateContext());
  const history = useHistory();
  const localUserId = chime?.meetingSession?.configuration?.credentials?.attendeeId;

  useEffect(() => {
    const callback = (message: DataMessage) => {
      if (state.classMode === ClassMode.Teacher) {
        return;
      }
      const { focus, targetId } = message.json();
      if(targetId === localUserId){
        if (focus) {
            chime?.leaveRoom(false);
            history.push('/');
        }
        setRemoteAttendeeRemove(!!focus);
      }
    };
    const remoteAttendeeRemoveUpdateCallback = { topic: MessageTopic.RemoveAttendee, callback };
    chime?.subscribeToMessageUpdate(remoteAttendeeRemoveUpdateCallback);
    return () => {
      chime?.unsubscribeFromMessageUpdate(remoteAttendeeRemoveUpdateCallback);
    };
  }, []);
  return remoteAttendeeRemove;
}
