// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import { VideoTileState } from "amazon-chime-sdk-js";
import classNames from "classnames/bind";
import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import {
  Avatar,
  Box,
  ListItem,
  ListItemIcon,
  ListItemAvatar,
  Tooltip,
  ListItemText,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import MicNoneIcon from '@mui/icons-material/MicNone';

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
import useRoster from "../hooks/useRoster";
import useRaisedHandAttendees from "../hooks/useRaisedHandAttendees";
import RosterAttendeeType from "../types/RosterAttendeeType";
import styles from "./Roster.css";
import MessageTopic from "../enums/MessageTopic";
import ClassMode from "../enums/ClassMode";
import { nameInitials } from "../utils";
import CloseIcon from '@mui/icons-material/Close';

const cx = classNames.bind(styles);

type Props = {
  closeParticipantsPanel: () => void;
};

export default function Roster(props: Props) {
  const { closeParticipantsPanel } = props
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { globalVar } = useContext(getGlobalVarContext());
  const { classMode } = globalVar;
  const roster = useRoster();
  const [videoAttendees, setVideoAttendees] = useState(new Set());
  const raisedHandAttendees = useRaisedHandAttendees();
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
    <>
      <Box
        sx={{
          width: "100%",
          height: "95%",
          maxWidth: 360,
        }}
      >
        <Box>
          <ListItem>
            <ListItemText>
              {intl.formatMessage({ id: "Roster.users" })}
              {` (${attendeeIds.length})`}
            </ListItemText>
            <ListItemIcon sx={{ justifyContent: "flex-end", color: "var(--pure_white_color)", cursor: "pointer" }} onClick={closeParticipantsPanel}><CloseIcon /></ListItemIcon>
          </ListItem>
        </Box>
        <Divider
          sx={{
            margin: "auto",
            borderColor: "rgb(77 76 76 / 80%)",
            borderBottomWidth: "unset",
            width: "90%",
          }}
        />
        <Box
        className={cx("Roster_scrollbar")}
          sx={{
            width: "100%",
            height: "95%",
            maxWidth: 360,
            overflowY: "scroll",
          }}
        >
          {attendeeIds &&
            attendeeIds.map((attendeeId: string) => {
              const rosterAttendee: RosterAttendeeType = roster[attendeeId];
              const initials = nameInitials(rosterAttendee?.name);
              return (
                <ListItem key={attendeeId} component="div">
                  <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: "var(--color_grey)",
                          color: "var(--pure_white_color)",
                        }}
                        variant="circular"
                      >
                        {initials}
                      </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <span
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <Tooltip title={rosterAttendee.name} placement="bottom">
                          <Typography
                            sx={{
                              width: "100px",
                              display: "inline-block",
                              whiteSpace: "nowrap",
                              overflow: "hidden !important",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {rosterAttendee.name}
                          </Typography>
                        </Tooltip>
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            width: "100px",
                            display: "inline-block",
                            whiteSpace: "nowrap",
                            overflow: "hidden !important",
                            textOverflow: "ellipsis",
                            color: "var(--color_grey)",
                          }}
                        >
                          {attendeeId === localUserId
                            ? ` Me${
                                attendeeId === localStorage.getItem("hostId")
                                  ? ", Presenter"
                                  : ""
                              }`
                            : `${
                                attendeeId === localStorage.getItem("hostId")
                                  ? ", Presenter"
                                  : ""
                              }`}
                        </Typography>
                      </span>
                    }
                    sx={{ textTransform: "capitalize" }}
                  />
                  <ListItemIcon sx={{ minWidth: "45px" }}>
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
                  <ListItemIcon sx={{ minWidth: "45px" }}>
                    {typeof rosterAttendee.muted === "boolean" &&
                      (classMode === ClassMode.Teacher &&
                      attendeeId !== localUserId ? (
                        <Tooltip
                          title={
                            rosterAttendee.muted
                              ? intl.formatMessage({
                                  id: "Controls.unmuteTooltip",
                                })
                              : intl.formatMessage({
                                  id: "Controls.muteTooltip",
                                })
                          }
                          placement="bottom"
                        >
                          <div
                            className={cx("Roster_muted")}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              const mute = rosterAttendee.muted;
                              chime?.sendMessage(
                                MessageTopic.RemoteMuteUnmute,
                                {
                                  focus: !mute,
                                  targetId: attendeeId,
                                }
                              );
                            }}
                          >
                            {rosterAttendee.muted ? (
                              <Avatar
                                sx={{
                                  width: 30,
                                  height: 30,
                                  bgcolor: "var(--pure_white_color)",
                                  color: "var(--color_black)",
                                }}
                              >
                                <MicOffOutlinedIcon />
                              </Avatar>
                            ) : (
                              <Avatar
                                sx={{
                                  width: 30,
                                  height: 30,
                                  bgcolor: "var(--color_grey)",
                                }}
                              >
                                <MicNoneIcon />
                              </Avatar>
                            )}
                          </div>
                        </Tooltip>
                      ) : (
                        <div className={cx("Roster_muted")}>
                          {rosterAttendee.muted ? (
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                bgcolor: "var(--pure_white_color)",
                                color: "var(--color_black)",
                              }}
                            >
                              <MicOffOutlinedIcon />
                            </Avatar>
                          ) : (
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                bgcolor: "var(--color_grey)",
                              }}
                            >
                              <MicNoneIcon />
                            </Avatar>
                          )}
                        </div>
                      ))}
                  </ListItemIcon>

                  <ListItemIcon sx={{ minWidth: "45px" }}>
                    {classMode === ClassMode.Teacher &&
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
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                bgcolor: "var(--color_grey)",
                              }}
                            >
                              <VideocamOutlinedIcon />
                            </Avatar>
                          ) : (
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                bgcolor: "var(--pure_white_color)",
                                color: "var(--color_black)",
                              }}
                            >
                              <VideocamOffOutlinedIcon />
                            </Avatar>
                          )}
                        </div>
                      </Tooltip>
                    ) : (
                      <div className={cx("Roster_muted")}>
                        {videoAttendees.has(attendeeId) ? (
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              bgcolor: "var(--color_grey)",
                              }}
                          >
                            <VideocamOutlinedIcon />
                          </Avatar>
                        ) : (
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              bgcolor: "var(--pure_white_color)",
                              color: "var(--color_black)",
                            }}
                          >
                            <VideocamOffOutlinedIcon />
                          </Avatar>
                        )}
                      </div>
                    )}
                  </ListItemIcon>
                </ListItem>
              );
            })}
        </Box>
      </Box>
      {classMode === ClassMode.Teacher && (
        <Box
          sx={{
            width: "100%",
            bgcolor: "var(--secondary_blue_color)",
            position: "absolute",
            bottom: 8,
            display: "flex",
            justifyContent: "space-evenly",
            zIndex: 10,
          }}
        >
          <Button
            sx={{
              width: "120px",
              backgroundColor: "var(--secondary_blue_color)",
              color: "var(--pure_white_color)",
              border: "1px solid var(--pure_white_color)",
              borderRadius: 16,
            }}
            onClick={() => {
              chime?.sendMessage(MessageTopic.Focus, {
                focus: true,
              });
            }}
          >
            {intl.formatMessage({ id: "Roster.muteAll" })}
          </Button>
          <Button
            sx={{
              width: "120px",
              backgroundColor: "var(--secondary_blue_color)",
              color: "var(--pure_white_color)",
              border: "1px solid var(--pure_white_color)",
              borderRadius: 16,
            }}
            onClick={() => {
              chime?.sendMessage(MessageTopic.Focus, {
                focus: false,
              });
            }}
          >
            {intl.formatMessage({ id: "Roster.unMuteAll" })}
          </Button>
        </Box>
      )}
    </>
  );
}
