/* eslint-disable  */

import { VideoTileState } from "amazon-chime-sdk-js";
import classNames from "classnames/bind";
import React, { useContext, useEffect, useRef, useState } from "react";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
import useRoster from "../hooks/useRoster";
import RosterAttendeeType from "../types/RosterAttendeeType";
import LocalRoster from "./LocalRoster";
import styles from "./LocalVideo.css";
import VideoNameplate from "./VideoNameplate";

const cx = classNames.bind(styles);

type Props = {
  view?: string;
};

export default React.memo(function LocalVideo(props: Props) {
  const { view } = props;
  const [enabled, setEnabled] = useState(false);
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { updateGlobalVar } = useContext(getGlobalVarContext());
  const videoElement = useRef(null);
  const attendeeId =
    chime?.meetingSession?.configuration?.credentials?.attendeeId;
  const name = chime?.name || "";

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

  const roster = useRoster();
  const rosterAttendee: RosterAttendeeType = attendeeId ? roster[attendeeId] : {};

  return (
    <>
      <div
        className={cx("LocalVideo_localVideo", {
          disabled: !enabled,
          activeSpeakerViewMode: view === "activeSpeaker"
        })}
      >
        <video muted ref={videoElement} className={cx("LocalVideo_video")} />
        <VideoNameplate
          name={rosterAttendee?.name ? rosterAttendee?.name : name} 
          muted={rosterAttendee?.muted}
        />
      </div>
      {!enabled && (
        <LocalRoster
          name={rosterAttendee?.name ? rosterAttendee?.name : name} 
          muted={rosterAttendee?.muted}
          host={rosterAttendee?.host}
          view={view}
        />
      )}
    </>
  );
});
