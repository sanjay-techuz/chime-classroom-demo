// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import React from "react";
import { hot } from "react-hot-loader/root";
import { BrowserRouter } from "react-router-dom";

import ChimeProvider from "../providers/ChimeProvider";
import I18nProvider from "../providers/I18nProvider";
import { NotificationProvider } from "../providers/NotificationProvider";
import UIStateProvider from "../providers/UIStateProvider";
import Routes from "../Routes";
import NotificationGroup from "./NotificationGroup";

const Root = () => (
  <BrowserRouter>
    <NotificationProvider>
      <I18nProvider>
        <ChimeProvider>
          <UIStateProvider>
            <Routes />
            <NotificationGroup />
          </UIStateProvider>
        </ChimeProvider>
      </I18nProvider>
    </NotificationProvider>
  </BrowserRouter>
);

export default hot(Root);
