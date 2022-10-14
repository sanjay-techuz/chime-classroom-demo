// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactNode, useContext } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import App from './components/App';
import Classroom from './components/Classroom';
import CreateOrJoin from './components/CreateOrJoin';
// import Home from './components/Home';
import Main from './components/Main';
import ThankyouPage from './components/ThankyouPage';
import routes from './constants/routes.json';
import getUIStateContext from './context/getUIStateContext';
import GlobalVarProvider from './providers/GlobalVarProvider';
import MeetingStatusProvider from './providers/MeetingStatusProvider';

export default function Routes() {
  const [state] = useContext(getUIStateContext());

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

  return (
    <App>
      <Switch>
        <PrivateRoute path={routes.CLASSROOM}>
          <GlobalVarProvider>
          <MeetingStatusProvider>
            <Classroom />
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
