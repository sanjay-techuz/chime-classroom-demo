// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React from "react";

import ViewMode from "../enums/ViewMode";
import useAttendee from "../hooks/useAttendee";
import Size from "../enums/Size";
import styles from "./VideoNameplate.css";

const cx = classNames.bind(styles);

type Props = {
  viewMode: ViewMode;
  size: Size;
  attendeeId: string | null;
};

export default function VideoNameplate(props: Props) {
  const { viewMode, size, attendeeId } = props;
  if (!attendeeId) {
    return <></>;
  }

  const attendee = useAttendee(attendeeId);
  if (!attendee.name || typeof !attendee.muted !== "boolean") {
    return <></>;
  }

  const { name } = attendee;
  return (
    <div
      className={cx("VideoNameplate_videoNameplate", {
        roomMode: viewMode === ViewMode.Room,
        small: size === Size.Small,
        medium: size === Size.Medium,
        large: size === Size.Large,
      })}
    >
      <div className={cx("VideoNameplate_name")}>{name}</div>
      {/* <div className={cx("VideoNameplate_muted")}>
        {muted ? (
          <i className="fas fa-microphone-slash" />
        ) : (
          <i className="fas fa-microphone" />
        )}
      </div> */}
    </div>
  );
}
