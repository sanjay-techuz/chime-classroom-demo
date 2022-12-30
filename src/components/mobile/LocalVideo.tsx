// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import { VideoTileState } from "amazon-chime-sdk-js";
import classNames from "classnames/bind";
import React, { useContext, useEffect, useRef, useState } from "react";

import ChimeSdkWrapper from "../../chime/ChimeSdkWrapper";
import getChimeContext from "../../context/getChimeContext";
import getGlobalVarContext from "../../context/getGlobalVarContext";
import LocalRoster from "./LocalRoster";
import styles from "./LocalVideo.css";
import VideoNameplate from "./VideoNameplate";

const cx = classNames.bind(styles);

type Props = {
  view?: string;
};

export default function LocalVideo(props: Props) {
  const { view } = props;
  const [enabled, setEnabled] = useState(false);
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { updateGlobalVar } = useContext(getGlobalVarContext());
  const videoElement = useRef(null);
  const attendeeId =
    chime?.meetingSession?.configuration?.credentials?.attendeeId;
  const name = chime?.name;

  useEffect(() => {
    chime?.audioVideo?.addObserver({
      videoTileDidUpdate: (tileState: VideoTileState): void => {
        if (
          !tileState.boundAttendeeId ||
          !tileState.localTile ||
          !tileState.tileId ||
          !videoElement.current
        ) {
          return;
        }
        chime?.audioVideo?.bindVideoElement(
          tileState.tileId,
          videoElement.current as unknown as HTMLVideoElement
        );
        setEnabled(tileState.active);
        updateGlobalVar("localVideo",tileState.active);
      },
    });
  }, []);

  return (
    <>
      <div
        className={cx("Mobile_LocalVideo_localVideo", {
          Mobile_disabled: !enabled,
          Mobile_activeSpeakerViewMode: view === "activeSpeaker"
        })}
      >
        <video muted ref={videoElement} className={cx("Mobile_LocalVideo_video")} />
        <VideoNameplate
          attendeeId={attendeeId as string}
        />
      </div>
      {!enabled && (
        <LocalRoster
          attendeeId={attendeeId as string}
          name={name as string}
          view={view}
        />
      )}
    </>
  );
}
