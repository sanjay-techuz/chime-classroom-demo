// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import classNames from 'classnames/bind';
import React, { ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';

import routes from '../constants/routes.json';
import styles from './Error.css';

const cx = classNames.bind(styles);

type Props = {
  errorMessage: ReactNode;
};

export default function Error(props: Props) {
  const { errorMessage } = props;
  useEffect(()=>{
    localStorage.removeItem("invited_url")
    console.log("🌅🌅🌅",errorMessage)
  },[])
  return (
    <div className={cx('Error_error')}>
      <div className={cx('Error_errorMessage')}>
        {errorMessage || 'Something went wrong'}
      </div>
      <Link className={cx('Error_goHomeLink')} to={routes.HOME}>
        Take me home
      </Link>
    </div>
  );
}
