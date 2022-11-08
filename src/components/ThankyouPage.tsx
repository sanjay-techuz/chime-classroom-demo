// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */
import React, { useEffect, useContext } from "react";
import { useIntl } from "react-intl";

import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import ClassMode from '../enums/ClassMode';

import getUIStateContext from '../context/getUIStateContext';
import common from '../constants/common.json';

export default function ThankyouPage() {
  const intl = useIntl();
  const query = new URLSearchParams(useLocation().search);
  const [state] = useContext(getUIStateContext());
  const id = query.get('id') || "";

  useEffect(() => {
    console.log("-------->MAIN",state.classMode,common.domain,id);
    if(state.classMode === ClassMode.Teacher){
      window.location.href = `${common.domain}complete?id=${id}`;
    }else{
      window.location.href = `${common.domain}complete`;
    }
  },[])

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
