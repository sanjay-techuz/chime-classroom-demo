/* eslint-disable  */

import classNames from "classnames/bind";
import React from "react";

import VideoNameplate from "./VideoNameplate";
import styles from "./RosterLayout.css";
import { nameInitials } from "../utils";
import { Avatar, Typography } from "@mui/material";

const cx = classNames.bind(styles);

type Props = {
  muted?: boolean;
  host?: boolean;
  name?: string;
  view?: string;
};

export default React.memo(function LocalRoster(props: Props) {
  const { muted = false, host = false, name = "", view } = props;
  const initials = nameInitials(name);

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
          <VideoNameplate name={name} muted={muted} />
        </>
      ) : (
        <>
            <Avatar className={cx("Mui_roster_layout_badge_avatar")}>
              {initials}
            </Avatar>
          <Typography className={cx("Mui_roster_layout_badge_typography")}>
            {name}
          </Typography>
          {host && (
            <span className={"RosterLayout_host"}>Host</span>
          )}
        </>
      )}
    </div>
  );
});
