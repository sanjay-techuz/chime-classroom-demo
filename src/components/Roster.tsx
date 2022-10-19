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
  Typography,
} from "@mui/material";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
// import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";

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
import { nameInitials } from "../utils";

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

  let attendeeIds: Array<string> = [];
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
      <Box sx={{ paddingTop: "25px", color: "var(--color_grey)" }}>
        <ListItem>
          <ListItemText>
            {intl.formatMessage({ id: "Roster.users" })}
            {` (${attendeeIds.length})`}
          </ListItemText>
        </ListItem>
      </Box>
      {attendeeIds &&
        attendeeIds.map((attendeeId: string) => {
          const rosterAttendee: RosterAttendeeType = roster[attendeeId];
          const initials = nameInitials(rosterAttendee?.name);
          return (
            <ListItem key={attendeeId} component="div">
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <SmallAvatar
                      bgcolor={
                        rosterAttendee?.muted
                          ? "var(--color_pink)"
                          : "var(--secondary_blue_color)"
                      }
                    >
                      {rosterAttendee?.muted ? (
                        <MicOffOutlinedIcon sx={{ fontSize: "14px" }} />
                      ) : (
                        <MicNoneOutlinedIcon sx={{ fontSize: "14px" }} />
                      )}
                    </SmallAvatar>
                  }
                >
                  <Avatar
                    sx={{ bgcolor: "var(--color_green)" }}
                    variant="rounded"
                  >
                    {initials}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    <Typography sx={{ width: "100px" }}>
                      {rosterAttendee.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", width: "100px" }}>
                      {attendeeId === localUserId
                        ? ` (You${
                            attendeeId === localStorage.getItem("hostId")
                              ? ", Presenter)"
                              : ")"
                          }`
                        : `${
                            attendeeId === localStorage.getItem("hostId")
                              ? ", Presenter)"
                              : ""
                          }`}
                    </Typography>
                  </>
                }
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
              {/* <ListItemIcon sx={{ minWidth: "30px" }}>
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
              </ListItemIcon> */}
            </ListItem>
          );
        })}
    </Box>
  );
}
