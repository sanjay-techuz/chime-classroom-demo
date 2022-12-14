// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import classNames from 'classnames/bind';
import React, { useContext, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import routes from '../constants/routes.json';
import getChimeContext from '../context/getChimeContext';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import ViewMode from '../enums/ViewMode';
import styles from './Controls.css';
import Tooltip from './Tooltip';
import MessageTopic from '../enums/MessageTopic';
import { startRecording, stopRecording } from '../services';
import localStorageKeys from '../constants/localStorageKeys.json';

const cx = classNames.bind(styles);

enum VideoStatus {
  Disabled,
  Loading,
  Enabled
}

type Props = {
  viewMode: ViewMode;
  onClickShareButton: () => void;
};

export default function Controls(props: Props) {
  const { viewMode, onClickShareButton } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [state] = useContext(getUIStateContext());
  const history = useHistory();
  const [muted, setMuted] = useState(false);
  const [focus, setFocus] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaPipelineId, setMediaPipelineId] = useState('');
  const [videoStatus, setVideoStatus] = useState(VideoStatus.Disabled);
  const intl = useIntl();

  useEffect(() => {
    const callback = (localMuted: boolean) => {
      setMuted(localMuted);
    };
    chime?.audioVideo?.realtimeSubscribeToMuteAndUnmuteLocalAudio(callback);
    return () => {
      if (chime && chime?.audioVideo) {
        chime?.audioVideo?.realtimeUnsubscribeToMuteAndUnmuteLocalAudio(
          callback
        );
      }
    };
  }, []);

  const handleRecording = async() => {
    setRecording(!recording);
    if(recording){   
      try{
        const result = await stopRecording(mediaPipelineId);
        console.log(result);
      }catch(err){
        console.error(err);
      } 
    }else{
      try{
        const result = await startRecording(chime?.meetingId);
        console.log(result);
        setMediaPipelineId(result.MediaPipelineId);
      }catch(err){
        console.error(err);
      }
    }
  }

  return (
    <div
      className={cx('Controls_controls', {
        Controls_roomMode: viewMode === ViewMode.Room,
        Controls_screenShareMode: viewMode === ViewMode.ScreenShare,
        Controls_videoEnabled: videoStatus === VideoStatus.Enabled,
        Controls_audioMuted: muted
      })}
    >
      <div className={cx('Controls_micMuted')}>
        <FormattedMessage id="Controls.micMutedInScreenViewMode" />
      </div>
      {state.classMode === ClassMode.Teacher && viewMode === ViewMode.Room && (
        <Tooltip
          tooltip={
            focus
              ? intl.formatMessage({ id: 'Controls.turnOffFocusTooltip' })
              : intl.formatMessage({ id: 'Controls.turnOnFocusTooltip' })
          }
        >
          <button
            type="button"
            className={cx('Controls_focusButton', {
              Controls_enabled: focus
            })}
            onClick={() => {
              const newFocusState = !focus;
              chime?.sendMessage(MessageTopic.Focus, { focus: newFocusState });
              const msgObject = {
                sendingMessage: newFocusState
                ? intl.formatMessage({ id: 'Controls.focusOnMessage' })
                : intl.formatMessage({ id: 'Controls.focusOffMessage' }),
                channel: MessageTopic.PublicChannel
              }
              chime?.sendMessage(
                MessageTopic.GroupChat,
                JSON.stringify(msgObject)
              );
              setFocus(newFocusState);
            }}
          >
            {focus ? (
              <i className="fas fa-street-view" />
            ) : (
              <i className="fas fa-street-view" />
            )}
          </button>
        </Tooltip>
      )}
      <Tooltip
        tooltip={
          muted
            ? intl.formatMessage({ id: 'Controls.unmuteTooltip' })
            : intl.formatMessage({ id: 'Controls.muteTooltip' })
        }
      >
        <button
          type="button"
          className={cx('Controls_muteButton', {
            Controls_enabled: !muted
          })}
          onClick={async () => {
            if (muted) {
              chime?.audioVideo?.realtimeUnmuteLocalAudio();
            } else {
              chime?.audioVideo?.realtimeMuteLocalAudio();
            }
            // Adds a slight delay to close the tooltip before rendering the updated text in it
            await new Promise(resolve => setTimeout(resolve, 10));
          }}
        >
          {muted ? (
            <i className="fas fa-microphone-slash" />
          ) : (
            <i className="fas fa-microphone" />
          )}
        </button>
      </Tooltip>
      <Tooltip
        tooltip={
          videoStatus === VideoStatus.Disabled
            ? intl.formatMessage({ id: 'Controls.turnOnVideoTooltip' })
            : intl.formatMessage({ id: 'Controls.turnOffVideoTooltip' })
        }
      >
        <button
          type="button"
          className={cx('Controls_videoButton', {
            Controls_enabled: videoStatus === VideoStatus.Enabled
          })}
          onClick={async () => {
            // Adds a slight delay to close the tooltip before rendering the updated text in it
            await new Promise(resolve => setTimeout(resolve, 10));
            if (videoStatus === VideoStatus.Disabled) {
              setVideoStatus(VideoStatus.Loading);
              try {
                if (!chime?.currentVideoInputDevice) {
                  throw new Error('currentVideoInputDevice does not exist');
                }
                await chime?.chooseVideoInputDevice(
                  chime?.currentVideoInputDevice
                );
                chime?.audioVideo?.startLocalVideoTile();
                setVideoStatus(VideoStatus.Enabled);
              } catch (error) {
                // eslint-disable-next-line
                console.error(error);
                setVideoStatus(VideoStatus.Disabled);
              }
            } else if (videoStatus === VideoStatus.Enabled) {
              setVideoStatus(VideoStatus.Loading);
              chime?.audioVideo?.stopLocalVideoTile();
              setVideoStatus(VideoStatus.Disabled);
            }
          }}
        >
          {videoStatus === VideoStatus.Enabled ? (
            <i className="fas fa-video" />
          ) : (
            <i className="fas fa-video-slash" />
          )}
        </button>
      </Tooltip>
      {viewMode !== ViewMode.ScreenShare && (
          <Tooltip
            tooltip={intl.formatMessage({ id: 'Controls.shareScreenTooltip' })}
          >
            <button
              type="button"
              className={cx('Controls_shareButton')}
              onClick={() => {
                onClickShareButton();
              }}
            >
              <i className="fas fa-desktop" />
            </button>
          </Tooltip>
        )}
        {  state.classMode === ClassMode.Teacher && (
          <Tooltip
            tooltip={recording ? intl.formatMessage({ id: 'Controls.stopRecordingScreenTooltip' }) : intl.formatMessage({ id: 'Controls.startRecordingScreenTooltip' })}
          >
            <button
              type="button"
              className={cx('Controls_recordButton',{
                Controls_recordRedButton : recording
              })}
              onClick={() => {
                handleRecording();
              }}
            >
              <i className="fas fa-record-vinyl"></i>
            </button>
          </Tooltip>
        )}
      {viewMode !== ViewMode.ScreenShare && (
        <Tooltip
          tooltip={
            state.classMode === ClassMode.Teacher
              ? intl.formatMessage({ id: 'Controls.endClassroomTooltip' })
              : intl.formatMessage({ id: 'Controls.leaveClassroomTooltip' })
          }
        >
          <button
            type="button"
            className={cx('Controls_endButton')}
            onClick={() => {
              chime?.leaveRoom(state.classMode === ClassMode.Teacher);
              history.push(routes.HOME);
            }}
          >
            <i className="fas fa-times" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
