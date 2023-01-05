// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

// import React, { Fragment } from 'react';
// import { render } from 'react-dom';
// import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';


// const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

// document.addEventListener('DOMContentLoaded', () =>
//   render(
//     <AppContainer>
//       <Root />
//     </AppContainer>,
//     document.getElementById('root')
//   )
// );

import React from 'react';
import { createRoot } from 'react-dom/client';
import './app.global.css';
import Root from './components/Root';
const container = document.getElementById('root');
const root = createRoot(container!); 
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
