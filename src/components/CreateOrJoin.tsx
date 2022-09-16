// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import classNames from 'classnames/bind';
import React, { useContext, useEffect, useState } from 'react';
import Dropdown, { Option } from 'react-dropdown';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';
import routes from '../constants/routes.json';
import getChimeContext from '../context/getChimeContext';
import getUIStateContext from '../context/getUIStateContext';
import ClassMode from '../enums/ClassMode';
import RegionType from '../types/RegionType';
import styles from './CreateOrJoin.css';
import OptionalFeature from '../enums/OptionalFeature';

const cx = classNames.bind(styles);

const optionalFeatures = [
  { label: 'None', value: OptionalFeature.None },
  { label: 'Enable Simulcast For Chrome', value: OptionalFeature.Simulcast }
];

export default function CreateOrJoin() {
  const chime = useContext(getChimeContext()) as ChimeSdkWrapper;
  const [state] = useContext(getUIStateContext());
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState<RegionType | undefined>(undefined);
  const [optionalFeature, setOptionalFeature] = useState('');
  const history = useHistory();
  const intl = useIntl();

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
        <Link className={cx('CreateOrJoin_loginLink')} to={routes.LOGIN}>
          {state.classMode === ClassMode.Teacher ? (
            <FormattedMessage id="CreateOrJoin.notTeacherLink" />
          ) : (
            <FormattedMessage id="CreateOrJoin.notStudentLink" />
          )}
        </Link>
      </div>
    </div>
  );
}
