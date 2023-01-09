import React from 'react';

const context = React.createContext<{
    globalVar?: any;
    updateGlobalVar?: any;
}>({});

export default function getGlobalVarContext() {
  return context;
}
