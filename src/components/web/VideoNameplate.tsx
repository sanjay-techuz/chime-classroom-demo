// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React from "react";
import Icons from "../../custom/Icons";

import useAttendee from "../../hooks/useAttendee";
import styles from "./VideoNameplate.css";

const cx = classNames.bind(styles);

type Props = {
  attendeeId: string | null;
};

export default React.memo(function VideoNameplate(props: Props) {
  const { attendeeId } = props;
  if (!attendeeId) {
    return <></>;
  }

  const attendee = useAttendee(attendeeId);
  if (!attendee.name || typeof !attendee.muted !== "boolean") {
    return <></>;
  }

  const { name, muted } = attendee;
  return (
    <div className={cx("VideoNameplate_videoNameplate")}>
      <div className={cx("VideoNameplate_muted")}>
        {muted ? (
          <Icons src={"/icons/microphone_red_small.svg"} />
        ) : (
          <Icons src={"/icons/microphone_on_grey.svg"} />
        )}
      </div>
      <div className={cx("VideoNameplate_name")}>{name}</div>
    </div>
  );
});
