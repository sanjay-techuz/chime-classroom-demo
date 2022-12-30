// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React from "react";
import { useIntl } from "react-intl";

import VideoNameplate from "./VideoNameplate";
import styles from "./RemoteVideo.css";
import Icons from "../../custom/icons";
import { Box } from "@mui/material";
import useRoster from "../../hooks/useRoster";
import RosterAttendeeType from "../../types/RosterAttendeeType";

const cx = classNames.bind(styles);

type Props = {
  enabled: boolean;
  videoElementRef: (instance: HTMLVideoElement | null) => void;
  attendeeId: string | null;
  raisedHand?: boolean;
  activeSpeaker?: boolean;
  view?: string;
};

export default function RemoteVideo(props: Props) {
  const intl = useIntl();
  const {
    enabled,
    videoElementRef,
    attendeeId,
    activeSpeaker,
    view,
  } = props;
  const roster = useRoster();
  const rosterAttendee: RosterAttendeeType = roster[attendeeId!];

  return (
    <div
      className={cx("RemoteVideo_remoteVideo", {
        enabled,
        activeSpeaker,
        activeSpeakerViewMode: view === "activeSpeaker",
      })}
    >
      <video muted ref={videoElementRef} className={cx("RemoteVideo_video")} />
      <VideoNameplate attendeeId={attendeeId} />

      {rosterAttendee?.raised && (
        view !== "activeSpeaker" ? 
        <Box className={cx("Mui_roster_layout_raised_hand_box")}>{rosterAttendee?.name} raised a hand <Icons src={"/icons/hand_yellow.svg"} /></Box>
        :
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
    </div>
  );
}
