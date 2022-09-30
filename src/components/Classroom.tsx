// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from "react-modal";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getMeetingStatusContext from "../context/getMeetingStatusContext";
import getUIStateContext from "../context/getUIStateContext";
import ClassMode from "../enums/ClassMode";
import MeetingStatus from "../enums/MeetingStatus";
import ViewMode from "../enums/ViewMode";
import useRemoteControl from "../hooks/useRemoteControl";
import Chat from "./Chat";
import styles from "./Classroom.css";
import ContentVideo from "./ContentVideo";
import Controls from "./Controls";
import CopyInfo from "./CopyInfo";
import DeviceSwitcher from "./DeviceSwitcher";
import Error from "./Error";
import LoadingSpinner from "./LoadingSpinner";
import LocalVideo from "./LocalVideo";
import RemoteVideoGroup from "./RemoteVideoGroup";
import Roster from "./Roster";
import Tooltip from "./Tooltip";

const cx = classNames.bind(styles);

export default function Classroom() {
  Modal.setAppElement("body");
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [state] = useContext(getUIStateContext());
  const { meetingStatus, errorMessage } = useContext(getMeetingStatusContext());
  const [isContentShareEnabled, setIsContentShareEnabled] = useState(false);
  const [viewMode, setViewMode] = useState(ViewMode.Room);
  const [isModeTransitioning, setIsModeTransitioning] = useState(false);
  const [openRightBar, setOpenRightBar] = useState(true);
  const intl = useIntl();


  useRemoteControl();
  const stopContentShare = async () => {
    setIsModeTransitioning(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    try {
      chime?.audioVideo?.stopContentShare();
    } catch (error) {
      // eslint-disable-next-line
      console.error(error);
    } finally {
      setViewMode(ViewMode.Room);
      setIsModeTransitioning(false);
    }
  };

  // Must pass a memoized callback to the ContentVideo component using useCallback().
  // ContentVideo will re-render only when one dependency "viewMode" changes.
  // See more comments in ContentVideo.
  const onContentShareEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled && viewMode === ViewMode.ScreenShare) {
        await stopContentShare();
      }
      setIsContentShareEnabled(enabled);
    },
    [viewMode]
  );

  if (process.env.NODE_ENV === "production") {
    useEffect(() => {
      // Recommend using "onbeforeunload" over "addEventListener"
      window.onbeforeunload = async (event: BeforeUnloadEvent) => {
        // Prevent the window from closing immediately
        // eslint-disable-next-line
        event.returnValue = true;
        try {
          await chime?.leaveRoom(state.classMode === ClassMode.Teacher);
        } catch (error) {
          // eslint-disable-next-line
          console.error(error);
        } finally {
          window.onbeforeunload = null;
        }
      };
      return () => {
        window.onbeforeunload = null;
      };
    }, []);
  }

  return (
    <div
      className={cx("ClassRoom_classroom", {
        ClassRoom_roomMode: viewMode === ViewMode.Room,
        ClassRoom_screenShareMode: viewMode === ViewMode.ScreenShare,
        isModeTransitioning,
        isContentShareEnabled,
      })}
    >
      {meetingStatus === MeetingStatus.Loading && <LoadingSpinner />}
      {meetingStatus === MeetingStatus.Failed && (
        <Error errorMessage={errorMessage} />
      )}
      {meetingStatus === MeetingStatus.Succeeded && (
        <>
          <>
            <div className={cx("ClassRoom_left")}>
              <div className={cx("ClassRoom_contentVideoWrapper")}>
                <ContentVideo onContentShareEnabled={onContentShareEnabled} />
              </div>
              <div className={cx("ClassRoom_remoteVideoGroupWrapper")}>
                <RemoteVideoGroup
                  viewMode={viewMode}
                  isContentShareEnabled={isContentShareEnabled}
                />
              </div>
              <div className={cx("ClassRoom_localVideoWrapper")}>
                <div className={cx("ClassRoom_controls")}>
                  <Controls
                    viewMode={viewMode}
                    onClickShareButton={async () => {
                      try {
                        await chime?.audioVideo?.startContentShareFromScreenCapture();
                      } catch (err) {
                        console.log("err.....", err);
                      }
                    }}
                  />
                </div>
                <div className={cx("ClassRoom_localVideo")}>
                  <LocalVideo />
                </div>
              </div>
            </div>

            <div className={cx("ClassRoom_right",{
              Classroom_right_none: !openRightBar
            })}>
              <div className={cx("ClassRoom_titleWrapper")}>
                <Tooltip
                    tooltip={intl.formatMessage({ id: 'Classroom.closeRightMenu' })}
                  >
                <div className={cx('ClassRoom_right_close')} onClick={() => setOpenRightBar(false)}><i className="fas fa-2x fa-times" /></div>
                </Tooltip>
                <div className={cx("ClassRoom_label")}>
                  <FormattedMessage id="Classroom.classroom" />
                </div>
                <CopyInfo />
              </div>
              <div className={cx("ClassRoom_deviceSwitcher")}>
                <DeviceSwitcher />
              </div>
              <div className={cx("ClassRoom_roster")}>
                <Roster />
              </div>
              <div className={cx("ClassRoom_chat")}>
                <Chat />
              </div>
            </div>
            
            {
              !openRightBar && (<Tooltip
                tooltip={intl.formatMessage({ id: 'Classroom.openRightMenu' })}
              >
                <div className={cx('ClassRoom_right_open')} onClick={() => setOpenRightBar(true)}><i className="fas fa-2x fa-bars" /></div>
              </Tooltip>  
              )
            }                    
          </>
        </>
      )}
    </div>
  );
}
