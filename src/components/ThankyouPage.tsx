// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */
import React from "react";
import { useIntl } from "react-intl";

import { Box, Typography } from "@mui/material";

export default function ThankyouPage() {
  const intl = useIntl();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Typography>{intl.formatMessage({ id: "ThankyouPage.message"})}</Typography>
    </Box>
  );
}
