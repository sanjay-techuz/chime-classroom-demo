// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { ReactNode, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useIntl } from 'react-intl';

import routes from "../../constants/routes.json";
import localStorageKeys from "../../constants/localStorageKeys.json";
import styles from "./Error.css";
import getUIStateContext from "../../context/getUIStateContext";
import ClassMode from "../../enums/ClassMode";

const cx = classNames.bind(styles);

type Props = {
  errorMessage: ReactNode;
};

export default function Error(props: Props) {
  const { errorMessage } = props;
  const intl = useIntl();
  const [state] = useContext(getUIStateContext());
  const localtion = useLocation();
  const { id }: any = localtion.state;

  useEffect(() => {
    localStorage.removeItem(localStorageKeys.INVITED_URL);
  }, []);

  return (
    <div className={cx("Error_error")}>
      <div className={cx("Error_errorMessage")}>
        {errorMessage || "Something went wrong"}
      </div>
      <Link className={cx("Error_goHomeLink")} to={state.classMode === ClassMode.Teacher ? `${routes.MAIN}?id=${id}` : routes.MAIN}>
        {intl.formatMessage({ id: "Error.takeMeHome"})}
      </Link>
    </div>
  );
}
