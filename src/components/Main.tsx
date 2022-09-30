// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import classNames from 'classnames/bind';
import React, { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import localStorageKeys from '../constants/localStorageKeys.json';
import routes from '../constants/routes.json';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import styles from './Main.css';

const cx = classNames.bind(styles);

export default function Main() {
  const [, dispatch] = useContext(getUIStateContext());
  const history = useHistory();

  useEffect(() => {
    localStorage.clear();
    dispatch({
      type: 'SET_CLASS_MODE',
      payload: {
        classMode: null
      }
    });
  }, []);

  return (
    <div className={cx('Main_main')}>
      <div className={cx('Main_content')}>
        <h1 className={cx('Main_title')}>
          <FormattedMessage id="Main.title" />
        </h1>
        <div className={cx('Main_selection')}>
          <div className={cx('Main_teacher')}>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(
                  localStorageKeys.CLASS_MODE,
                  ClassMode.Teacher
                );
                dispatch({
                  type: 'SET_CLASS_MODE',
                  payload: {
                    classMode: ClassMode.Teacher
                  }
                });
                history.push(routes.CREATE_OR_JOIN);
              }}
            >
              <FormattedMessage id="Main.createButton" />
            </button>
          </div>
          <div className={cx('Main_student')}>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(
                  localStorageKeys.CLASS_MODE,
                  ClassMode.Student
                );
                dispatch({
                  type: 'SET_CLASS_MODE',
                  payload: {
                    classMode: ClassMode.Student
                  }
                });
                history.push(routes.CREATE_OR_JOIN);
              }}
            >
              <FormattedMessage id="Main.joinButton" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
