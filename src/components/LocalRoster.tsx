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

const cx = classNames.bind(styles);

type Props = {
  viewMode: ViewMode;
  size: Size;
  attendeeId: string | null;
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
  return (
    <div className={cx("RosterLayout_remoteVideo")}>
      <span className={cx("RosterLayout_initials")}>{initials}</span>
      <VideoNameplate
        viewMode={viewMode}
        size={size}
        isContentShareEnabled={isContentShareEnabled}
        attendeeId={attendeeId}
      />
    </div>
  );
}
