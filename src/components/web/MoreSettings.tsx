// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import React, { useContext, useState } from "react";
import { useIntl } from "react-intl";

import {
  Button,
  Divider,
  ListItem,
  MenuItem,
  Popover,
  Tooltip,
} from "@mui/material";

import ChimeSdkWrapper from "../../chime/ChimeSdkWrapper";
import getChimeContext from "../../context/getChimeContext";
import getGlobalVarContext from "../../context/getGlobalVarContext";
import useDevices from "../../hooks/useDevices";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Icons from "../../custom/Icons";

export default function MoreSettings() {
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { globalVar } = useContext(getGlobalVarContext());
  const { localVideo } = globalVar;
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

  const openMenu = Boolean(menuAnchorEl);
  const openMicrophoneDeviceSettings = Boolean(microphoneDeviceAnchorEl);
  const openSpeakerDeviceSettings = Boolean(speakerDeviceAnchorEl);
  const openCameraDeviceSettings = Boolean(cameraDeviceAnchorEl);
  const openVideoQualitySettings = Boolean(videoQualityAnchorEl);

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

  // const handleScreenSharePermitPopoverOpen = (event: any) => {
  //   setScreenSharePermitAnchorEl(event?.currentTarget);
  // };
  // const handleScreenSharePermitPopoverClose = () => {
  //   setScreenSharePermitAnchorEl(null);
  // };

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
        <Button
          sx={{ width: "80px" }}
          onClick={handleMenuClick}
          className={"Controls_btn_not_active"}
        >
          <Icons src={"/icons/more.svg"} />
          <span className={"Controls_margin_right"}>
            {intl.formatMessage({ id: "Controls.menu" })}
          </span>
        </Button>
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
            bgcolor: "var(--third_blue_color)",
            color: "var(--pure_white_color)",
            border: "1px solid var(--controls_border_color)",
            width: "250px",
            overflow: "visible",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              bottom: -10,
              left: "50%",
              width: 10,
              height: 10,
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
              borderBottom: "1px solid var(--controls_border_color)",
              borderRight: "1px solid var(--controls_border_color)",
              backgroundColor: "var(--third_blue_color)",
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
          sx={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
          }}
        >
          {intl.formatMessage({ id: "DeviceSwitcher.microphone" })}
          <KeyboardArrowRightIcon />
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
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              marginLeft: "10px",
              bgcolor: "var(--third_blue_color)",
              color: "var(--pure_white_color)",
              border: "1px solid var(--controls_border_color)",
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: "50%",
                left: -5,
                width: 10,
                height: 10,
                borderBottom: "1px solid var(--controls_border_color)",
                borderLeft: "1px solid var(--controls_border_color)",
                backgroundColor: "var(--third_blue_color)",
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
                  {deviceSwitcherState?.currentAudioInputDevice?.value ===
                  device.value ? (
                    <Icons src={"/icons/check_icon.svg"} />
                  ) : (
                    <Icons src={"/icons/check_icon_black.svg"} />
                  )}
                  <ListItem
                    sx={{ padding: "0px 10px", fontSize: "12px" }}
                  >{`${device.name}`}</ListItem>
                </MenuItem>
              );
            })}
          {!deviceSwitcherState.audioInputDevices?.length && (
            <MenuItem sx={{ fontSize: "12px" }}>
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
          sx={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
          }}
        >
          {intl.formatMessage({ id: "DeviceSwitcher.speaker" })}
          <KeyboardArrowRightIcon />
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
              bgcolor: "var(--third_blue_color)",
              color: "var(--pure_white_color)",
              border: "1px solid var(--controls_border_color)",
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: "50%",
                left: -5,
                width: 10,
                height: 10,
                borderBottom: "1px solid var(--controls_border_color)",
                borderLeft: "1px solid var(--controls_border_color)",
                backgroundColor: "var(--third_blue_color)",
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
                  {deviceSwitcherState?.currentAudioOutputDevice?.value ===
                  device.value ? (
                    <Icons src={"/icons/check_icon.svg"} />
                  ) : (
                    <Icons src={"/icons/check_icon_black.svg"} />
                  )}
                  <ListItem
                    sx={{ padding: "0px 10px", fontSize: "12px" }}
                  >{`${device.name}`}</ListItem>
                </MenuItem>
              );
            })}
          {!deviceSwitcherState.audioOutputDevices?.length && (
            <MenuItem sx={{ fontSize: "12px" }}>
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
          sx={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
          }}
        >
          {intl.formatMessage({ id: "DeviceSwitcher.camera" })}
          <KeyboardArrowRightIcon />
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
              bgcolor: "var(--third_blue_color)",
              color: "var(--pure_white_color)",
              border: "1px solid var(--controls_border_color)",
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: "50%",
                left: -5,
                width: 10,
                height: 10,
                borderBottom: "1px solid var(--controls_border_color)",
                borderLeft: "1px solid var(--controls_border_color)",
                backgroundColor: "var(--third_blue_color)",
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
                  {deviceSwitcherState?.currentVideoInputDevice?.value ===
                  device.value ? (
                    <Icons src={"/icons/check_icon.svg"} />
                  ) : (
                    <Icons src={"/icons/check_icon_black.svg"} />
                  )}
                  <ListItem
                    sx={{ padding: "0px 10px", fontSize: "12px" }}
                  >{`${device.name}`}</ListItem>
                </MenuItem>
              );
            })}
          {!deviceSwitcherState.videoInputDevices?.length && (
            <MenuItem sx={{ fontSize: "12px" }}>
              {intl.formatMessage({
                id: "DeviceSwitcher.noVideoInputPlaceholder",
              })}
            </MenuItem>
          )}
        </Popover>
        <Divider className={"Controls_diveder"} />
        <MenuItem
          onClick={(event) => {
            handleVideoQualityPopoverOpen(event);
          }}
          onMouseLeave={() => {
            if (!videoQualityAnchorEl) handleVideoQualityPopoverClose();
          }}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
          }}
        >
          {intl.formatMessage({ id: "DeviceSwitcher.videoQuality" })}
          <KeyboardArrowRightIcon />
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
              bgcolor: "var(--third_blue_color)",
              color: "var(--pure_white_color)",
              border: "1px solid var(--controls_border_color)",
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: "50%",
                left: -5,
                width: 10,
                height: 10,
                borderBottom: "1px solid var(--controls_border_color)",
                borderLeft: "1px solid var(--controls_border_color)",
                backgroundColor: "var(--third_blue_color)",
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
                {selectedQuality?.name === quality.name ? (
                  <Icons src={"/icons/check_icon.svg"} />
                ) : (
                  <Icons src={"/icons/check_icon_black.svg"} />
                )}
                <ListItem
                  sx={{ padding: "0px 10px", fontSize: "12px" }}
                >{`${quality.name}`}</ListItem>
              </MenuItem>
            );
          })}
          {!deviceSwitcherState.videoInputDevices?.length && (
            <MenuItem sx={{ fontSize: "12px" }}>
              {intl.formatMessage({
                id: "DeviceSwitcher.noVideoInputPlaceholder",
              })}
            </MenuItem>
          )}
        </Popover>

        <Divider className={"Controls_diveder"} />
        <MenuItem onClick={handleFullScreen} sx={{ fontSize: "12px" }}>
          {enterFullScreen
            ? intl.formatMessage({ id: "Classroom.exitFullScreen" })
            : intl.formatMessage({ id: "Classroom.fullScreen" })}
        </MenuItem>
      </Popover>
    </>
  );
}
