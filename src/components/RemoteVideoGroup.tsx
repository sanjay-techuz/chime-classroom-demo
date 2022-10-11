// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import {
  VideoTileState,
  DefaultActiveSpeakerPolicy,
} from "amazon-chime-sdk-js";
import classNames from "classnames/bind";
import React, { useCallback, useContext, useEffect, useState } from "react";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
import ViewMode from "../enums/ViewMode";
import Size from "../enums/Size";
import useRaisedHandAttendees from "../hooks/useRaisedHandAttendees";
import RemoteVideo from "./RemoteVideo";
import styles from "./RemoteVideoGroup.css";
import useRoster from "../hooks/useRoster";
import RosterAttendeeType from "../types/RosterAttendeeType";
import RosterLayout from "./RosterLayout";
import LocalVideo from "./LocalVideo";
import { rosterSize } from "../utils/rosterSize";

const cx = classNames.bind(styles);
const MAX_REMOTE_VIDEOS = 16;
let tm: any = 0;

type Props = {
  viewMode: ViewMode;
  isContentShareEnabled: boolean;
  isGridView: boolean;
  isScreenShareView: boolean;
};

export default function RemoteVideoGroup(props: Props) {
  const { viewMode, isContentShareEnabled, isGridView, isScreenShareView } =
    props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { updateGlobalVar } = useContext(getGlobalVarContext());
  const [visibleIndices, setVisibleIndices] = useState<{
    [index: string]: { boundAttendeeId: string };
  }>({});
  const raisedHandAttendees = useRaisedHandAttendees();
  const roster = useRoster();
  const videoElements: HTMLVideoElement[] = [];
  const tiles: { [index: number]: number } = {};
  const currentUser = chime?.configuration.credentials.attendeeId;
  const [videoAttendees, setVideoAttendees] = useState(new Set());
  const [attendeeIdFullScreen, setAttendeeIdFullScreen] = useState("");
  const [gridViewRosterSize, setGridViewRosterView] = useState({
    width: "",
    height: "",
  });

  const acquireVideoIndex = (tileId: number): number => {
    for (let index = 0; index < MAX_REMOTE_VIDEOS; index += 1) {
      if (tiles[index] === tileId) {
        return index;
      }
    }
    for (let index = 0; index < MAX_REMOTE_VIDEOS; index += 1) {
      if (!(index in tiles)) {
        tiles[index] = tileId;
        return index;
      }
    }
    throw new Error("no tiles are available");
  };

  const releaseVideoIndex = (tileId: number): number => {
    for (let index = 0; index < MAX_REMOTE_VIDEOS; index += 1) {
      if (tiles[index] === tileId) {
        delete tiles[index];
        return index;
      }
    }
    return -1;
  };

  const numberOfVisibleIndices = Object.keys(visibleIndices).reduce<number>(
    (result: number, key: string) => result + (visibleIndices[key] ? 1 : 0),
    0
  );

  const activeSpeakerCallback = (attendeeIds) => {
    //remove selfAttendeeId when Speaker active   --sanjay balai
    if (attendeeIds.length) {
      let selfAttendeeId = currentUser;
      function removeSelfAttendeeId(arr, value) {
        return arr.filter(function (id) {
          return id != value;
        });
      }
      let activeAttendee = removeSelfAttendeeId(attendeeIds, selfAttendeeId);

      if (activeAttendee.length) {
        // checks whether attendee is UnMute then only set as Active Speaker --sanjay balai
        if (chime?.roster[activeAttendee[0]]?.muted == false) {
          if (tm === 0) {
            tm = setTimeout(() => {
              if (attendeeIdFullScreen === activeAttendee[0]) {
                clearTimeout(tm);
              } else {
                setAttendeeIdFullScreen(activeAttendee[0]);
                updateGlobalVar("activeSpeakerAttendeeId", activeAttendee[0]);
                tm = 0;
              }
            }, 2250);
          }
        }
      }
    }
  };

  useEffect(() => {
    // active speaker listner called --sanjay balai
    chime?.audioVideo?.subscribeToActiveSpeakerDetector(
      new DefaultActiveSpeakerPolicy(),
      activeSpeakerCallback
    );

    // remove tile id when attendee leave --sanjay balai
    const tileIds: { [tileId: number]: string } = {};
    const realTimeVideoAttendees = new Set();
    const removeTileId = (tileId: number): void => {
      const removedAttendeeId = tileIds[tileId];
      delete tileIds[tileId];
      realTimeVideoAttendees.delete(removedAttendeeId);
      setVideoAttendees(new Set(realTimeVideoAttendees));
    };

    chime?.audioVideo?.addObserver({
      videoTileDidUpdate: (tileState: VideoTileState): void => {
        if (
          !tileState.boundAttendeeId ||
          tileState.localTile ||
          tileState.isContent ||
          !tileState.tileId
        ) {
          return;
        }
        const index = acquireVideoIndex(tileState.tileId);
        chime?.audioVideo?.bindVideoElement(
          tileState.tileId,
          videoElements[index]
        );
        setVisibleIndices((previousVisibleIndices) => ({
          ...previousVisibleIndices,
          [index]: {
            boundAttendeeId: tileState.boundAttendeeId,
          },
        }));
        // code for audio/video enable or not start
        if (tileState.active) {
          tileIds[tileState.tileId] = tileState.boundAttendeeId;
          realTimeVideoAttendees.add(tileState.boundAttendeeId);
          setVideoAttendees(new Set(realTimeVideoAttendees));
        } else {
          removeTileId(tileState.tileId);
        }
      },
      videoTileWasRemoved: (tileId: number): void => {
        const index = releaseVideoIndex(tileId);
        setVisibleIndices((previousVisibleIndices) => ({
          ...previousVisibleIndices,
          [index]: null,
        }));
        removeTileId(tileId);
      },
    });
  }, []);

  const getSize = (): Size => {
    if (numberOfVisibleIndices >= 10) {
      return Size.Small;
    }
    if (numberOfVisibleIndices >= 5) {
      return Size.Medium;
    }
    return Size.Large;
  };

  // get height and width of tileview from class for responsive view --sanjay balai
  function reorganize() {
    const attdLength = Object.keys(roster);
    const window_height = document.getElementById("tileView");
    const elHeight = window_height?.clientHeight - 50;
    const size = rosterSize(elHeight,attdLength.length);
    setGridViewRosterView({ ...size });
  }

  // find the number of attendee join --sanjay balai
  let activeAttendee: any;
  if (chime?.meetingSession && roster) {
    activeAttendee = Object.keys(roster);

    activeAttendee.forEach(function (item: string, i: number) {
      if (item === currentUser) {
        activeAttendee.splice(i, 1);
        activeAttendee.unshift(item);
      }
      if (chime?.roster[item].name == "") {
        activeAttendee.splice(i, 1);
      }
    });
  }

  // remove self attendee for roster layout --sanjay balai
  let selfAttendeeId = currentUser;
  function removeSelfAttendeeId(arr, value) {
    return arr.filter(function (id) {
      return id != value;
    });
  }
  const attendeeIds = removeSelfAttendeeId(activeAttendee, selfAttendeeId);

  useEffect(() => {
    reorganize();
  }, [isGridView]);

  useEffect(() => {
    const callback = () => {
      reorganize();
    };
    chime?.subscribeToRosterUpdate(callback);
    return () => {
      chime?.unsubscribeFromRosterUpdate(callback);
    };
  }, []);

  return (
    <div
      id="tileView"
      className={cx(
        "RemoteVideoGroup_remoteVideoGroup",
        // `RemoteVideoGroup_remoteVideoGroup-${numberOfVisibleIndices}`,
        {
          roomMode: viewMode === ViewMode.Room,
          screenShareMode: viewMode === ViewMode.ScreenShare,
          disabled: isScreenShareView,
        }
      )}
    >
      <div
        className={cx("RemoteVideoGroup_attendeeTileView", {
          // disabled: !isGridView
        })}
      >
        {/* {numberOfVisibleIndices === 0 && (
        <div className={cx('RemoteVideoGroup_instruction')}>
          <FormattedMessage id="RemoteVideoGroup.noVideo" />
        </div>
      )} */}
        <div
          style={{
            width: gridViewRosterSize.width,
            height: gridViewRosterSize.height,
            margin: "0.50%",
          }}
          className={cx("RemoteVideoGroup_attendeeRosterView", {
            notActiveSpeakerView: !isGridView,
          })}
        >
          <LocalVideo
            viewMode={viewMode}
            size={getSize()}
            isContentShareEnabled={isContentShareEnabled}
          />
        </div>
        {Array.from(Array(MAX_REMOTE_VIDEOS).keys()).map((key, index) => {
          const visibleIndex = visibleIndices[index];
          const attendeeId = visibleIndex ? visibleIndex.boundAttendeeId : null;
          const raisedHand = raisedHandAttendees
            ? raisedHandAttendees.has(attendeeId)
            : false;
          const activeSpeaker =
            attendeeIdFullScreen === attendeeId ? true : false;
          return (
            <div
              className={cx({
                activeSpeakerView:
                  !isGridView && attendeeIdFullScreen === attendeeId,
                notActiveSpeakerView:
                  !isGridView && attendeeIdFullScreen !== attendeeId,
                defaultRosterSize: !isGridView,
              })}
              style={
                isGridView
                  ? {
                      width: gridViewRosterSize.width,
                      height: gridViewRosterSize.height,
                      margin: "0.50%",
                      display: visibleIndex ? "block" : "none",
                    }
                  : {}
              }
            >
              <RemoteVideo
                key={key}
                viewMode={viewMode}
                enabled={!!visibleIndex}
                videoElementRef={useCallback(
                  (element: HTMLVideoElement | null) => {
                    if (element) {
                      videoElements[index] = element;
                    }
                  },
                  []
                )}
                size={getSize()}
                attendeeId={attendeeId}
                raisedHand={raisedHand}
                activeSpeaker={activeSpeaker}
                isContentShareEnabled={isContentShareEnabled}
              />
            </div>
          );
        })}
        {attendeeIds.map((key: string, index: number) => {
          let rosterAttendee: RosterAttendeeType = {};

          if (roster) {
            rosterAttendee = roster[key];
          }
          const raisedHand = raisedHandAttendees
            ? raisedHandAttendees.has(key)
            : false;
          const activeSpeaker = attendeeIdFullScreen === key ? true : false;

          if (!videoAttendees.has(key)) {
            return (
              <div
                className={cx("RemoteVideoGroup_attendeeRosterView", {
                  activeSpeakerView:
                    !isGridView && attendeeIdFullScreen === key,
                  notActiveSpeakerView:
                    !isGridView && attendeeIdFullScreen !== key,
                })}
                style={
                  isGridView
                    ? {
                        display: !videoAttendees.has(key) ? "flex" : "none",
                        width: gridViewRosterSize.width,
                        height: gridViewRosterSize.height,
                        margin: "0.50%",
                      }
                    : { width: "100%", height: "100%" }
                }
                key={key}
              >
                <RosterLayout
                  key={key}
                  viewMode={viewMode}
                  size={getSize()}
                  attendeeId={key}
                  raisedHand={raisedHand}
                  activeSpeaker={activeSpeaker}
                  isContentShareEnabled={isContentShareEnabled}
                  name={rosterAttendee.name}
                />
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
}
