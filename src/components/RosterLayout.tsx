// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React from "react";
import { useIntl } from "react-intl";

import ViewMode from "../enums/ViewMode";
import Size from "../enums/Size";
import VideoNameplate from "./VideoNameplate";
import styles from "./RosterLayout.css";
import { nameInitials } from "../utils";
import { Avatar, Badge } from "@mui/material";
import SmallAvatar from "../custom/roster/SmallAvatar";
import useRoster from "../hooks/useRoster";
import RosterAttendeeType from "../types/RosterAttendeeType";
// import useRoster from "../hooks/useRoster";
// import RosterAttendeeType from "../types/RosterAttendeeType";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";

const cx = classNames.bind(styles);

type Props = {
  viewMode: ViewMode;
  size: Size;
  attendeeId: string;
  raisedHand?: boolean;
  activeSpeaker?: boolean;
  isContentShareEnabled: boolean;
  name: string;
};

export default function RosterLayout(props: Props) {
  const intl = useIntl();
  const {
    viewMode,
    size = Size.Large,
    attendeeId,
    raisedHand,
    activeSpeaker,
    isContentShareEnabled,
    name,
  } = props;
  const initials = nameInitials(name);
  const roster = useRoster();
  const rosterAttendee: RosterAttendeeType = roster[attendeeId];
  // const volume = rosterAttendee?.volume ? rosterAttendee?.volume : 0;
  const muted = rosterAttendee?.muted ? rosterAttendee?.muted : false;

  return (
    <div
      className={cx("RosterLayout_remoteVideo", {
        activeSpeaker,
      })}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          <SmallAvatar
            sx={{ width: "2rem", height: "2rem"}}
            bgcolor={
              muted
                ? "var(--color_pink)"
                : "var(--secondary_blue_color)"
            }
          >
            {muted ? (
              <MicOffOutlinedIcon sx={{ fontSize: "14px" }} />
            ) : (
              <MicNoneOutlinedIcon sx={{ fontSize: "14px" }} />
            )}
          </SmallAvatar>
        }
      >
        <Avatar
          sx={{
            width: "100px",
            height: "100px",
            backgroundColor: "var(--pure_white_color)",
            color: "var(--secondary_blue_color)",
            textTransform: "capitalize",
            fontSize: "3rem",
          }}
        >
          {initials}
        </Avatar>
      </Badge>

      {/* <span className={cx("RosterLayout_initials",
      // {
      //   RosterLayout_initials1: volume >= 0 && volume < 15 && !muted,
      //   RosterLayout_initials2: volume >= 15 && volume < 30 && !muted,
      //   RosterLayout_initials3: volume >= 30 && volume < 45 && !muted,
      //   RosterLayout_initials4: volume >= 45 && volume < 60 && !muted,
      //   RosterLayout_initials5: volume >= 60 && volume < 75 && !muted,
      //   RosterLayout_initials6: volume >= 75 && !muted,
      // }
      )}>{initials}</span> */}
      <VideoNameplate
        viewMode={viewMode}
        size={size}
        isContentShareEnabled={isContentShareEnabled}
        attendeeId={attendeeId}
      />
      {raisedHand && (
        <div className={cx("RemoteVideo_raisedHand")}>
          <span
            role="img"
            aria-label={intl.formatMessage({
              id: "RemoteVideo.raiseHandAriaLabel",
            })}
          >
            ✋
          </span>
        </div>
      )}
    </div>
  );
}
