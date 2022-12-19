// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React from "react";
import { useIntl } from "react-intl";

import VideoNameplate from "./VideoNameplate";
import styles from "./RemoteVideo.css";

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
    raisedHand,
    activeSpeaker,
    view
  } = props;
  return (
    <div
      className={cx("RemoteVideo_remoteVideo", {
        enabled,
        activeSpeaker,
        activeSpeakerViewMode: view === "activeSpeaker"
      })}
    >
      <video muted ref={videoElementRef} className={cx("RemoteVideo_video")} />
      <VideoNameplate
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
