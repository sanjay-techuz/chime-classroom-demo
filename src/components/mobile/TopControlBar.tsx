// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import classNames from "classnames/bind";

import {
  Avatar,
  Box,
  MenuItem,
  Popover,
  Tooltip,
} from "@mui/material";
import ChimeSdkWrapper from "../../chime/ChimeSdkWrapper";
import routes from "../../constants/routes.json";
import getChimeContext from "../../context/getChimeContext";
import getGlobalVarContext from "../../context/getGlobalVarContext";
import ClassMode from "../../enums/ClassMode";
import { attendanceWenhook } from "../../services";
import styles from "./Controls.css";
import MessageTopic from "../../enums/MessageTopic";
import Icons from "../../custom/icons";

const cx = classNames.bind(styles);
let timeoutId: number;

export default function topControlBar() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { globalVar } = useContext(getGlobalVarContext());
  const {
    userInfo,
    classMode,
  } = globalVar;
  const history = useHistory();
  const [raised, setRaised] = useState(false);
  const intl = useIntl();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const attendeeId = chime?.configuration?.credentials?.attendeeId;
    if (!attendeeId) {
      return;
    }

    chime?.sendMessage(
      raised ? MessageTopic.RaiseHand : MessageTopic.DismissHand,
      attendeeId
    );

    if (raised) {
      timeoutId = window.setTimeout(() => {
        chime?.sendMessage(MessageTopic.DismissHand, attendeeId);
        setRaised(false);
      }, 10000);
    } else {
      clearTimeout(timeoutId);
    }
  }, [raised, chime?.configuration]);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box className={cx("Mobile_Mui_controls_parent_container_box")}>
      <Box className={cx("Mobile_Mui_classroom_control_second_container")}>
        {classMode === ClassMode.Student && (
          <Tooltip
            title={
              raised
                ? intl.formatMessage({ id: "ChatInput.dismissHandAriaLabel" })
                : intl.formatMessage({ id: "ChatInput.raiseHandAriaLabel" })
            }
            placement="bottom"
          >
            <Avatar
              className={cx({
                Mobile_Mui_controls_raised_hand: raised,
                Mobile_Mui_controls_dismiss_hand: !raised,
              })}
              onClick={() => {
                setRaised(!raised);
              }}
            >
              {raised ? (
                <Icons src={"/icons/hand.svg"} />
              ) : (
                <Icons src={"/icons/hand_white.svg"} />
              )}
            </Avatar>
          </Tooltip>
        )}
        <Popover
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              top: "50px !important",
              bottom: "initial !important",
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
          {classMode === ClassMode.Teacher && (
            <MenuItem
              sx={{ fontSize: "12px" }}
              onClick={() => {
                chime?.leaveRoom(true);
                history.push(`${routes.MAIN}?id=${userInfo.teacherId}`);
              }}
            >
              {intl.formatMessage({ id: "Controls.EndMeeting" })}
            </MenuItem>
          )}
          <MenuItem
            sx={{ fontSize: "12px" }}
            onClick={async () => {
              if (classMode !== ClassMode.Teacher) {
                const webhookRes = {
                  meetingId: userInfo.meetingID,
                  internal_meeting_id: chime?.meetingId || "",
                  user_id: userInfo.userID,
                  batch_id: userInfo.batchId,
                  isJoin: false,
                };

                console.log("🏣🏣🏣🏣", webhookRes);
                await attendanceWenhook(webhookRes);
              }
              chime?.leaveRoom(false);
              history.push(routes.MAIN);
            }}
          >
            {intl.formatMessage({ id: "Controls.LeaveMeeting" })}
          </MenuItem>
        </Popover>
        <Tooltip
          title={
            classMode === ClassMode.Teacher
              ? intl.formatMessage({ id: "Controls.endClassroomTooltip" })
              : intl.formatMessage({ id: "Controls.leaveClassroomTooltip" })
          }
          placement="bottom"
        >
          <Box
            onClick={handleClick}
            className={cx("Mobile_Mui_controls_end_meeting_btn")}
          >
            Leave
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
}
