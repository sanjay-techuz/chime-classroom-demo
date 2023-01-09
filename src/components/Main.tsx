// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import getUIStateContext from "../context/getUIStateContext";
import ClassMode from "../enums/ClassMode";
import LoadingSpinner from "./LoadingSpinner";
import styles from "./Main.css";
import routes from "../constants/routes.json";

const cx = classNames.bind(styles);

export default function Main() {
  const query = new URLSearchParams(useLocation().search);
  const [, dispatch] = useContext(getUIStateContext());
  const navigate = useNavigate();
  const meetingName = query.get("meeting_name") || "";
  const meetingID = query.get("meetingID") || "";
  const id = query.get("id") || "";
  const batchId = query.get("batch_id") || "";
  const userName = query.get("user_name") || "";
  const mode = query.get("mode") || "";
  const userID = query.get("user_id") || "";
  const duration = query.get("duration") || "";
  const isRecording = query.get("is_recording") || "";

  useEffect(() => {
    console.log(meetingID, userName, mode);
    const mTitle = document.getElementById("title");
    if(mTitle) mTitle.innerHTML = `Tutorac - ${meetingName || meetingID}`;
    
    if (!userName || !mode) {
      navigate(`${routes.CREATE_OR_JOIN}`);
    } else {
      if (mode) {
        dispatch({
          type: "SET_CLASS_MODE",
          payload: {
            classMode: mode === "mp" ? ClassMode.Teacher : ClassMode.Student,
          },
        });
      }
      const histroyObject = {
        state: {
          meetingID: meetingID,
          userName: userName,
          mode: mode,
          id: id,
          userID: userID,
          batchId: batchId,
          meetingName: meetingName,
          duration: duration,
          isRecording: isRecording
        },
      }

      console.log("🏁🏁🏁🏁🏁",histroyObject);
      navigate(`/classroom?meetingID=${meetingID}`,histroyObject);
    }
  }, []);

  return (
    <div className={cx("Main_main")}>
      <LoadingSpinner></LoadingSpinner>
    </div>
  );
}
