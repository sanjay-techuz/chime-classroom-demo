// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React from "react";

import styles from "./LoadingSpinner.css";

const cx = classNames.bind(styles);

export default function LoadingSpinner() {
  return (
    <div className={cx("LoadingSpinner_loadingSpinner")}>
      <div className={cx("LoadingSpinner_spinner")}>
        {Array.from(Array(12).keys()).map((key) => (
          <div
            key={key}
            className={cx(
              "LoadingSpinner_circle",
              `LoadingSpinner_circle${key + 1}`
            )}
          />
        ))}
      </div>
    </div>
  );
}
