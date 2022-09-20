// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import classNames from 'classnames/bind';
import React, { useContext, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import getChimeContext from '../context/getChimeContext';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import useFocusMode from '../hooks/useFocusMode';
import useMuteUnmuteAttendee from '../hooks/useMuteUnmuteAttendee';
import useRemoteAttendeeRemove from '../hooks/useRemoteAttendeeRemove';
import styles from './ChatInput.css';
import MessageTopic from '../enums/MessageTopic';

const cx = classNames.bind(styles);

let timeoutId: number;

type Props = {
  activeChannel: string;
};

export default React.memo(function ChatInput(props: Props) {
  const { activeChannel } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [state] = useContext(getUIStateContext());
  const [inputText, setInputText] = useState('');
  const [raised, setRaised] = useState(false);
  const focusMode = useFocusMode();
  const remoteMuteUnmute = useMuteUnmuteAttendee();
  const remoteAttendeeRemove = useRemoteAttendeeRemove();
  const intl = useIntl();

  useEffect(() => {
    const attendeeId = chime?.configuration?.credentials?.attendeeId;
    if (!attendeeId) {
      return;
    }

    chime?.sendMessage(
      raised ? MessageTopic.RaiseHand : MessageTopic.DismissHand,
      attendeeId
    );

    if (raised) {
      timeoutId = window.setTimeout(() => {
        chime?.sendMessage(MessageTopic.DismissHand, attendeeId);
        setRaised(false);
      }, 10000);
    } else {
      clearTimeout(timeoutId);
    }
  }, [raised, chime?.configuration]);

  useEffect(() => {
    console.log(remoteMuteUnmute, remoteAttendeeRemove);
  },[])

  return (
    <div className={cx('chatInput')}>
      <form
        onSubmit={event => {
          event.preventDefault();
        }}
        className={cx('form')}
      >
        <input
          className={cx('input')}
          value={inputText}
          onChange={event => {
            setInputText(event.target.value);
          }}
          onKeyUp={event => {
            event.preventDefault();
            if (focusMode && state.classMode === ClassMode.Student) {
              return;
            }
            if (event.keyCode === 13) {
              const sendingMessage = inputText.trim();
              const msgObject = {
                sendingMessage,
                channel: activeChannel
              }
              const attendeeId = chime?.configuration?.credentials?.attendeeId;
              if (sendingMessage !== '' && attendeeId) {
                chime?.sendMessage(MessageTopic.GroupChat, JSON.stringify(msgObject));
                setInputText('');
              }
            }
          }}
          placeholder={intl.formatMessage({ id: 'ChatInput.inputPlaceholder' })}
        />
        {state.classMode === ClassMode.Student && (
          <button
            type="button"
            className={cx('raiseHandButton', {
              raised
            })}
            onClick={() => {
              setRaised(!raised);
            }}
          >
            <span
              role="img"
              aria-label={intl.formatMessage({
                id: 'ChatInput.raiseHandAriaLabel'
              })}
            >
              ✋
            </span>
          </button>
        )}
      </form>
    </div>
  );
});
