// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import { useContext, useEffect, useState } from 'react';

import { DataMessage } from 'amazon-chime-sdk-js';
import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import getUIStateContext from '../context/getUIStateContext';
import MessageTopic from '../enums/MessageTopic';

export default function useFocusMode() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [focusMode, setFocusMode] = useState(false);
  const [state] = useContext(getUIStateContext());
  useEffect(() => {
    const callback = (message: DataMessage) => {
      if (chime?.isHost) {
        return;
      }
      const { focus } = message.json();
      chime?.audioVideo?.realtimeSetCanUnmuteLocalAudio(!focus);
      if (focus) {
        chime?.audioVideo?.realtimeMuteLocalAudio();
      }
      setFocusMode(!!focus);
    };
    const focusMessageUpdateCallback = { topic: MessageTopic.Focus, callback };
    chime?.subscribeToMessageUpdate(focusMessageUpdateCallback);
    return () => {
      chime?.unsubscribeFromMessageUpdate(focusMessageUpdateCallback);
    };
  }, []);
  return focusMode;
}
