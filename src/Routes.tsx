// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import App from './components/App';
import Classroom from './components/web/Classroom';
import CreateOrJoin from './components/CreateOrJoin';
import Main from './components/Main';
import ThankyouPage from './components/ThankyouPage';
import routes from './constants/routes.json';
import getUIStateContext from './context/getUIStateContext';
import GlobalVarProvider from './providers/GlobalVarProvider';
import MeetingStatusProvider from './providers/MeetingStatusProvider';
import MobileClassroom from './components/mobile/Classroom';

var resizeTo = 0;
export default function Routes() {
  const [state] = useContext(getUIStateContext());
  const [ isMobileView, setIsMobileView ] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 1000) {
      setIsMobileView(true);
    } else {
      setIsMobileView(false);
    }
  },[]);

  const updateMobileView = () => {
    if (window.innerWidth < 1000) {
      setIsMobileView(true);
    } else {
      setIsMobileView(false);
    }
  };

  window.addEventListener("resize", () => {
    if (resizeTo) clearTimeout(resizeTo);
    resizeTo = window.setTimeout(() => updateMobileView(), 500);
  });

  const PrivateRoute = ({
    children,
    path
  }: {
    children: ReactNode;
    path: string;
  }) => {
    return (
      <Route path={path}>
        {state.classMode ? children : <Redirect to={routes.HOME} />}
      </Route>
    );
  };

  useEffect(() => {
    console.log("isMobileView====>",isMobileView);
  },[isMobileView]);

  return (
    <App>
      <Switch>
        <PrivateRoute path={routes.CLASSROOM}>
          <GlobalVarProvider>
          <MeetingStatusProvider>
            {isMobileView ? <MobileClassroom /> : <Classroom /> }            
          </MeetingStatusProvider>
          </GlobalVarProvider>
        </PrivateRoute>
        <Route path={routes.CREATE_OR_JOIN}>
          <CreateOrJoin />
        </Route>
        <Route path={routes.MAIN}>
          <ThankyouPage />
        </Route>
        <Route path={routes.HOME}>
          <Main />
        </Route>
      </Switch>
    </App>
  );
}
