// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from "@mui/material";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
import useDevices from "../hooks/useDevices";
import MessageTopic from "../enums/MessageTopic";
import ClassMode from "../enums/ClassMode";

export default function DeviceSwitcher() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { globalVar, updateGlobalVar } = useContext(getGlobalVarContext());
  const { localVideo, classMode, screenSharePermit } = globalVar;
  const [screenSharePermitValue, setScreenSharePermitValue] = useState(
    screenSharePermit ? "all" : "host"
  );
  const deviceSwitcherState = useDevices();
  const intl = useIntl();
  const videoQualityList = [
    {
      name: "High quality (720p)",
      value: ["1280", "720", "30", "1400"],
    },
    {
      name: "Standard quality (360p)",
      value: ["640", "360", "15", "600"],
    },
    {
      name: "Low quality (180p)",
      value: ["320", "180", "15", "400"],
    },
  ];
  const [selectedQuality, setSelectedQuality] = useState(videoQualityList[0]);

  useEffect(() => {
    setScreenSharePermitValue(screenSharePermit ? "all" : "host");
  }, []);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newFocusState = screenSharePermitValue === "all" ? true : false;
    setScreenSharePermitValue((event.target as HTMLInputElement).value);
    newFocusState =
      (event.target as HTMLInputElement).value === "all" ? true : false;

    updateGlobalVar("screenSharePermit", newFocusState);
    localStorage.setItem("screenSharePermit", JSON.stringify(newFocusState));

    chime?.sendMessage(MessageTopic.ScreenSharePermit, {
      focus: newFocusState,
    });
    const msgObject = {
      sendingMessage: newFocusState
        ? intl.formatMessage({ id: "Controls.hostEnableScreenShare" })
        : intl.formatMessage({ id: "Controls.hostDisableScreenShare" }),
      channel: MessageTopic.PublicChannel,
    };
    chime?.sendMessage(MessageTopic.GroupChat, JSON.stringify(msgObject));
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: 400,
        maxWidth: 360,
        bgcolor: "background.paper",
      }}
    >
      <FormControl sx={{ m: 1, minWidth: 260, maxWidth: 260 }}>
        <FormLabel>
          {intl.formatMessage({ id: "DeviceSwitcher.microphone" })}
        </FormLabel>
        <Select
          value={deviceSwitcherState?.currentAudioInputDevice?.value}
          onChange={async (event: any) => {
            const selectedDevice =
              deviceSwitcherState?.audioInputDevices?.filter(
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
      <FormControl sx={{ m: 1, minWidth: 260, maxWidth: 260 }}>
        <FormLabel>
          {intl.formatMessage({ id: "DeviceSwitcher.speaker" })}
        </FormLabel>
        <Select
          value={deviceSwitcherState.currentAudioOutputDevice?.value}
          onChange={async (event: any) => {
            // eslint-disable-next-line prettier/prettier
            if (!chime?.browserBehavior.supportsSetSinkId()) {
              return;
            }
            const selectedDevice =
              deviceSwitcherState?.audioOutputDevices?.filter(
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
      <FormControl sx={{ m: 1, minWidth: 260, maxWidth: 260 }}>
        <FormLabel>
          {intl.formatMessage({ id: "DeviceSwitcher.camera" })}
        </FormLabel>
        <Select
          value={deviceSwitcherState.currentVideoInputDevice?.value}
          onChange={async (event: any) => {
            const selectedDevice =
              deviceSwitcherState?.videoInputDevices?.filter(
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

      <FormControl sx={{ m: 1, minWidth: 260, maxWidth: 260 }}>
        <FormLabel>
          {intl.formatMessage({ id: "DeviceSwitcher.videoQuality" })}
        </FormLabel>
        <Select
          value={selectedQuality?.value}
          onChange={(event: any) => {
            if (!event.target.value) {
              return;
            }
            const qualityValue = event.target.value.split(",");
            if (qualityValue[1] === "720") {
              setSelectedQuality(videoQualityList[0]);
            } else if (qualityValue[1] === "360") {
              setSelectedQuality(videoQualityList[1]);
            } else {
              setSelectedQuality(videoQualityList[2]);
            }
            // set video local video quality 180p,360p,720p
            chime?.audioVideo?.chooseVideoInputQuality(
              qualityValue[0],
              qualityValue[1],
              qualityValue[2],
              qualityValue[3]
            );
            if (localVideo) {
              chime?.audioVideo?.stopLocalVideoTile();
              setTimeout(async () => {
                if (!chime?.currentVideoInputDevice) {
                  throw new Error("currentVideoInputDevice does not exist");
                }
                await chime?.chooseVideoInputDevice(
                  chime?.currentVideoInputDevice
                );
                chime?.audioVideo?.startLocalVideoTile();
              }, 500);
            }
          }}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
        >
          {videoQualityList.map((quality) => {
            return (
              <MenuItem
                key={`${quality.value}`}
                value={`${quality.value}`}
              >{`${quality.name}`}</MenuItem>
            );
          })}
        </Select>
      </FormControl>

      {classMode === ClassMode.Teacher && (
        <FormControl sx={{ m: 1, minWidth: 260, maxWidth: 260 }}>
          <FormLabel>
            {intl.formatMessage({ id: "DeviceSwitcher.screenSharePermit" })}
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-form-control-label-placement"
            name="position"
            value={screenSharePermitValue}
            onChange={handleRadioChange}
          >
            <FormControlLabel
              value="host"
              control={<Radio />}
              label="Host Only"
            />
            <FormControlLabel
              value="all"
              control={<Radio />}
              label="All participants"
            />
          </RadioGroup>
        </FormControl>
      )}
    </Box>
  );
}
