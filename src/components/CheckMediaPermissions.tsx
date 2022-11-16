import React, { useRef, useState, useEffect, useContext } from "react";
import { useIntl } from "react-intl";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  Link,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Bowser from "bowser";
import {
  MediaPermissionsError,
  MediaPermissionsErrorType,
  requestMediaPermissions,
} from "mic-check";
import classNames from "classnames/bind";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
// import getUIStateContext from "../context/getUIStateContext";
import styles from "./CheckMediaPermissions.css";
import ClassMode from "../enums/ClassMode";

const cx = classNames.bind(styles);
const browser = Bowser.getParser(window.navigator.userAgent);

enum DialogType {
  explanation = "explanation",
  systemDenied = "systemDenied",
  userDenied = "userDenied",
  trackError = "trackError",
}

type Props = {
  isRetry: () => void;
};
export default function CheckMediaPermissions(props: Props) {
  const { isRetry } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { globalVar } = useContext(getGlobalVarContext());
  const { userInfo, classMode } = globalVar;
  // const [state] = useContext(getUIStateContext());
  const intl = useIntl();
  const [showDialog, setShowDialog] = useState<DialogType | null>(null);
  const [audioAllowed, setAudioAllowed] = useState<boolean>(false);
  const [videoAllowed, setVideoAllowed] = useState<boolean>(false);
  const [errorDetails, setErrorDetails] = useState<
    MediaPermissionsError | undefined
  >();

  const showDialogRef = useRef(showDialog);
  showDialogRef.current = showDialog;
  const audioAllowedRef = useRef(audioAllowed);
  audioAllowedRef.current = audioAllowed;
  const videoAllowedRef = useRef(videoAllowed);
  videoAllowedRef.current = videoAllowed;

  useEffect(() => {
    // checkMediaPermissions();
    checkAudioPermissions();
    checkVideoPermissions();
  }, []);

  useEffect(() => {
    console.log("audio allowed permission changed: ", audioAllowed, videoAllowed);
    if (audioAllowed || videoAllowed) {
      console.log("audioAllowed===>",audioAllowed);
      console.log("videoAllowed===>",videoAllowed);
      // set the default devices
      // MediaManager.findMediaDevices();
    }
  }, [audioAllowed, videoAllowed]);

  const checkForExplanationDialog = () => {
    console.log("audioAllowedRef====>",audioAllowedRef.current);
    console.log("videoAllowedRef====>",videoAllowedRef.current);
    if (
      (!audioAllowedRef.current || !videoAllowedRef.current) &&
      showDialogRef.current === null
    )
      setShowDialog(DialogType.explanation);
  };

  // const checkMediaPermissions = () => {
  //   // TODO: listen to if there is a change on the audio/video piece?
  //   return new Promise((resolve) => {
  //     requestMediaPermissions()
  //       .then(() => {
  //         console.log("📸📸📸---🎙️🎙️🎙️🎙️")
  //         setAudioAllowed(true);
  //         setVideoAllowed(true);
  //         setShowDialog(null);
  //         resolve(true);
  //       })
  //       .catch((error: MediaPermissionsError) => {
  //         console.log("MediaOnboardingDialog: ", error);
  //         resolve(false);
  //         if (error.type === MediaPermissionsErrorType.SystemPermissionDenied) {
  //           // user denied permission
  //           setShowDialog(DialogType.systemDenied);
  //         } else if (
  //           error.type === MediaPermissionsErrorType.UserPermissionDenied
  //         ) {
  //           // browser doesn't have access to devices
  //           setShowDialog(DialogType.userDenied);
  //         } else if (
  //           error.type === MediaPermissionsErrorType.CouldNotStartVideoSource
  //         ) {
  //           // most likely when other apps or tabs are using the cam/mic (mostly windows)
  //           setShowDialog(DialogType.trackError);
  //         } else {
  //         }
  //         setErrorDetails(error);
  //       });

  //     setTimeout(() => {
  //       checkForExplanationDialog();
  //     }, 500);
  //   });
  // };

  const checkAudioPermissions = () => {
    // TODO: listen to if there is a change on the audio/video piece?
    return new Promise((resolve) => {
      requestMediaPermissions({audio: true, video: false})
        .then(() => {
          console.log("🎙️🎙️🎙️🎙️")
          setAudioAllowed(true);
          setShowDialog(null);
          resolve(true);
        })
        .catch((error: MediaPermissionsError) => {
          console.log("AudioOnboardingDialog: ", error);
          resolve(false);
          if (error.type === MediaPermissionsErrorType.SystemPermissionDenied) {
            // user denied permission
            setShowDialog(DialogType.systemDenied);
          } else if (
            error.type === MediaPermissionsErrorType.UserPermissionDenied
          ) {
            // browser doesn't have access to devices
            setShowDialog(DialogType.userDenied);
          } else if (
            error.type === MediaPermissionsErrorType.CouldNotStartVideoSource
          ) {
            // most likely when other apps or tabs are using the cam/mic (mostly windows)
            setShowDialog(DialogType.trackError);
          } else {
          }
          setErrorDetails(error);
        });

      setTimeout(() => {
        checkForExplanationDialog();
      }, 500);
    });
  };

  const checkVideoPermissions = () => {
    // TODO: listen to if there is a change on the audio/video piece?
    return new Promise((resolve) => {
      requestMediaPermissions({audio: false, video: true})
        .then(() => {
          console.log("📸📸📸---")
          setVideoAllowed(true);
          setShowDialog(null);
          resolve(true);
        })
        .catch((error: MediaPermissionsError) => {
          console.log("VideoOnboardingDialog: ", error);
          resolve(false);
          if (error.type === MediaPermissionsErrorType.SystemPermissionDenied) {
            // user denied permission
            setShowDialog(DialogType.systemDenied);
          } else if (
            error.type === MediaPermissionsErrorType.UserPermissionDenied
          ) {
            // browser doesn't have access to devices
            setShowDialog(DialogType.userDenied);
          } else if (
            error.type === MediaPermissionsErrorType.CouldNotStartVideoSource
          ) {
            // most likely when other apps or tabs are using the cam/mic (mostly windows)
            setShowDialog(DialogType.trackError);
          } else {
          }
          setErrorDetails(error);
        });

      setTimeout(() => {
        checkForExplanationDialog();
      }, 500);
    });
  };

  const _renderTryAgain = (text?: string) => {
    const element = document.getElementById("audioElement");
    return (
      <div style={{ width: "100%", marginTop: 20 }}>
        <Button
          onClick={async () => {
            if (browser.getBrowserName() === "Safari") {
              // If on Safari, rechecking permissions results in glitches so just refresh the page
              window.location.reload();
            } else {
              const isAudioAllowed = await checkAudioPermissions();
              const isVideoAllowed = await checkVideoPermissions();
              const start = async () => {
                try {
                  await chime?.createRoom(
                    userInfo.meetingName,
                    userInfo.meetingID,
                    userInfo.id,
                    userInfo.batchId,
                    userInfo.userName,
                    userInfo.userID,
                    userInfo.duration,
                    userInfo.isRecording,
                    classMode === ClassMode.Student
                      ? "student"
                      : "teacher",
                    null
                  );

                  await chime?.joinRoom(element as HTMLAudioElement | null);
                  isRetry();
                } catch (error) {
                  // eslint-disable-next-line
                  console.error(error);
                }
              };
              if (isAudioAllowed || isVideoAllowed) {
                start();
              }
            }
          }}
          color="primary"
          style={{ float: "right" }}
        >
          {text ? text : "Retry"}
        </Button>
      </div>
    );
  };

  const _renderErrorMessage = () => {
    if (!errorDetails) return null;
    return (
      <div style={{ marginTop: 10 }}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreRoundedIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="caption" style={{ color: "red" }}>
              {intl.formatMessage({ id: "checkeMediaPermmissions.errorDetails"})}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="caption">
              {errorDetails.name}: {errorDetails.message}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  };

  const _renderExplanationDialog = () => {
    return (
      <div className={cx("CheckMediaPermissions_Dialog")}>
        <Typography variant="h5">
          {intl.formatMessage({ id: "checkeMediaPermmissions.allowMicCamera" })}
        </Typography>
        <Typography variant="subtitle1">
          {intl.formatMessage({
            id: "checkeMediaPermmissions.needAccessMicCamera",
          })}
        </Typography>
      </div>
    );
  };

  const _renderUserDeniedDialog = () => {
    return (
      <div className={cx("CheckMediaPermissions_Dialog")}>
        <Typography variant="h5">
          {intl.formatMessage({
            id: "checkeMediaPermmissions.blockedMicCamera",
          })}
        </Typography>
        <Typography>
          {intl.formatMessage({
            id: "checkeMediaPermmissions.requiredMicCamera",
          })}{" "}
          {browser.getBrowserName() !== "Safari" && (
            <Typography>
              {intl.formatMessage({
                id: "checkeMediaPermmissions.cameraBlockedIcon",
              })}{" "}
              <img
                alt="icon"
                src={
                  "https://www.gstatic.com/meet/ic_blocked_camera_dark_f401bc8ec538ede48315b75286c1511b.svg"
                }
                style={{ display: "inline" }}
              />{" "}
              {intl.formatMessage({
                id: "checkeMediaPermmissions.browserAddressBar",
              })}
            </Typography>
          )}
        </Typography>
        {_renderErrorMessage()}
        {_renderTryAgain()}
      </div>
    );
  };

  const _renderSystemDeniedDialog = () => {
    const settingsDataByOS = {
      macOS: {
        name: "System Preferences",
        link: "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera",
      },
    };

    return (
      <div className={cx("CheckMediaPermissions_Dialog")}>
        <Typography variant="h5">
          {intl.formatMessage({ id: "checkeMediaPermmissions.cantUseMic" })}
        </Typography>
        <Typography>
          {intl.formatMessage({
            id: "checkeMediaPermmissions.browserMightNotHaveAccess",
          })}{" "}
          {
            // @ts-ignore
            settingsDataByOS[browser.getOSName()] ? (
              <Link
                onClick={() => {
                  window.open(
                    // @ts-ignore
                    settingsDataByOS[browser.getOSName()].link,
                    "_blank"
                  );
                }}
              >
                {
                  // @ts-ignore
                  settingsDataByOS[browser.getOSName()].name
                }
              </Link>
            ) : (
              "Settings"
            )
          }
          .
        </Typography>
        {_renderErrorMessage()}
        {_renderTryAgain()}
      </div>
    );
  };

  const _renderTrackErrorDialog = () => {
    return (
      <div className={cx("CheckMediaPermissions_Dialog")}>
        <Typography variant="h5">
          {intl.formatMessage({
            id: "checkeMediaPermmissions.cantStartCameraMicrophone",
          })}
        </Typography>
        <Typography>
          {intl.formatMessage({
            id: "checkeMediaPermmissions.anotherApplication",
          })}
        </Typography>
        {_renderErrorMessage()}
        {_renderTryAgain()}
      </div>
    );
  };

  const _renderDialogContent = () => {
    switch (showDialog) {
      case DialogType.explanation:
        return _renderExplanationDialog();
      case DialogType.systemDenied:
        return _renderSystemDeniedDialog();
      case DialogType.userDenied:
        return _renderUserDeniedDialog();
      case DialogType.trackError:
        return _renderTrackErrorDialog();
    }
  };
  return (
    <Dialog open={!!showDialog}>
      <>
      {showDialog && _renderDialogContent()}
      <IconButton 
        color="inherit"
        aria-label="close popup"
        edge="end"
        onClick={() => {
          setShowDialog(null);
        }}
        sx={{ color: "var(--color_thunderbird)", position:"absolute", right: "15px"}}
      >
        <CloseIcon />
      </IconButton>      
      </>
      </Dialog>
  );
}
