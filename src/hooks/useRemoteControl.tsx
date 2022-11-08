// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { DataMessage } from "amazon-chime-sdk-js";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
// import getUIStateContext from "../context/getUIStateContext";
import getMeetingStatusContext from "../context/getMeetingStatusContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
import ClassMode from "../enums/ClassMode";
import MessageTopic from "../enums/MessageTopic";
import MeetingStatus from "../enums/MeetingStatus";
// import common from "../constants/common.json";
import routes from "../constants/routes.json";

export default function useRemoteControl() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { meetingStatus } = useContext(getMeetingStatusContext());
  const { globalVar,updateGlobalVar } = useContext(getGlobalVarContext());
  const { classMode } = globalVar;
  // const [state] = useContext(getUIStateContext());
  const history = useHistory();
  const localUserId =
    chime?.meetingSession?.configuration?.credentials?.attendeeId;

  useEffect(() => {
    if (meetingStatus !== MeetingStatus.Succeeded) {
      return;
    }

    const callback = async (message: DataMessage) => {
      if (classMode === ClassMode.Teacher) {
        return;
      }
      const { topic } = message;
      const { focus, targetId } = message.json();

      switch (topic) {
        case MessageTopic.RemoteMuteUnmute:
          if (targetId === localUserId) {
            chime?.audioVideo?.realtimeSetCanUnmuteLocalAudio(!focus);
            if (focus) {
              chime?.audioVideo?.realtimeMuteLocalAudio();
            } else {
              chime?.audioVideo?.realtimeUnmuteLocalAudio();
            }
          }
          break;
        case MessageTopic.RemoveAttendee:
          if (targetId === localUserId) {
            if (focus) {
              chime?.leaveRoom(false);
              // window.location.href = `${common.domain}complete`
              history.push(routes.MAIN);
            }
          }
          break;
        case MessageTopic.RemoteVideoOnOff:
          if (targetId === localUserId) {
            try {
              if (!chime?.currentVideoInputDevice) {
                throw new Error("currentVideoInputDevice does not exist");
              }
              await chime?.chooseVideoInputDevice(
                chime?.currentVideoInputDevice
              );
              if (focus) {
                chime?.audioVideo?.startLocalVideoTile();
                updateGlobalVar("localVideo",true);
              } else {
                chime?.audioVideo?.stopLocalVideoTile();
                updateGlobalVar("localVideo",false);
              }
            } catch (error) {
              console.error(error);
            }
          }
          break;
        default:
          break;
      }
    };

    const remoteMuteUnmuteUpdateCallback = {
      topic: MessageTopic.RemoteMuteUnmute,
      callback,
    };
    const remoteAttendeeRemoveUpdateCallback = {
      topic: MessageTopic.RemoveAttendee,
      callback,
    };
    const remoteVideoOnOffUpdateCallback = {
      topic: MessageTopic.RemoteVideoOnOff,
      callback,
    };
    chime?.subscribeToMessageUpdate(remoteMuteUnmuteUpdateCallback);
    chime?.subscribeToMessageUpdate(remoteAttendeeRemoveUpdateCallback);
    chime?.subscribeToMessageUpdate(remoteVideoOnOffUpdateCallback);
    return () => {
      chime?.unsubscribeFromMessageUpdate(remoteMuteUnmuteUpdateCallback);
      chime?.unsubscribeFromMessageUpdate(remoteAttendeeRemoveUpdateCallback);
      chime?.unsubscribeFromMessageUpdate(remoteVideoOnOffUpdateCallback);
    };
  }, [meetingStatus]);
}
