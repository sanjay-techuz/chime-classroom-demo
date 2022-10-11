// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import React, { ReactNode, useState, useReducer,useEffect } from 'react';
import getGlobalVarContext from '../context/getGlobalVarContext';

type Props = {
  children: ReactNode;
};

export default function GlobalVarProvider(props: Props) {
  
  const { children } = props;
  const GlobalVarContext = getGlobalVarContext();
  const [globalVar, setGlobalVar] = useState({
      localVideo:false,
      activeSpeakerAttendeeId:"",
  });

  const updateGlobalVar = (key,value) => {
    switch (key){
        case("localVideo"):
          setGlobalVar((oldData) => ({ ...oldData, localVideo: value }));
          break;
        case("activeSpeakerAttendeeId"):
          setGlobalVar((oldData) => ({ ...oldData, activeSpeakerAttendeeId: value }))
          break;
        default:
          break;
    }
  }

    return (
    <GlobalVarContext.Provider value={{ globalVar, updateGlobalVar }}>
    	{children}
    </GlobalVarContext.Provider>
  );

}
