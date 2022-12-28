// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React from "react";
import { useIntl } from "react-intl";

import VideoNameplate from "./VideoNameplate";
import styles from "./RosterLayout.css";
import { nameInitials } from "../utils";
import { Avatar, Typography } from "@mui/material";
import useRoster from "../hooks/useRoster";
import RosterAttendeeType from "../types/RosterAttendeeType";
import Icons from "../custom/Icons";
import { Box } from "@mui/system";

const cx = classNames.bind(styles);

type Props = {
  attendeeId: string;
  raisedHand?: boolean;
  activeSpeaker?: boolean;
  name: string;
  view?: string;
};

export default function RosterLayout(props: Props) {
  const intl = useIntl();
  const { attendeeId, activeSpeaker, name, view } = props;
  const initials = nameInitials(name);
  const roster = useRoster();
  const rosterAttendee: RosterAttendeeType = roster[attendeeId];

  return (
    <div
      className={cx("RosterLayout_remoteVideo", {
        activeSpeaker,
        activeSpeakerViewMode: view === "activeSpeaker",
      })}
    >
      {view === "activeSpeaker" ? (
        <>
          <Typography
            className={cx("Mui_roster_layout_active_speaker_typography")}
          >
            {rosterAttendee?.name}
          </Typography>
          <VideoNameplate attendeeId={attendeeId} />
          {rosterAttendee?.raised && (
        <div className={cx("RemoteVideo_raisedHand")}>
          <span
            role="img"
            aria-label={intl.formatMessage({
              id: "RemoteVideo.raiseHandAriaLabel",
            })}
          >
            <Icons src={"/icons/hand_yellow.svg"} />
          </span>
        </div>
      )}
        </>
      ) : (
        <>
        {rosterAttendee?.raised && <Box className={cx("Mui_roster_layout_raised_hand_box")}>{rosterAttendee?.name} raised a hand <Icons src={"/icons/hand_yellow.svg"} /></Box>}
            <Avatar className={cx("Mui_roster_layout_badge_avatar")}>
              {initials}
            </Avatar>
          <Typography className={cx("Mui_roster_layout_badge_typography")}>
            {rosterAttendee?.name}
          </Typography>
          {rosterAttendee?.host && (
            <span className={cx("RosterLayout_host")}>Host</span>
          )}
        </>
      )}
    </div>
  );
}
