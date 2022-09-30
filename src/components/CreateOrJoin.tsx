// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import classNames from 'classnames/bind';
import React, { useContext, useEffect, useState } from 'react';
import Dropdown, { Option } from 'react-dropdown';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import routes from '../constants/routes.json';
import getChimeContext from '../context/getChimeContext';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import RegionType from '../types/RegionType';
import styles from './CreateOrJoin.css';
import OptionalFeature from '../enums/OptionalFeature';
import localStorageKeys from '../constants/localStorageKeys.json';

const cx = classNames.bind(styles);

const optionalFeatures = [
  { label: 'None', value: OptionalFeature.None },
  { label: 'Enable Simulcast For Chrome', value: OptionalFeature.Simulcast }
];

export default function CreateOrJoin() {
  const chime = useContext(getChimeContext()) as ChimeSdkWrapper;
  const [state] = useContext(getUIStateContext());
  const [title, setTitle] = useState(state.classMode === ClassMode.Teacher ? uuidv4().substring(0,8) : '');
  const [name, setName] = useState('');
  const [region, setRegion] = useState<RegionType | undefined>(undefined);
  const [optionalFeature, setOptionalFeature] = useState('');
  const history = useHistory();
  const intl = useIntl();
  const invitedUrl = localStorage.getItem(localStorageKeys.INVITED_URL);

  useEffect(() => {
    if(invitedUrl){
      let isRecordingUrl = invitedUrl.split("&")[1] == "record=true" ? true : false;
      const url = new URL(invitedUrl);
      const urlParams = new URLSearchParams(url.search);
      const meetingParam = urlParams.get('meetingId');
      if (meetingParam && !isRecordingUrl) {
        setTitle(meetingParam);
      }
      if (meetingParam && isRecordingUrl) {
        history.push(`/classroom?title=${encodeURIComponent(meetingParam)}&name=Unknown&region=us-east-1`);
      }


      if(meetingParam){
      }
    }

  },[])

  useEffect(() => {
    setOptionalFeature(optionalFeatures[0].value);
    (async () => {
      setRegion(await chime?.lookupClosestChimeRegion());
    })();
  }, []);

  return (
    <div className={cx('CreateOrJoin_createOrJoin')}>
      <div className={cx('CreateOrJoin_formWrapper')}>
        <h1 className={cx('CreateOrJoin_title')}>
          {state.classMode === ClassMode.Teacher ? (
            <FormattedMessage id="CreateOrJoin.teacherTitle" />
          ) : (
            <FormattedMessage id="CreateOrJoin.studentTitle" />
          )}
        </h1>
        <form
          className={cx('CreateOrJoin_form')}
          onSubmit={event => {
            event.preventDefault();
            if (title && name && region) {
              history.push(
                `/classroom?title=${encodeURIComponent(
                  title
                )}&name=${encodeURIComponent(name)}&region=${
                  region.value
                }&optionalFeature=${optionalFeature}`
              );
            }
          }}
        >
          <input
            value={title}
            className={cx('CreateOrJoin_titleInput')}
            onChange={event => {
              setTitle(event.target.value);
            }}
            placeholder={intl.formatMessage({
              id: 'CreateOrJoin.titlePlaceholder'
            })}
          />
          <input
            className={cx('CreateOrJoin_nameInput')}
            onChange={event => {
              setName(event.target.value);
            }}
            placeholder={intl.formatMessage({
              id: 'CreateOrJoin.namePlaceholder'
            })}
          />
          {state.classMode === ClassMode.Teacher && (
            <div className={cx('CreateOrJoin_regionsList')}>
              <Dropdown
                className={cx('CreateOrJoin_dropdown')}
                controlClassName={cx('CreateOrJoin_control')}
                placeholderClassName={cx('CreateOrJoin_placeholder')}
                menuClassName={cx('CreateOrJoin_menu')}
                arrowClassName={cx('CreateOrJoin_arrow')}
                value={region}
                options={
                  region ? chime?.supportedChimeRegions : ([] as RegionType[])
                }
                disabled={!region}
                onChange={(selectedRegion: RegionType) => {
                  setRegion(selectedRegion);
                }}
                placeholder=""
              />
            </div>
          )}

          <div className={cx('CreateOrJoin_regionsList')}>
            <Dropdown
              className={cx('CreateOrJoin_dropdown')}
              controlClassName={cx('CreateOrJoin_control')}
              placeholderClassName={cx('CreateOrJoin_placeholder')}
              menuClassName={cx('CreateOrJoin_menu')}
              arrowClassName={cx('CreateOrJoin_arrow')}
              value={optionalFeature}
              options={optionalFeatures}
              onChange={(selectedFeature: Option) => {
                setOptionalFeature(selectedFeature.value);
              }}
              placeholder={optionalFeatures[0].label}
            />
          </div>

          <button className={cx('CreateOrJoin_button')} type="submit">
            <FormattedMessage id="CreateOrJoin.continueButton" />
          </button>
        </form>
        <Link className={cx('CreateOrJoin_mainLink')} to={routes.MAIN}>
          {<FormattedMessage id="CreateOrJoin.back" />}
        </Link>
      </div>
    </div>
  );
}
