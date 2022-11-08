// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import {
  MeetingSessionStatus,
  MeetingSessionStatusCode
} from 'amazon-chime-sdk-js';
import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import getMeetingStatusContext from '../context/getMeetingStatusContext';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import MeetingStatus from '../enums/MeetingStatus';
// import common from "../constants/common.json";
import routes from "../constants/routes.json";

type Props = {
  children: ReactNode;
};

export default function MeetingStatusProvider(props: Props) {
  const MeetingStatusContext = getMeetingStatusContext();
  const { children } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [meetingStatus, setMeetingStatus] = useState<{
    meetingStatus: MeetingStatus;
    errorMessage?: string;
  }>({
    meetingStatus: MeetingStatus.Loading
  });
  const [state] = useContext(getUIStateContext());
  const history = useHistory();
  const query = new URLSearchParams(useLocation().search);
  const audioElement = useRef(null);

  const meetingName = query.get('meetingName') || query.get('meetingID') || "";
  const meetingID = query.get('meetingID') || "";
  const id = query.get('id') || "";
  const batchId = query.get('batchId') || "";
  const userName = query.get('userName') || "";
  // const mode = query.get('mode') || "";
  const userID = query.get('userID') || "";
  const duration = query.get("duration") || "";

  useEffect(() => {
    const start = async () => {
      try {
        await chime?.createRoom(
          meetingName,
          meetingID,
          id,
          batchId,
          userName,
          userID,
          duration,
          state.classMode === ClassMode.Student ? 'student' : 'teacher',
          query.get('optionalFeature')
        );

        setMeetingStatus({
          meetingStatus: MeetingStatus.Succeeded
        });

        chime?.audioVideo?.addObserver({
          audioVideoDidStop: (sessionStatus: MeetingSessionStatus): void => {
            if (
              sessionStatus.statusCode() ===
              MeetingSessionStatusCode.AudioCallEnded
            ) {
              // history.push('/');
              if(state.classMode === ClassMode.Teacher){
                chime?.leaveRoom(true);
                history.push(`${routes.MAIN}?id=${id}`);
                // window.location.href = `${common.domain}complete?id=${id}`;
              }else{
                chime?.leaveRoom(false);
                history.push(routes.MAIN);
                // window.location.href = `${common.domain}complete`;
              }
              
            }
          }
        });

        await chime?.joinRoom(audioElement.current);
      } catch (error: any) {
        // eslint-disable-next-line
        console.error(error);
        setMeetingStatus({
          meetingStatus: MeetingStatus.Failed,
          errorMessage: error.message
        });
      }
    };
    start();
  }, []);

  return (
    <MeetingStatusContext.Provider value={meetingStatus}>
      {/* eslint-disable-next-line */}
      <audio id="audioElement" ref={audioElement} style={{ display: 'none' }} />
      {children}
    </MeetingStatusContext.Provider>
  );
}
