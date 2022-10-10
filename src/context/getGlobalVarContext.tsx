// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

const context = React.createContext<{
    globalVar?: any;
    updateGlobalVar?: any;
}>({});

export default function getGlobalVarContext() {
  return context;
}
