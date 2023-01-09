import React from 'react';

import ChimeSdkWrapper from '../chime/ChimeSdkWrapper';

const context = React.createContext<ChimeSdkWrapper | null>(null);

export default function getChimeContext() {
  return context;
}
