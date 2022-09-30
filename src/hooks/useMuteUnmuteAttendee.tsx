// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import { useContext, useEffect, useState } from 'react';

import { DataMessage } from 'amazon-chime-sdk-js';
import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import MessageTopic from '../enums/MessageTopic';

export default function useMuteUnmuteAttendee() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [remoteMuteUnmute, setRemoteMuteUnmute] = useState(false);
  const [state] = useContext(getUIStateContext());
  const localUserId = chime?.meetingSession?.configuration?.credentials?.attendeeId;

  useEffect(() => {
    const callback = (message: DataMessage) => {
      if (chime?.isHost) {
        return;
      }
      const { focus, targetId } = message.json();
      if(targetId === localUserId){
        chime?.audioVideo?.realtimeSetCanUnmuteLocalAudio(!focus);
        if (focus) {
            chime?.audioVideo?.realtimeMuteLocalAudio();
        }else{
            chime?.audioVideo?.realtimeUnmuteLocalAudio();   
        }
        setRemoteMuteUnmute(!!focus);
      }
    };
    const remoteMuteUnmuteUpdateCallback = { topic: MessageTopic.RemoteMuteUnmute, callback };
    chime?.subscribeToMessageUpdate(remoteMuteUnmuteUpdateCallback);
    return () => {
      chime?.unsubscribeFromMessageUpdate(remoteMuteUnmuteUpdateCallback);
    };
  }, []);
  return remoteMuteUnmute;
}
