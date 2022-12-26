// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import {
  VideoTileState,
  DefaultActiveSpeakerPolicy,
} from "amazon-chime-sdk-js";
import React, { useCallback, useContext, useEffect, useState } from "react";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
import useRaisedHandAttendees from "../hooks/useRaisedHandAttendees";
import RemoteVideo from "./RemoteVideo";
import useRoster from "../hooks/useRoster";
import RosterAttendeeType from "../types/RosterAttendeeType";
import RosterLayout from "./RosterLayout";
import LocalVideo from "./LocalVideo";
import { Box, Button, IconButton } from "@mui/material";
import Icons from "../custom/Icons";
import { countDownTimer } from "../utils/countDownTimer";
import localStorageKeys from '../constants/localStorageKeys.json';

const MAX_REMOTE_VIDEOS = 16;
let tm: any = 0;
let contentShareEnabled = false;

type Props = {
  isContentShareEnabled: boolean;
  isScreenShareView: boolean;
  rightDrawerOpen: boolean;
};
export default function RosterSliderView(props: Props) {
  const { isContentShareEnabled, rightDrawerOpen } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { globalVar,updateGlobalVar } = useContext(getGlobalVarContext());
  const { activeSpeakerAttendeeId } = globalVar;
  const [visibleIndices, setVisibleIndices] = useState<{
    [index: string]: { boundAttendeeId: string };
  }>({});
  const raisedHandAttendees = useRaisedHandAttendees();
  const roster = useRoster();
  const videoElements: HTMLVideoElement[] = [];
  const tiles: { [index: number]: number } = {};
  const currentUser = chime?.configuration?.credentials?.attendeeId;
  const [videoAttendees, setVideoAttendees] = useState(new Set());
  const [attendeeIdFullScreen, setAttendeeIdFullScreen] = useState("");

  const [scrollLength, setScrollLength] = useState(0);
  const [maxScrollLength, setMaxScrollLength] = useState(0);

  useEffect(() => {
    if(isContentShareEnabled){
      setAttendeeIdFullScreen("");
    }else{
      setAttendeeIdFullScreen(currentUser as string);
    }
    contentShareEnabled = isContentShareEnabled;
  }, [isContentShareEnabled]);

  useEffect(() => {
    const mt = document.getElementById("meeting_timer");
    const meetingStartMeeting = localStorage.getItem(localStorageKeys.MEETING_START_TIME);
    
    if(mt){
      if(!meetingStartMeeting){
        mt!.innerHTML = "00 min";
        return
      }
      setInterval(function() {
        mt.innerHTML = countDownTimer(JSON.parse(meetingStartMeeting) + (58 * 60 * 1000));
      },1000)
    }
  },[]);

  useEffect(() => {
    let attdLength = Object.keys(roster).length - 1;
    if (attendeeIdFullScreen || contentShareEnabled) {
      attdLength = attdLength - 1;
    }
    const maxCols = 4;
    let cols = 1;
    for (cols; cols <= maxCols; cols++) {
      if (attdLength <= cols * cols) {
        break;
      }
    }
    let row = Math.ceil(attdLength / cols);
    if (attendeeIdFullScreen) {
      row = Math.ceil((attdLength - 1) / cols);
    }
    setMaxScrollLength(row * 796);
  }, [roster, attendeeIdFullScreen]);

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

  const activeSpeakerCallback = (attendeeIds: Array<string>) => {
    //remove selfAttendeeId when Speaker active   --sanjay balai
    if (attendeeIds.length) {
      const activeAttendee = attendeeIds;
      if (activeAttendee.length) {
        // checks whether attendee is UnMute then only set as Active Speaker --sanjay balai
        if (chime?.roster[activeAttendee[0]]?.muted == false) {
          if (tm === 0) {
            tm = setTimeout(() => {
              if (attendeeIdFullScreen === activeAttendee[0]) {
                clearTimeout(tm);
              } else {
                updateGlobalVar("activeSpeakerAttendeeId", activeAttendee[0]);
                if (!contentShareEnabled) {
                  setAttendeeIdFullScreen(activeAttendee[0]);
                  tm = 0;
                }
              }
            }, 2250);
          }
        }
      }
    }
  };

  useEffect(() => {
    updateGlobalVar("activeSpeakerAttendeeId", currentUser);
    setAttendeeIdFullScreen(currentUser as string);
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
  const selfAttendeeId = currentUser;
  function removeSelfAttendeeId(arr: any[], value: string | null | undefined) {
    return arr.filter(function (id: any) {
      return id != value;
    });
  }
  const attendeeIds = removeSelfAttendeeId(activeAttendee, selfAttendeeId);
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {attendeeIds.length === 0 && <Box sx={{ 
        height: "100%",
        width: "100%"
        }}>
      <LocalVideo
          view={"grid"}
        />
      </Box>}

        <Box
          sx={{
            height: "105px",
            width: "100%",
            display: attendeeIds.length === 0 ? "none" : "flex",
            justifyContent: "center",
          }}
        >
          <Button
            sx={{
              color: "var(--pure_white_color)",
            }}
            disabled={scrollLength >= 796 ? false : true}
            onClick={() => {
              let sl = scrollLength;
              if (scrollLength > 0) {
                sl = sl - 796;
                if (sl <= 0) {
                  sl = 0;
                }
                setScrollLength(sl);
              }
              let element = document.getElementById("tileView");
              if (element) {
                element.style.overflow = "scroll";
                element.scrollLeft = sl;
                element.style.overflow = "hidden";
              }
            }}
          >
            <IconButton sx={{
              color: "var(--pure_white_color)",
              backgroundColor: "var(--secondary_blue_color)",
              width: 40,
              height: 40,
              display: scrollLength >= 796 ? "flex" : "none"
            }}
            >
            <Icons src={"/icons/left_arrow.svg"} height={12} width={14} />
            </IconButton>
          </Button>
          <div
            id="tileView"
            style={{
              width: "796px",
              height: "105px",
              overflow: "hidden",
            }}
          >
            <div
              id="scrollview"
              style={{
                width: `${maxScrollLength}px`,
                minWidth: "796px",
                height: "100%",
                display: "flex",
                flexDirection: "row",
                //if not scroll proper remove minWidth and justifyContent
                justifyContent: maxScrollLength >= 796 ? "flex-start" : "center"
              }}
            >
              <span className={"ClassRoom_meeting_timer"} >Your meeting will end in <span style={{ color: "red" }} id="meeting_timer"></span></span>
              <div
                style={
                  attendeeIdFullScreen === currentUser
                    ? {
                        width: rightDrawerOpen ? "calc(100% - 301px)" : "100%",
                        height: "calc(100% - 185px)",
                        display: "block",
                        position: "absolute",
                        top: "120px",
                        left: "0px",
                        padding: "0 8px"
                      }
                    : {
                        width: "195px",
                        height: "105px",
                        margin: "0px 2px",
                      }
                }
              >
                {attendeeIds.length !== 0 && <LocalVideo
                  view={
                    attendeeIdFullScreen === currentUser
                      ? "grid"
                      : "activeSpeaker"
                  }
                />}
              </div>
              {Array.from(Array(MAX_REMOTE_VIDEOS).keys()).map((key, index) => {
                const visibleIndex = visibleIndices[index];
                const attendeeId = visibleIndex
                  ? visibleIndex.boundAttendeeId
                  : null;
                const raisedHand = raisedHandAttendees
                  ? raisedHandAttendees.has(attendeeId)
                  : false;
                const activeSpeaker =
                  attendeeIdFullScreen === attendeeId ? true : false;
                return (
                  <div
                    style={
                      activeSpeaker
                        ? {
                          width: rightDrawerOpen ? "calc(100% - 301px)" : "100%",
                          height: "calc(100% - 185px)",
                            display: "block",
                            position: "absolute",
                            top: "120px",
                            left: "0px",
                            padding: "0 8px"
                          }
                        : {
                            width: "195px",
                            height: "105px",
                            margin: "0px 2px",
                            display: visibleIndex ? "block" : "none",
                          }
                    }
                  >
                    <RemoteVideo
                      key={key}
                      enabled={!!visibleIndex}
                      videoElementRef={useCallback(
                        (element: HTMLVideoElement | null) => {
                          if (element) {
                            videoElements[index] = element;
                          }
                        },
                        []
                      )}
                      attendeeId={attendeeId}
                      raisedHand={raisedHand}
                      activeSpeaker={activeSpeakerAttendeeId === attendeeId}
                      view={ activeSpeaker ? "grid" : "activeSpeaker" }
                    />
                  </div>
                );
              })}
              {attendeeIds.map((key: string) => {
                let rosterAttendee: RosterAttendeeType = {};

                if (roster) {
                  rosterAttendee = roster[key];
                }
                const raisedHand = raisedHandAttendees
                  ? raisedHandAttendees.has(key)
                  : false;
                const activeSpeaker =
                  attendeeIdFullScreen === key ? true : false;

                if (!videoAttendees.has(key)) {
                  return (
                    <div
                      style={
                        activeSpeaker
                          ? {
                            width: rightDrawerOpen ? "calc(100% - 301px)" : "100%",
                            height: "calc(100% - 185px)",
                            display: "block",
                            position: "absolute",
                            top: "120px",
                            left: "0px",
                            padding: "0 8px"
                            }
                          : {
                              width: "195px",
                              height: "105px",
                              margin: "0px 2px",
                            }
                      }
                      key={key}
                    >
                      <RosterLayout
                        key={key}
                        attendeeId={key}
                        raisedHand={raisedHand}
                        activeSpeaker={activeSpeakerAttendeeId === key}
                        name={rosterAttendee?.name || ""}
                        view={ activeSpeaker ? "grid" : "activeSpeaker" }
                      />
                    </div>
                  );
                } else {
                  return null;
                }
              })}
            </div>
          </div>
          <Button
            sx={{
              color: "var(--pure_white_color)",
            }}
            disabled={
              scrollLength >= maxScrollLength - 796 ||
              (scrollLength >= 0 && maxScrollLength <= 796)
                ? true
                : false
            }
            onClick={() => {
              let sl = scrollLength;
              if (scrollLength >= 0) {
                sl += 796;
                if (sl >= maxScrollLength) {
                  sl = maxScrollLength;
                }
                setScrollLength(sl);
              }
              let element = document.getElementById("tileView");
              if (element) {
                element.style.overflow = "scroll";
                element.scrollLeft = sl;
                element.style.overflow = "hidden";
              }
            }}
          >
            <IconButton sx={{
              color: "var(--pure_white_color)",
              backgroundColor: "var(--secondary_blue_color)",
              width: 40,
              height: 40,
              display: (scrollLength >= maxScrollLength - 796 ||
              (scrollLength >= 0 && maxScrollLength <= 796)) ? "none" : "flex"
            }}
            >
            <Icons src={"/icons/right_arrow.svg"} height={12} width={14} />
            </IconButton>
          </Button>
        </Box>
    </Box>
  );
}
