// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import classNames from 'classnames/bind';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import useRoster from '../hooks/useRoster';
import styles from './ScreenShareHeader.css';

const cx = classNames.bind(styles);

type Props = {
  onClickStopButton: () => void;
};

export default function ScreenShareHeader(props: Props) {
  const roster = useRoster();
  const { onClickStopButton } = props;
  return (
    <div className={cx('ScreenShareHeader_screenShareHeader')}>
      <button
        className={cx('ScreenShareHeader_stopButton')}
        type="button"
        onClick={onClickStopButton}
      >
        <FormattedMessage id="ScreenShareHeader.stopSharing" />
      </button>
      <div className={cx('ScreenShareHeader_description')}>
        {roster ? (
          <FormattedMessage
            id="ScreenShareHeader.online"
            values={{
              number: Object.keys(roster).length - 1
            }}
          />
        ) : (
          ` `
        )}
      </div>
    </div>
  );
}
