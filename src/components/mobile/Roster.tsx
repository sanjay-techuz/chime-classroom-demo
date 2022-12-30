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
  Menu,
  MenuItem,
} from "@mui/material";

import ChimeSdkWrapper from "../../chime/ChimeSdkWrapper";
import getChimeContext from "../../context/getChimeContext";
import getGlobalVarContext from "../../context/getGlobalVarContext";
import useRoster from "../../hooks/useRoster";
import RosterAttendeeType from "../../types/RosterAttendeeType";
import styles from "./Roster.css";
import MessageTopic from "../../enums/MessageTopic";
import ClassMode from "../../enums/ClassMode";
import { nameInitials } from "../../utils";
import Icons from "../../custom/icons";

const cx = classNames.bind(styles);

type Props = {
  closeParticipantsPanel: () => void;
  openChatPanel: () => void
};

export default function Roster(props: Props) {
  const { closeParticipantsPanel, openChatPanel } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { globalVar, updateGlobalVar } = useContext(getGlobalVarContext());
  const { classMode, turnOnFocus } = globalVar;
  const roster = useRoster();
  const [videoAttendees, setVideoAttendees] = useState(new Set());
  const [ selectedAttdId, setSelectedAttdId ] = useState("");
  const intl = useIntl();
  const localUserId =
    chime?.meetingSession?.configuration?.credentials?.attendeeId;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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

  const handleChat = (attendeeId: string) => {
    updateGlobalVar("activeChatAttendeeId", attendeeId);
    openChatPanel()
  }

  return (
    <>
      <Box className={cx("Mobile_Mui_roster_parent_container")}>
        <Box>
          <ListItem>
            <ListItemText>
              <span className={cx("Mobile_Roster_participants")}>
                {intl.formatMessage({ id: "Roster.users" })}
                {` (${attendeeIds.length})`}
              </span>
            </ListItemText>
            <ListItemIcon
              className={cx("Mobile_Mui_roster_user_list_item_icon")}
              onClick={closeParticipantsPanel}
            >
              <Icons src={"/icons/close.svg"} />
            </ListItemIcon>
          </ListItem>
        </Box>
        <Divider className={cx("Mobile_Mui_roster_header_divider")} />
        <Box className={cx("Mobile_Roster_scrollbar")}>
          {attendeeIds &&
            attendeeIds.map((attendeeId: string) => {
              const rosterAttendee: RosterAttendeeType = roster[attendeeId];
              const initials = nameInitials(rosterAttendee?.name);
              return (
                <ListItem key={attendeeId} component="div">
                  <ListItemAvatar
                    className={cx("Mobile_Mui_roster_attendee_list_item_avatar")}
                  >
                    <Avatar
                      className={cx("Mobile_Mui_roster_attendee__avatar")}
                      variant="circular"
                    >
                      {initials}
                    </Avatar>
                    {rosterAttendee?.screenPresenter && 
                    <div className={cx("Mobile_Mui_roster_attendee_screen_presenter_icon")}>
                      <Icons src={"/icons/screen_presenter.svg"} />
                    </div> }
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <span className={cx("Mobile_Mui_roster_attendee_avatar_span")}>
                        <Tooltip title={rosterAttendee.name} placement="bottom">
                          <Typography
                            className={cx(
                              "Mobile_Mui_roster_attendee_avatar_typography"
                            )}
                          >
                            {rosterAttendee.name}
                          </Typography>
                        </Tooltip>
                        <Typography
                          className={cx("Mobile_Mui_roster_attendee_host_typography")}
                        >
                          {attendeeId === localUserId
                            ? ` Me${
                              rosterAttendee?.host
                                  ? ", Host"
                                  : ""
                              }`
                            : `${
                              rosterAttendee?.host
                                  ? "Host"
                                  : ""
                              }`}
                        </Typography>
                      </span>
                    }
                    className={cx("Mobile_Mui_roster_attendee_list_item")}
                  />
                  <ListItemIcon
                    className={cx("Mobile_Mui_roster_attendee_list_item_icons")}
                  >
                    {rosterAttendee?.raised && (
                      <div className={cx("Mobile_Roster_raisedHand")}>
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
                          <Icons src={"/icons/hand_yellow.svg"} />
                        </span>
                      </div>
                    )}
                  </ListItemIcon>
                  <ListItemIcon
                    className={cx("Mobile_Mui_roster_attendee_list_item_icons")}
                  >
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
                            className={cx("Mobile_Roster_muted")}
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
                              <Icons src={"/icons/microphone_off_red.svg"} />
                            ) : (
                              <Icons src={"/icons/microphone_on_white.svg"} />
                            )}
                          </div>
                        </Tooltip>
                      ) : (
                        <div className={cx("Mobile_Roster_muted")}>
                          {rosterAttendee.muted ? (
                            <Icons src={"/icons/microphone_off_red.svg"} />
                          ) : (
                            <Icons src={"/icons/microphone_on_white.svg"} />
                          )}
                        </div>
                      ))}
                  </ListItemIcon>

                  <ListItemIcon
                    className={cx("Mobile_Mui_roster_attendee_list_item_icons")}
                  >
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
                          className={cx("Mobile_Roster_video")}
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
                            <Icons src={"/icons/camera_on_white.svg"} />
                          ) : (
                            <Icons src={"/icons/camera_off_red.svg"} />
                          )}
                        </div>
                      </Tooltip>
                    ) : (
                      <div className={cx("Mobile_Roster_muted")}>
                        {videoAttendees.has(attendeeId) ? (
                          <Icons src={"/icons/camera_on_white.svg"} />
                        ) : (
                          <Icons src={"/icons/camera_off_red.svg"} />
                        )}
                      </div>
                    )}
                  </ListItemIcon>
                  <ListItemIcon sx={{ minWidth: "30px" }}>
                    {attendeeId !== localUserId && (
                        <>
                        <div className={cx("Mobile_Roster_video")}
                          style={{ cursor: "pointer" }} 
                          onClick={(e) => {
                          handleClick(e);
                          setSelectedAttdId(attendeeId)
                          }}>
                          <Icons src={"/icons/roster_more.svg"} />
                          </div>
                        {attendeeId === selectedAttdId && 
                        <Menu
                          id="fade-menu"
                          MenuListProps={{
                            'aria-labelledby': 'fade-button',
                          }}
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleClose}
                          PaperProps={{
                            elevation: 0,
                            sx: {
                              bgcolor: "var(--third_blue_color)",
                              color: "var(--pure_white_color)",
                              border: "1px solid var(--controls_border_color)",
                              overflow: "visible",
                              "&:before": {
                                content: '""',
                                display: "block",
                                position: "absolute",
                                top: 0,
                                right: "10%",
                                width: 10,
                                height: 10,
                                transform: "translateY(-50%) rotate(45deg)",
                                zIndex: 0,
                                borderTop: "1px solid var(--controls_border_color)",
                                borderLeft: "1px solid var(--controls_border_color)",
                                backgroundColor: "var(--third_blue_color)",
                              },
                            },
                          }}  
                        >
                          <MenuItem sx={{ fontSize: "12px" }} onClick={() => handleChat(attendeeId)}>Chat</MenuItem>
                          {classMode === ClassMode.Teacher && <MenuItem sx={{ fontSize: "12px" }} onClick={() => {
                            const focus = !rosterAttendee.presenter;
                            chime?.sendMessage(
                              MessageTopic.ScreenSharePermit,
                              {
                                focus: focus,
                                targetId: attendeeId,
                              }
                            );
                            chime?.updateScreenPresenter(attendeeId, focus);
                          }}>{rosterAttendee.presenter ? intl.formatMessage({ id: "Roster.removePresenter" }) : intl.formatMessage({ id: "Roster.makePresenter" })}</MenuItem>}
                          </Menu>}
                        </>
                      )}
                  </ListItemIcon>
                </ListItem>
              );
            })}
        </Box>
      </Box>
      {classMode === ClassMode.Teacher && (
        <Box className={cx("Mobile_Mui_roster_second_container")}>
          <Button
            className={cx("Mobile_Mui_roster_mute_all_btn")}
            onClick={() => {
              chime?.sendMessage(MessageTopic.MuteAll, {
                focus: true,
              });
            }}
          >
            {intl.formatMessage({ id: "Roster.muteAll" })}
          </Button>
          <Button
            className={cx("Mobile_Mui_roster_unmute_all_btn")}
            onClick={() => {
              updateGlobalVar("turnOnFocus", !turnOnFocus);
              chime?.sendMessage(MessageTopic.Focus, {
                focus: !turnOnFocus,
              });
            }}
          >
            {turnOnFocus ? intl.formatMessage({ id: "Controls.turnOffFocusTooltip" }) : intl.formatMessage({ id: "Controls.turnOnFocusTooltip" })}
          </Button>
        </Box>
      )}
    </>
  );
}
