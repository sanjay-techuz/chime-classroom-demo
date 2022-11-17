// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React from "react";

import ViewMode from "../enums/ViewMode";
import Size from "../enums/Size";
import VideoNameplate from "./VideoNameplate";
import styles from "./RosterLayout.css";
import { nameInitials } from "../utils";
// import useRoster from "../hooks/useRoster";
// import RosterAttendeeType from "../types/RosterAttendeeType";

const cx = classNames.bind(styles);

type Props = {
  viewMode: ViewMode;
  size: Size;
  attendeeId: string;
  isContentShareEnabled: boolean;
  name: string;
};

export default function LocalRoster(props: Props) {
  const {
    viewMode,
    size = Size.Large,
    attendeeId,
    isContentShareEnabled,
    name,
  } = props;
  const initials = nameInitials(name);
  // const roster = useRoster();
  // const rosterAttendee: RosterAttendeeType = roster[attendeeId];
  // const volume = rosterAttendee?.volume ? rosterAttendee?.volume : 0;
  // const muted = rosterAttendee?.muted ? rosterAttendee?.muted : false;

  return (
    <div className={cx("RosterLayout_remoteVideo")}>
      <span className={cx("RosterLayout_initials",
      // {
      //   RosterLayout_initials1: volume >= 0 && volume < 15 && !muted,
      //   RosterLayout_initials2: volume >= 15 && volume < 30 && !muted,
      //   RosterLayout_initials3: volume >= 30 && volume < 45 && !muted,
      //   RosterLayout_initials4: volume >= 45 && volume < 60 && !muted,
      //   RosterLayout_initials5: volume >= 60 && volume < 75 && !muted,
      //   RosterLayout_initials6: volume >= 75 && !muted,
      // }
      )}>{initials}</span>
      <VideoNameplate
        viewMode={viewMode}
        size={size}
        isContentShareEnabled={isContentShareEnabled}
        attendeeId={attendeeId}
      />
    </div>
  );
}
