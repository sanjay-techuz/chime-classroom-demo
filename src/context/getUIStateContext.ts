import React, { Dispatch } from 'react';

import localStorageKeys from '../constants/localStorageKeys.json';
import ClassMode from '../enums/ClassMode';

export interface StateType {
  classMode: ClassMode | null;
}

export interface Action {
  type: string;
}

export interface SetClassModeActon extends Action {
  payload: {
    classMode: ClassMode | null;
  };
}

let classMode: ClassMode =
  localStorage.getItem(localStorageKeys.CLASS_MODE) === 'Teacher'
    ? ClassMode.Teacher
    : ClassMode.Student;
if (!classMode) {
  localStorage.setItem(localStorageKeys.CLASS_MODE, ClassMode.Student);
  classMode = ClassMode.Student;
}

export const initialState: StateType = {
  classMode
};

const context = React.createContext<[StateType, Dispatch<SetClassModeActon>]>([
  initialState,
  (): void => {}
]);

export default function getUIStateContext() {
  return context;
}
