// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */ 

import React, { ReactNode, useState } from 'react';
import getGlobalVarContext from '../context/getGlobalVarContext';
import ClassMode from '../enums/ClassMode';

type Props = {
  children: ReactNode;
};

export default function GlobalVarProvider(props: Props) {
  
  const { children } = props;
  const GlobalVarContext = getGlobalVarContext();
  const [globalVar, setGlobalVar] = useState({
      localVideo:false,
      activeSpeakerAttendeeId:"",
      isChatOpen:false,
      groupChatCounter:0,
      isMobileView: false,
      userInfo: {},
      classMode: ClassMode.Student,
      screenSharePermit: false,
  });

  const updateGlobalVar = (key: string,value: any) => {
    switch (key){
        case("localVideo"):
          setGlobalVar((oldData) => ({ ...oldData, localVideo: value }));
          break;
        case("activeSpeakerAttendeeId"):
          setGlobalVar((oldData) => ({ ...oldData, activeSpeakerAttendeeId: value }))
          break;
        case("isChatOpen"):
          setGlobalVar((oldData) => ({ ...oldData, isChatOpen: value }))
          break;
        case("groupChatCounter"):
          setGlobalVar((oldData) => ({ ...oldData, groupChatCounter: value }))
          break;
        case("isMobileView"):
          setGlobalVar((oldData) => ({ ...oldData, isMobileView: value }))
          break;
        case("userInfo"):
          setGlobalVar((oldData) => ({ ...oldData, userInfo: value }))
          break;
        case("classMode"):
          setGlobalVar((oldData) => ({ ...oldData, classMode: value }))
          break;
        case("screenSharePermit"):
          setGlobalVar((oldData) => ({ ...oldData, screenSharePermit: value }))
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
