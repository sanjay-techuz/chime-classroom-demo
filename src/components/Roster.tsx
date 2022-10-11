// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import { VideoTileState } from "amazon-chime-sdk-js";
import classNames from "classnames/bind";
import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import {
  Avatar,
  Badge,
  Box,
  ListItem,
  ListItemIcon,
  ListItemAvatar,
  Tooltip,
  ListItemText,
} from "@mui/material";
import { green, grey, indigo, pink } from "@mui/material/colors";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getUIStateContext from "../context/getUIStateContext";
import useRoster from "../hooks/useRoster";
import useRaisedHandAttendees from "../hooks/useRaisedHandAttendees";
import RosterAttendeeType from "../types/RosterAttendeeType";
import styles from "./Roster.css";
import MessageTopic from "../enums/MessageTopic";
import ClassMode from "../enums/ClassMode";
import SmallAvatar from "../custom/roster/SmallAvatar";

const cx = classNames.bind(styles);

export default function Roster() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const roster = useRoster();
  const [videoAttendees, setVideoAttendees] = useState(new Set());
  const raisedHandAttendees = useRaisedHandAttendees();
  const [state] = useContext(getUIStateContext());
  const intl = useIntl();
  const localUserId =
    chime?.meetingSession?.configuration?.credentials?.attendeeId;

  useEffect(() => {
    const tileIds: { [tileId: number]: string } = {};
    // <tileId, attendeeId>
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
          tileState.isContent ||
          !tileState.tileId
        ) {
          return;
        }

        if (tileState.active) {
          tileIds[tileState.tileId] = tileState.boundAttendeeId;
          realTimeVideoAttendees.add(tileState.boundAttendeeId);
          setVideoAttendees(new Set(realTimeVideoAttendees));
        } else {
          removeTileId(tileState.tileId);
        }
      },
      videoTileWasRemoved: (tileId: number): void => {
        removeTileId(tileId);
      },
    });
  }, []);

  let attendeeIds;
  if (chime?.meetingSession && roster) {
    attendeeIds = Object.keys(roster).filter((attendeeId) => {
      return !!roster[attendeeId].name;
    });
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: 400,
        maxWidth: 360,
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ paddingTop: "25px", color: grey[600] }}>
        <ListItem>
          <ListItemText>Users{` (${attendeeIds.length})`}</ListItemText>
          <ListItemIcon sx={{ minWidth: "30px" }}>
            <SettingsOutlinedIcon />
          </ListItemIcon>
        </ListItem>
      </Box>
      {attendeeIds &&
        attendeeIds.map((attendeeId: string) => {
          const rosterAttendee: RosterAttendeeType = roster[attendeeId];
          const initials = rosterAttendee?.name
            ?.replace(/[^a-zA-Z- ]/g, "")
            .match(/\b\w/g)
            ?.join("");
          const attendeeName =
            `${rosterAttendee.name}` +
            (attendeeId === localUserId
              ? ` (You${
                  attendeeId === localStorage.getItem("hostId")
                    ? ", Presenter)"
                    : ")"
                }`
              : `${
                  attendeeId === localStorage.getItem("hostId")
                    ? ", Presenter)"
                    : ""
                }`);
          return (
            <ListItem key={attendeeId} component="div">
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <SmallAvatar
                      bgcolor={rosterAttendee?.muted ? pink[500] : indigo[900]}
                    >
                      {rosterAttendee?.muted ? (
                        <MicOffOutlinedIcon sx={{ fontSize: "14px" }} />
                      ) : (
                        <MicNoneOutlinedIcon sx={{ fontSize: "14px" }} />
                      )}
                    </SmallAvatar>
                  }
                >
                  <Avatar sx={{ bgcolor: green[500] }} variant="rounded">
                    {initials}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={`${attendeeName}`}
                sx={{ textTransform: "capitalize" }}
              />
              <ListItemIcon sx={{ minWidth: "30px" }}>
                {raisedHandAttendees.has(attendeeId) && (
                  <div className={cx("Roster_raisedHand")}>
                    <span
                      role="img"
                      aria-label={intl.formatMessage(
                        {
                          id: "Roster.raiseHandAriaLabel",
                        },
                        {
                          name: rosterAttendee.name,
                        }
                      )}
                    >
                      ✋
                    </span>
                  </div>
                )}
              </ListItemIcon>
              <ListItemIcon sx={{ minWidth: "30px" }}>
                {typeof rosterAttendee.muted === "boolean" &&
                  (state.classMode === ClassMode.Teacher &&
                  attendeeId !== localUserId ? (
                    <Tooltip
                      title={
                        rosterAttendee.muted
                          ? intl.formatMessage({ id: "Controls.unmuteTooltip" })
                          : intl.formatMessage({ id: "Controls.muteTooltip" })
                      }
                      placement="bottom"
                    >
                      <div
                        className={cx("Roster_muted")}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          const mute = rosterAttendee.muted;
                          chime?.sendMessage(MessageTopic.RemoteMuteUnmute, {
                            focus: !mute,
                            targetId: attendeeId,
                          });
                        }}
                      >
                        {rosterAttendee.muted ? <MicOffIcon /> : <MicIcon />}
                      </div>
                    </Tooltip>
                  ) : (
                    <div className={cx("Roster_muted")}>
                      {rosterAttendee.muted ? <MicOffIcon /> : <MicIcon />}
                    </div>
                  ))}
              </ListItemIcon>

              <ListItemIcon sx={{ minWidth: "30px" }}>
                {state.classMode === ClassMode.Teacher &&
                attendeeId !== localUserId ? (
                  <Tooltip
                    title={
                      videoAttendees.has(attendeeId)
                        ? intl.formatMessage({
                            id: "Controls.turnOffVideoTooltip",
                          })
                        : intl.formatMessage({
                            id: "Controls.turnOnVideoTooltip",
                          })
                    }
                    placement="bottom"
                  >
                    <div
                      className={cx("Roster_video")}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        const focus = videoAttendees.has(attendeeId);
                        chime?.sendMessage(MessageTopic.RemoteVideoOnOff, {
                          focus: !focus,
                          targetId: attendeeId,
                        });
                      }}
                    >
                      {videoAttendees.has(attendeeId) ? (
                        <VideocamIcon />
                      ) : (
                        <VideocamOffIcon />
                      )}
                    </div>
                  </Tooltip>
                ) : (
                  <div className={cx("Roster_muted")}>
                    {videoAttendees.has(attendeeId) ? (
                      <VideocamIcon />
                    ) : (
                      <VideocamOffIcon />
                    )}
                  </div>
                )}
              </ListItemIcon>
              <ListItemIcon sx={{ minWidth: "30px" }}>
                {state.classMode === ClassMode.Teacher &&
                  attendeeId !== localUserId && (
                    <Tooltip
                      title={intl.formatMessage({
                        id: "Controls.removeAttendee",
                      })}
                      placement="bottom"
                    >
                      <div
                        className={cx("Roster_muted")}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          if (
                            confirm(
                              intl.formatMessage(
                                { id: "Roster.sureRemove" },
                                { name: rosterAttendee.name }
                              )
                            )
                          ) {
                            chime?.sendMessage(MessageTopic.RemoveAttendee, {
                              focus: true,
                              targetId: attendeeId,
                            });
                          }
                        }}
                      >
                        <PersonRemoveAlt1Icon />
                      </div>
                    </Tooltip>
                  )}
              </ListItemIcon>
            </ListItem>
          );
        })}
    </Box>

    // <div className={cx('Roster_roster')}>
    //   {attendeeIds &&
    //     attendeeIds.map((attendeeId: string) => {
    //       const rosterAttendee: RosterAttendeeType = roster[attendeeId];
    //       return (
    //         <div key={attendeeId} className={cx('Roster_attendee')}>
    //           <div className={cx('Roster_name')}>{rosterAttendee.name}</div>
    //           {raisedHandAttendees.has(attendeeId) && (
    //             <div className={cx('Roster_raisedHand')}>
    //               <span
    //                 role="img"
    //                 aria-label={intl.formatMessage(
    //                   {
    //                     id: 'Roster.raiseHandAriaLabel'
    //                   },
    //                   {
    //                     name: rosterAttendee.name
    //                   }
    //                 )}
    //               >
    //                 ✋
    //               </span>
    //             </div>
    //           )}
    //           {(
    //             (state.classMode === ClassMode.Teacher && attendeeId !== localUserId) ?
    //             <Tooltip
    //             tooltip={
    //               videoAttendees.has(attendeeId)
    //                 ? intl.formatMessage({ id: 'Controls.turnOffVideoTooltip' })
    //                 : intl.formatMessage({ id: 'Controls.turnOnVideoTooltip' })
    //             }
    //           >
    //             <div className={cx('Roster_video')} style={{cursor:'pointer'}} onClick={() => {
    //               const focus = videoAttendees.has(attendeeId);
    //               chime?.sendMessage(MessageTopic.RemoteVideoOnOff, { focus: !focus, targetId: attendeeId });
    //             }}>
    //               {videoAttendees.has(attendeeId) ? (
    //                 <i className={cx('fas fa-video')} />
    //               ) : (
    //                 <i className={cx('fas fa-video-slash')} />
    //               )}
    //             </div>
    //           </Tooltip>
    //           :
    //           <div className={cx('Roster_muted')}>
    //             {videoAttendees.has(attendeeId) ? (
    //                 <i className={cx('fas fa-video')} />
    //               ) : (
    //                 <i className={cx('fas fa-video-slash')} />
    //               )}
    //           </div>
    //           )}

    //           {typeof rosterAttendee.muted === 'boolean' && (
    //             (state.classMode === ClassMode.Teacher && attendeeId !== localUserId) ?
    //             <Tooltip
    //             tooltip={
    //               rosterAttendee.muted
    //                 ? intl.formatMessage({ id: 'Controls.unmuteTooltip' })
    //                 : intl.formatMessage({ id: 'Controls.muteTooltip' })
    //             }
    //           >
    //             <div className={cx('Roster_muted')} style={{cursor:'pointer'}} onClick={() => {
    //               const mute = rosterAttendee.muted;
    //               chime?.sendMessage(MessageTopic.RemoteMuteUnmute, { focus: !mute, targetId: attendeeId });
    //             }}>
    //               {rosterAttendee.muted ? (
    //                 <i className="fas fa-microphone-slash" />
    //               ) : (
    //                 <i
    //                   className={cx(
    //                     'fas fa-microphone',
    //                     { 'active-speaker': rosterAttendee.active },
    //                     {
    //                       'weak-signal':
    //                         rosterAttendee.signalStrength &&
    //                         rosterAttendee.signalStrength < 50
    //                     }
    //                   )}
    //                 />
    //               )}
    //             </div>
    //           </Tooltip>
    //           :
    //           <div className={cx('Roster_muted')}>
    //             {rosterAttendee.muted ? (
    //               <i className="fas fa-microphone-slash" />
    //             ) : (
    //               <i
    //                 className={cx(
    //                   'fas fa-microphone',
    //                   { 'active-speaker': rosterAttendee.active },
    //                   {
    //                     'weak-signal':
    //                       rosterAttendee.signalStrength &&
    //                       rosterAttendee.signalStrength < 50
    //                   }
    //                 )}
    //               />
    //             )}
    //           </div>
    //           )}
    //           {state.classMode === ClassMode.Teacher && attendeeId !== localUserId && (
    //             <Tooltip
    //             tooltip={intl.formatMessage({ id: 'Controls.removeAttendee' })}
    //           >
    //             <div className={cx('Roster_muted')} style={{cursor:'pointer'}} onClick={() => {
    //               if (confirm(intl.formatMessage({ id: 'Roster.sureRemove'},{ name : rosterAttendee.name}))) {
    //                 chime?.sendMessage(MessageTopic.RemoveAttendee, { focus: true, targetId: attendeeId });
    //               }
    //             }}>
    //               <i className="fas fa-user-minus" />
    //             </div>
    //           </Tooltip>)}
    //         </div>
    //       );
    //     })}
    // </div>
  );
}
