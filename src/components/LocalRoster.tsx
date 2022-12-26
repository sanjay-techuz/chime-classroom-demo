// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React from "react";

import VideoNameplate from "./VideoNameplate";
import styles from "./RosterLayout.css";
import { nameInitials } from "../utils";
import { Avatar, Badge, Typography } from "@mui/material";
import SmallAvatar from "../custom/roster/SmallAvatar";
import useRoster from "../hooks/useRoster";
import RosterAttendeeType from "../types/RosterAttendeeType";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";

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
  // const volume = rosterAttendee?.volume ? rosterAttendee?.volume : 0;
  const muted = rosterAttendee?.muted ? rosterAttendee?.muted : false;

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
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <SmallAvatar
                className={cx("Mui_roster_layout_badge_small_avatar")}
                bgcolor={
                  muted ? "var(--color_pink)" : "var(--secondary_blue_color)"
                }
              >
                {muted ? (
                  <MicOffOutlinedIcon
                    className={cx("Mui_roster_layout_fontsize")}
                  />
                ) : (
                  <MicNoneOutlinedIcon
                    className={cx("Mui_roster_layout_fontsize")}
                  />
                )}
              </SmallAvatar>
            }
          >
            <Avatar className={cx("Mui_roster_layout_badge_avatar")}>
              {initials}
            </Avatar>
          </Badge>
          <Typography className={cx("Mui_roster_layout_badge_typography")}>
            {name}
          </Typography>
          {attendeeId === localStorage.getItem("hostId") && (
            <span className={"RosterLayout_host"}>Host</span>
          )}
        </>
      )}
    </div>
  );
}
