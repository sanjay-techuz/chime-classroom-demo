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
import routes from "../constants/routes.json";

const cx = classNames.bind(styles);

export default function Main() {
  const query = new URLSearchParams(useLocation().search);
  const [, dispatch] = useContext(getUIStateContext());
  const history = useHistory();
  // const title = query.get('title') || "";
  // const name = query.get('name') || "";
  // const region = query.get('region') || "us-east-1";
  // const optionalFeature = query.get('optionalFeature') || "";
  // const classMode = query.get('classMode') || null;

  const meetingName = query.get("meeting_name") || "";
  const meetingID = query.get("meetingID") || "";
  const id = query.get("id") || "";
  const batchId = query.get("batch_id") || "";
  const userName = query.get("user_name") || "";
  const mode = query.get("mode") || "";
  const userID = query.get("user_id") || "";

  useEffect(() => {
    // localStorage.clear();
    // dispatch({
    //   type: "SET_CLASS_MODE",
    //   payload: {
    //     classMode: null,
    //   },
    // });
    console.log(meetingID, userName, mode);
    if (!meetingID || !userName || !mode) {
      history.push(routes.CREATE_OR_JOIN);
    } else {
      if (mode) {
        dispatch({
          type: "SET_CLASS_MODE",
          payload: {
            classMode: mode === "mp" ? ClassMode.Teacher : ClassMode.Student,
          },
        });
      }
      let url = "/classroom?"
      if(meetingID){
        url = url + `&meetingID=${encodeURIComponent(meetingID)}`;
      }
      if(userName){
        url = url + `&userName=${encodeURIComponent(userName)}`;
      }
      if(mode){
        url = url + `&mode=${encodeURIComponent(mode)}`;
      }
      if(id){
        url = url + `&id=${encodeURIComponent(id)}`;
      }
      if(userID){
        url = url + `&userID=${encodeURIComponent(userID)}`;
      }
      if(batchId){
        url = url + `&batchId=${encodeURIComponent(batchId)}`;
      }
      if(meetingName){
        url = url + `&meetingName=${encodeURIComponent(meetingName)}`;
      }
      console.log("🏁🏁🏁🏁🏁",url);
      history.push(url);
      // if (mode === "mp") {
      //   history.push(
      //     `/classroom?meetingName=${encodeURIComponent(meetingName)}&meetingID=${encodeURIComponent(meetingID)}&userName=${encodeURIComponent(userName)}&mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(id)}&batchId=${encodeURIComponent(batchId)}`
      //   );
      // } else {
      //   history.push(
      //     `/classroom?meetingID=${encodeURIComponent(meetingID)}&userName=${encodeURIComponent(userName)}&mode=${encodeURIComponent(mode)}&userID=${encodeURIComponent(userID)}&batchId=${encodeURIComponent(batchId)}`
      //   );
      // }

      // history.push(`/classroom?title=${encodeURIComponent(title)}&name=${encodeURIComponent(name)}&region=${encodeURIComponent(region)}&optionalFeature=${optionalFeature}`);
    }
  }, []);

  return (
    <div className={cx("Main_main")}>
      <LoadingSpinner></LoadingSpinner>
    </div>
  );
}
