// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { Avatar, Divider, MenuItem, Popover, Tooltip } from "@mui/material";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
import useDevices from "../hooks/useDevices";
import MessageTopic from "../enums/MessageTopic";
import ClassMode from "../enums/ClassMode";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import CheckIcon from "@mui/icons-material/Check";

type Props = {
  handleGridView: () => void;
  isGridView: boolean;
};

export default function MoreSettings(props: Props) {
  const { handleGridView, isGridView } = props;
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
  const [enterFullScreen, setEnterFullScreen] = React.useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [microphoneDeviceAnchorEl, setMicrophoneDeviceAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [speakerDeviceAnchorEl, setSpeakerDeviceAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [cameraDeviceAnchorEl, setCameraDeviceAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [videoQualityAnchorEl, setVideoQualityAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [screenSharePermitAnchorEl, setScreenSharePermitAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(menuAnchorEl);
  const openMicrophoneDeviceSettings = Boolean(microphoneDeviceAnchorEl);
  const openSpeakerDeviceSettings = Boolean(speakerDeviceAnchorEl);
  const openCameraDeviceSettings = Boolean(cameraDeviceAnchorEl);
  const openVideoQualitySettings = Boolean(videoQualityAnchorEl);
  const screenSharePermitSettings = Boolean(screenSharePermitAnchorEl);

  useEffect(() => {
    setScreenSharePermitValue(screenSharePermit ? "all" : "host");
  }, []);

  const handleRadioChange = (value: string) => {
    let newFocusState = screenSharePermitValue === "all" ? true : false;
    setScreenSharePermitValue(value);
    newFocusState = value === "all" ? true : false;

    updateGlobalVar("screenSharePermit", newFocusState);
    localStorage.setItem("screenSharePermit", JSON.stringify(newFocusState));

    chime?.sendMessage(MessageTopic.ScreenSharePermit, {
      focus: newFocusState,
    });
  };

  const handleMenuClick = (event: any) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleMicrophonePopoverOpen = (event: any) => {
    setMicrophoneDeviceAnchorEl(event?.currentTarget);
  };
  const handleMicrophonePopoverClose = () => {
    setMicrophoneDeviceAnchorEl(null);
  };

  const handleSpeakerPopoverOpen = (event: any) => {
    setSpeakerDeviceAnchorEl(event?.currentTarget);
  };
  const handleSpeakerPopoverClose = () => {
    setSpeakerDeviceAnchorEl(null);
  };

  const handleCameraPopoverOpen = (event: any) => {
    setCameraDeviceAnchorEl(event?.currentTarget);
  };
  const handleCameraPopoverClose = () => {
    setCameraDeviceAnchorEl(null);
  };

  const handleVideoQualityPopoverOpen = (event: any) => {
    setVideoQualityAnchorEl(event?.currentTarget);
  };
  const handleVideoQualityPopoverClose = () => {
    setVideoQualityAnchorEl(null);
  };

  const handleScreenSharePermitPopoverOpen = (event: any) => {
    setScreenSharePermitAnchorEl(event?.currentTarget);
  };
  const handleScreenSharePermitPopoverClose = () => {
    setScreenSharePermitAnchorEl(null);
  };

  document.addEventListener("fullscreenchange", exitHandler, false);
  document.addEventListener("mozfullscreenchange", exitHandler, false);
  document.addEventListener("MSFullscreenChange", exitHandler, false);
  document.addEventListener("webkitfullscreenchange", exitHandler, false);
  document.addEventListener("keydown", (event) => {
    if (event.which == 122) {
      event.preventDefault();
      exitHandler;
    }
  });

  function exitHandler() {
    const element: any = document;
    if (element.webkitIsFullScreen === false) {
      setEnterFullScreen(false);
    } else if (element.mozFullScreen === false) {
      setEnterFullScreen(false);
    } else if (element.msFullscreenElement === false) {
      setEnterFullScreen(false);
    }
  }

  const handleFullScreen = () => {
    if (enterFullScreen) {
      setEnterFullScreen(false);
      const docWithBrowsersExitFunctions = document as Document & {
        mozCancelFullScreen(): Promise<void>;
        webkitExitFullscreen(): Promise<void>;
        msExitFullscreen(): Promise<void>;
      };
      if (docWithBrowsersExitFunctions.exitFullscreen) {
        docWithBrowsersExitFunctions.exitFullscreen();
      } else if (docWithBrowsersExitFunctions.mozCancelFullScreen) {
        /* Firefox */
        docWithBrowsersExitFunctions.mozCancelFullScreen();
      } else if (docWithBrowsersExitFunctions.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        docWithBrowsersExitFunctions.webkitExitFullscreen();
      } else if (docWithBrowsersExitFunctions.msExitFullscreen) {
        /* IE/Edge */
        docWithBrowsersExitFunctions.msExitFullscreen();
      }
    } else {
      setEnterFullScreen(true);
      const docElmWithBrowsersFullScreenFunctions =
        document.documentElement as HTMLElement & {
          mozRequestFullScreen(): Promise<void>;
          webkitRequestFullscreen(): Promise<void>;
          msRequestFullscreen(): Promise<void>;
        };

      if (docElmWithBrowsersFullScreenFunctions.requestFullscreen) {
        docElmWithBrowsersFullScreenFunctions.requestFullscreen();
      } else if (docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen) {
        /* Firefox */
        docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen();
      } else if (
        docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen
      ) {
        /* Chrome, Safari and Opera */
        docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen();
      } else if (docElmWithBrowsersFullScreenFunctions.msRequestFullscreen) {
        /* IE/Edge */
        docElmWithBrowsersFullScreenFunctions.msRequestFullscreen();
      }
    }
    handleMenuClose();
  };

  return (
    <>
      <Tooltip
        title={intl.formatMessage({ id: "Controls.menu" })}
        placement="bottom"
      >
        <Avatar
          onClick={handleMenuClick}
          sx={{
            bgcolor: "var(--secondary_blue_color)",
            border: "1px solid var(--pure_white_color)",
            color: "var(--pure_white_color)",
            cursor: "pointer",
          }}
        >
          <MoreVertOutlinedIcon />
        </Avatar>
      </Tooltip>

      <Popover
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        anchorEl={menuAnchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            bottom: "75px !important",
            top: "initial !important",
            overflow: "visible",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              bottom: -10,
              left: "50%",
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem
          onClick={(event) => {
            handleMicrophonePopoverOpen(event);
          }}
          onMouseLeave={() => {
            if (!microphoneDeviceAnchorEl) handleMicrophonePopoverClose();
          }}
        >
          {intl.formatMessage({ id: "DeviceSwitcher.microphone" })}
        </MenuItem>
        <Popover
          id="mouse-over-popover"
          open={openMicrophoneDeviceSettings}
          anchorEl={microphoneDeviceAnchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={handleMicrophonePopoverClose}
          // onMouseLeave={handleMicrophonePopoverClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              marginLeft: "10px",
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: "50%",
                left: -5,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
        >
          {deviceSwitcherState.audioInputDevices &&
            deviceSwitcherState.audioInputDevices.map((device) => {
              return (
                <MenuItem
                  key={`${device.value}`}
                  value={`${device.value}`}
                  onClick={async () => {
                    await chime?.chooseAudioInputDevice(device);
                  }}
                >
                  <CheckIcon
                    sx={{
                      mr: 1,
                      color:
                        deviceSwitcherState?.currentAudioInputDevice?.value ===
                        device.value
                          ? "black"
                          : "white",
                    }}
                  />{" "}
                  {`${device.name}`}
                </MenuItem>
              );
            })}
          {!deviceSwitcherState.audioInputDevices?.length && (
            <MenuItem>
              {intl.formatMessage({
                id: "DeviceSwitcher.noAudioInputPlaceholder",
              })}
            </MenuItem>
          )}
        </Popover>

        <MenuItem
          onClick={(event) => {
            handleSpeakerPopoverOpen(event);
          }}
          onMouseLeave={() => {
            if (!speakerDeviceAnchorEl) handleSpeakerPopoverClose();
          }}
        >
          {intl.formatMessage({ id: "DeviceSwitcher.speaker" })}
        </MenuItem>
        <Popover
          id="mouse-over-popover"
          open={openSpeakerDeviceSettings}
          anchorEl={speakerDeviceAnchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={handleSpeakerPopoverClose}
          onMouseLeave={handleSpeakerPopoverClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              marginLeft: "10px",
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: "50%",
                left: -5,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
        >
          {deviceSwitcherState.audioOutputDevices &&
            deviceSwitcherState.audioOutputDevices.map((device) => {
              return (
                <MenuItem
                  key={`${device.value}`}
                  value={`${device.value}`}
                  onClick={async () => {
                    await chime?.chooseAudioOutputDevice(device);
                  }}
                >
                  <CheckIcon
                    sx={{
                      mr: 1,
                      color:
                        deviceSwitcherState?.currentAudioOutputDevice?.value ===
                        device.value
                          ? "black"
                          : "white",
                    }}
                  />{" "}
                  {`${device.name}`}
                </MenuItem>
              );
            })}
          {!deviceSwitcherState.audioOutputDevices?.length && (
            <MenuItem>
              {intl.formatMessage({
                id: "DeviceSwitcher.noAudioOutputPlaceholder",
              })}
            </MenuItem>
          )}
        </Popover>

        <MenuItem
          onClick={(event) => {
            handleCameraPopoverOpen(event);
          }}
          onMouseLeave={() => {
            if (!cameraDeviceAnchorEl) handleCameraPopoverClose();
          }}
        >
          {intl.formatMessage({ id: "DeviceSwitcher.camera" })}
        </MenuItem>
        <Popover
          id="mouse-over-popover"
          open={openCameraDeviceSettings}
          anchorEl={cameraDeviceAnchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={handleCameraPopoverClose}
          onMouseLeave={handleCameraPopoverClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              marginLeft: "10px",
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: "50%",
                left: -5,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
        >
          {deviceSwitcherState.videoInputDevices &&
            deviceSwitcherState.videoInputDevices.map((device) => {
              return (
                <MenuItem
                  key={`${device.value}`}
                  value={`${device.value}`}
                  onClick={async () => {
                    await chime?.chooseVideoInputDevice(device);
                  }}
                >
                  <CheckIcon
                    sx={{
                      mr: 1,
                      color:
                        deviceSwitcherState?.currentVideoInputDevice?.value ===
                        device.value
                          ? "black"
                          : "white",
                    }}
                  />{" "}
                  {`${device.name}`}
                </MenuItem>
              );
            })}
          {!deviceSwitcherState.videoInputDevices?.length && (
            <MenuItem>
              {intl.formatMessage({
                id: "DeviceSwitcher.noVideoInputPlaceholder",
              })}
            </MenuItem>
          )}
        </Popover>
        <Divider />
        <MenuItem
          onClick={(event) => {
            handleVideoQualityPopoverOpen(event);
          }}
          onMouseLeave={() => {
            if (!videoQualityAnchorEl) handleVideoQualityPopoverClose();
          }}
        >
          {intl.formatMessage({ id: "DeviceSwitcher.videoQuality" })}
        </MenuItem>
        <Popover
          id="mouse-over-popover"
          open={openVideoQualitySettings}
          anchorEl={videoQualityAnchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={handleVideoQualityPopoverClose}
          onMouseLeave={handleVideoQualityPopoverClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              marginLeft: "10px",
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: "50%",
                left: -5,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
        >
          {videoQualityList.map((quality) => {
            return (
              <MenuItem
                key={`${quality.value}`}
                value={`${quality.value}`}
                onClick={async () => {
                  const qualityValue = quality.value;
                  if (qualityValue[1] === "720") {
                    setSelectedQuality(videoQualityList[0]);
                  } else if (qualityValue[1] === "360") {
                    setSelectedQuality(videoQualityList[1]);
                  } else {
                    setSelectedQuality(videoQualityList[2]);
                  }
                  // set video local video quality 180p,360p,720p
                  chime?.audioVideo?.chooseVideoInputQuality(
                    Number(qualityValue[0]),
                    Number(qualityValue[1]),
                    Number(qualityValue[2]),
                    Number(qualityValue[3])
                  );
                  if (localVideo) {
                    chime?.audioVideo?.stopLocalVideoTile();
                    setTimeout(async () => {
                      if (!chime?.currentVideoInputDevice) {
                        throw new Error(
                          "currentVideoInputDevice does not exist"
                        );
                      }
                      await chime?.chooseVideoInputDevice(
                        chime?.currentVideoInputDevice
                      );
                      chime?.audioVideo?.startLocalVideoTile();
                    }, 500);
                  }
                }}
              >
                <CheckIcon
                  sx={{
                    mr: 1,
                    color:
                      selectedQuality?.name === quality.name
                        ? "black"
                        : "white",
                  }}
                />{" "}
                {`${quality.name}`}
              </MenuItem>
            );
          })}
          {!deviceSwitcherState.videoInputDevices?.length && (
            <MenuItem>
              {intl.formatMessage({
                id: "DeviceSwitcher.noVideoInputPlaceholder",
              })}
            </MenuItem>
          )}
        </Popover>

        {classMode === ClassMode.Teacher && (
          <MenuItem
            onClick={(event) => {
              handleScreenSharePermitPopoverOpen(event);
            }}
            onMouseLeave={() => {
              if (!screenSharePermitAnchorEl)
                handleScreenSharePermitPopoverClose();
            }}
          >
            {intl.formatMessage({ id: "DeviceSwitcher.screenSharePermit" })}
          </MenuItem>
        )}
        <Popover
          id="mouse-over-popover"
          open={screenSharePermitSettings}
          anchorEl={screenSharePermitAnchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={handleScreenSharePermitPopoverClose}
          onMouseLeave={handleScreenSharePermitPopoverClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              marginLeft: "10px",
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: "50%",
                left: -5,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
        >
          <MenuItem
            value={"host"}
            onClick={() => {
              handleRadioChange("host");
            }}
          >
            <CheckIcon
              sx={{
                mr: 1,
                color: screenSharePermitValue === "host" ? "black" : "white",
              }}
            />{" "}
            {intl.formatMessage({ id: "DeviceSwitcher.hostOnly" })}
          </MenuItem>
          <MenuItem
            value={"all"}
            onClick={() => {
              handleRadioChange("all");
            }}
          >
            <CheckIcon
              sx={{
                mr: 1,
                color: screenSharePermitValue === "all" ? "black" : "white",
              }}
            />{" "}
            {intl.formatMessage({ id: "DeviceSwitcher.allParticipants" })}
          </MenuItem>
        </Popover>
        <Divider />
        <MenuItem
          onClick={() => {
            handleGridView();
            handleMenuClose();
          }}
        >
          {isGridView
            ? intl.formatMessage({ id: "Classroom.activeSpeakerView" })
            : intl.formatMessage({ id: "Classroom.gridView" })}
        </MenuItem>
        <MenuItem onClick={handleFullScreen}>
          {enterFullScreen
            ? intl.formatMessage({ id: "Classroom.exitFullScreen" })
            : intl.formatMessage({ id: "Classroom.fullScreen" })}
        </MenuItem>
      </Popover>
    </>
  );
}
