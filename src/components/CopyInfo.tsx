// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import React, { useState, useContext } from "react";
import { useIntl } from "react-intl";

import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import { clipBoard } from "../utils";

export default function CopyInfo() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [isMeetingCoppied, setIsMeetingCoppied] = useState(false);
  const [isMeetingUrlCoppied, setIsMeetingUrlCoppied] = useState(false);
  const url = new URL(window.location.href);

  const intl = useIntl();

  const copyMeetinId = () => {
    setIsMeetingCoppied(true);
    clipBoard(chime?.title as string);
    setTimeout(() => {
      setIsMeetingCoppied(false);
    }, 5000);
  };

  const copyMeetingUrl = () => {
    setIsMeetingUrlCoppied(true);
    const meetingUrl: string = `${url.origin}/?meetingId=${encodeURIComponent(
      chime?.title as string
    )}`;
    clipBoard(meetingUrl);
    setTimeout(() => {
      setIsMeetingUrlCoppied(false);
    }, 5000);
  };

  const copyMeetingInfo = () => {
    setIsMeetingUrlCoppied(true);
    const meetingInfo: string = `To join the video meeting, click this link: ${
      url.origin
    }/?meetingId=${encodeURIComponent(chime?.title as string)}.`;
    clipBoard(meetingInfo);
    setTimeout(() => {
      setIsMeetingUrlCoppied(false);
    }, 5000);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: 400,
        maxWidth: 360,
        bgcolor: "background.paper",
        padding: "10px",
      }}
    >
      <Typography variant="subtitle1" display="block" gutterBottom>
        {intl.formatMessage({ id: "Copyinfo.meetingId"})} {chime?.title} {` `}{" "}
        <Tooltip
          title={
            !isMeetingCoppied
              ? intl.formatMessage({ id: "Copyinfo.copyMeetingId" })
              : intl.formatMessage({
                  id: "Copyinfo.coppiedMeetingId",
                })
          }
          placement="bottom"
        >
          <IconButton onClick={copyMeetinId}>
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      </Typography>
      <Typography variant="subtitle1" display="block" gutterBottom>
        {`${url.origin}/?meetingId=${encodeURIComponent(chime?.title as string)}`}
        <Tooltip
          title={
            !isMeetingUrlCoppied
              ? intl.formatMessage({ id: "Copyinfo.copyMeetingId" })
              : intl.formatMessage({
                  id: "Copyinfo.coppiedMeetingId",
                })
          }
          placement="bottom"
        >
          <IconButton onClick={copyMeetingUrl}>
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      </Typography>
      <Button onClick={copyMeetingInfo}>
        <IconButton sx={{ ml: "10px", color: "#1976d2" }}>
          <ContentCopyIcon />
        </IconButton>
        {intl.formatMessage({ id: "Copyinfo.copyMeetingInfo"})}
      </Button>
    </Box>
  );
}
