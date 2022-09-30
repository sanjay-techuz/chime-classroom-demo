// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import { useContext, useEffect, useState } from 'react';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import RosterType from '../types/RosterType';

export default function useNextAttendee() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const roster= useState<RosterType>(chime?.roster || {});
  const [nextAttendeeId, setNextAttendeeId] = useState('');
  const localUserId = chime?.meetingSession?.configuration?.credentials?.attendeeId;

  useEffect(() => {
    let attendeeIds = [];
    if (chime?.meetingSession && roster) {
      attendeeIds = Object.keys(roster).filter(attendeeId => attendeeId !== localUserId)
    }
    if(attendeeIds.length){
        setNextAttendeeId(attendeeIds[0]);
    }
  }, []);
  return nextAttendeeId;
}
