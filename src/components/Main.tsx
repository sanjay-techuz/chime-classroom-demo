// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

import getUIStateContext from "../context/getUIStateContext";
import ClassMode from "../enums/ClassMode";
import LoadingSpinner from "./LoadingSpinner";
import styles from "./Main.css";
import routes from '../constants/routes.json';

const cx = classNames.bind(styles);

export default function Main() {
  const query = new URLSearchParams(useLocation().search);
  const [, dispatch] = useContext(getUIStateContext());
  const history = useHistory();
  const title = query.get('title') || "";
  const name = query.get('name') || "";
  const region = query.get('region') || "us-east-1";
  const optionalFeature = query.get('optionalFeature') || "";
  const classMode = query.get('classMode') || null;

  useEffect(() => {
    // localStorage.clear();
    // dispatch({
    //   type: "SET_CLASS_MODE",
    //   payload: {
    //     classMode: null,
    //   },
    // });
    console.log(title,name,classMode)
    if(!title || !name || !classMode){
      history.push(routes.CREATE_OR_JOIN)
    }else{
      if(classMode){
        dispatch({
          type: "SET_CLASS_MODE",
          payload: {
            classMode: classMode === "teacher" ? ClassMode.Teacher : ClassMode.Student,
          },
        });
      }
      history.push(`/classroom?title=${encodeURIComponent(title)}&name=${encodeURIComponent(name)}&region=${encodeURIComponent(region)}&optionalFeature=${optionalFeature}`);
    }
  }, []);

  return (
    <div className={cx("Main_main")}>
      <LoadingSpinner></LoadingSpinner>
    </div>
  );
}
