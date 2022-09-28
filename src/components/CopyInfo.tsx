// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useState, useContext } from "react";
import { useIntl } from "react-intl";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import Tooltip from "./Tooltip";
import styles from "./CopyInfo.css";

const cx = classNames.bind(styles);

export default function CopyInfo() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [isMeetingCoppied, setIsMeetingCoppied] = useState(false);
  const [isMeetingUrlCoppied, setIsMeetingUrlCoppied] = useState(false);

  const intl = useIntl();

  const copyMeetinId = () => {
    setIsMeetingCoppied(true);
    navigator.clipboard.writeText(chime?.title);
    setTimeout(() => {
      setIsMeetingCoppied(false);
    }, 5000);
  };

  const copyMeetingUrl = () => {
    setIsMeetingUrlCoppied(true);
    const url = new URL(window.location.href);
    const meetingUrl = `${url.origin}/?meetingId=${encodeURIComponent(chime?.title)}`
    navigator.clipboard.writeText(meetingUrl);
    setTimeout(() => {
      setIsMeetingUrlCoppied(false);
    }, 5000);
  };

  return (
    <div className={cx("CopyInfo_home")}>
      <div className={cx("CopyInfo_id")}>
        <div className={cx("CopyInfo_title")}>Meeting Id: </div>
        <div className={cx("CopyInfo_title")}>
          {chime?.title} {` `}{" "}
          <Tooltip
            tooltip={
              !isMeetingCoppied
                ? intl.formatMessage({ id: "Copyinfo.copyMeetingId" })
                : intl.formatMessage({
                    id: "Copyinfo.coppiedMeetingId",
                  })
            }
          >
            <span
              className={cx("CopyInfo_copy_meeting_id")}
              onClick={copyMeetinId}
            >
              <i className="fas fa-copy"></i>
            </span>
          </Tooltip>
        </div>
      </div>
      <div className={cx("CopyInfo_url")}>
        <div className={cx("CopyInfo_url_btn")} onClick={copyMeetingUrl}>
          {isMeetingUrlCoppied ? "Coppied" : "Copy Meeting Url"}
        </div>
      </div>
    </div>
  );
}
