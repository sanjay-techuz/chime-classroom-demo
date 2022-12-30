// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React from "react";

import VideoNameplate from "./VideoNameplate";
import styles from "./RosterLayout.css";
import { nameInitials } from "../../utils";
import { Avatar, Typography } from "@mui/material";
import useRoster from "../../hooks/useRoster";
import RosterAttendeeType from "../../types/RosterAttendeeType";

const cx = classNames.bind(styles);

type Props = {
  attendeeId: string;
  name: string;
  view?: string;
};

export default function LocalRoster(props: Props) {
  const { attendeeId, name, view } = props;
  const initials = nameInitials(name);
  const roster = useRoster();
  const rosterAttendee: RosterAttendeeType = roster[attendeeId];

  return (
    <div
      className={cx("RosterLayout_remoteVideo", {
        activeSpeakerViewMode: view === "activeSpeaker",
      })}
    >
      {view === "activeSpeaker" ? (
        <>
          <Typography
            className={cx("Mui_roster_layout_active_speaker_typography")}
          >
            {name}
          </Typography>
          <VideoNameplate attendeeId={attendeeId} />
        </>
      ) : (
        <>
            <Avatar className={cx("Mui_roster_layout_badge_avatar")}>
              {initials}
            </Avatar>
          <Typography className={cx("Mui_roster_layout_badge_typography")}>
            {name}
          </Typography>
          {rosterAttendee?.host && (
            <span className={"RosterLayout_host"}>Host</span>
          )}
        </>
      )}
    </div>
  );
}
