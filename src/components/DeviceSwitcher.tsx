// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useContext, useEffect } from "react";
import { useIntl } from "react-intl";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { FormLabel } from "@mui/material";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import useDevices from "../hooks/useDevices";

export default function DeviceSwitcher() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const deviceSwitcherState = useDevices();

  return (
    <Box
      sx={{
        width: "100%",
        height: 400,
        maxWidth: 360,
        bgcolor: "background.paper",
      }}
    >
      <FormControl sx={{ m: 1, minWidth: 260 }}>
        <FormLabel >Microphone:</FormLabel>
        <Select
          value={deviceSwitcherState?.currentAudioInputDevice?.value}
          onChange={async (event: any) => {
            const selectedDevice = deviceSwitcherState.audioInputDevices.filter(
              (item) => item.value === event.target.value
            );
            if (selectedDevice && selectedDevice.length > 0) {
              await chime?.chooseAudioInputDevice(selectedDevice[0]);
            }
          }}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
        >
          {deviceSwitcherState.audioInputDevices &&
            deviceSwitcherState.audioInputDevices.map((device) => {
              return (
                <MenuItem
                  key={`${device.value}`}
                  value={`${device.value}`}
                >{`${device.name}`}</MenuItem>
              );
            })}
        </Select>
      </FormControl>
      <FormControl  sx={{ m: 1, minWidth: 260 }}>
      <FormLabel >Speaker:</FormLabel>
        <Select
          value={deviceSwitcherState.currentAudioOutputDevice?.value}
          onChange={async (event: any) => {
            // eslint-disable-next-line prettier/prettier
            if (!chime?.browserBehavior.supportsSetSinkId()) {
              return;
            }
            const selectedDevice =
              deviceSwitcherState.audioOutputDevices.filter(
                (item) => item.value === event.target.value
              );
            if (selectedDevice && selectedDevice.length > 0) {
              await chime?.chooseAudioOutputDevice(selectedDevice[0]);
            }
          }}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
        >
          {deviceSwitcherState.audioOutputDevices &&
            deviceSwitcherState.audioOutputDevices.map((device) => {
              return (
                <MenuItem
                  key={`${device.value}`}
                  value={`${device.value}`}
                >{`${device.name}`}</MenuItem>
              );
            })}
        </Select>
      </FormControl>
      <FormControl  sx={{ m: 1, minWidth: 260 }}>
      <FormLabel >Camera:</FormLabel>
        <Select
          value={deviceSwitcherState.currentVideoInputDevice?.value}
          onChange={async (event: any) => {
            const selectedDevice =
              deviceSwitcherState.videoInputDevices.filter(
                (item) => item.value === event.target.value
              );
            if (selectedDevice && selectedDevice.length > 0) {
              await chime?.chooseVideoInputDevice(selectedDevice[0]);
            }
          }}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
        >
          {deviceSwitcherState.videoInputDevices &&
            deviceSwitcherState.videoInputDevices.map((device) => {
              return (
                <MenuItem
                  key={`${device.value}`}
                  value={`${device.value}`}
                >{`${device.name}`}</MenuItem>
              );
            })}
        </Select>
      </FormControl>
    </Box>
  );
}
