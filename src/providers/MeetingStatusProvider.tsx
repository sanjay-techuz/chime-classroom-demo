/* eslint-disable  */

import {
  MeetingSessionStatus,
  MeetingSessionStatusCode,
} from "amazon-chime-sdk-js";
import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getMeetingStatusContext from "../context/getMeetingStatusContext";
import MeetingStatus from "../enums/MeetingStatus";
import common from "../constants/common.json";
import routes from "../constants/routes.json";
import { attendanceWenhook } from "../services";

type Props = {
  children: ReactNode;
};

export default function MeetingStatusProvider(props: Props) {
  const MeetingStatusContext = getMeetingStatusContext();
  const { children } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const [meetingStatus, setMeetingStatus] = useState<{
    meetingStatus: MeetingStatus;
    errorMessage?: string;
  }>({
    meetingStatus: MeetingStatus.Loading,
  });
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const location = useLocation();
  const locationState = location?.state || null;
  const audioElement = useRef(null);


  useEffect(() => {
    console.log("🏖️🏖️🏖️🏖️", locationState);
    if (locationState) {
      const {
        meetingName,
        meetingID,
        id,
        batchId,
        userName,
        mode,
        userID,
        duration,
        isRecording
      }: any = locationState;
      console.log(
        "🙋🙋🙋🙋",
        meetingName,
        meetingID,
        id,
        batchId,
        userName,
        mode,
        userID,
        duration,
        isRecording
      );
      const start = async () => {
        try {
          await chime?.createRoom(
            meetingName,
            meetingID,
            id,
            batchId,
            userName,
            userID,
            duration,
            isRecording,
            mode === "mp" ? "teacher" : "student",
            query.get("optionalFeature")
          );

          setMeetingStatus({
            meetingStatus: MeetingStatus.Succeeded,
          });

          chime?.audioVideo?.addObserver({
            audioVideoDidStop: async (
              sessionStatus: MeetingSessionStatus
            ): Promise<void> => {
              if (
                sessionStatus.statusCode() ===
                MeetingSessionStatusCode.AudioCallEnded
              ) {
                // navigate('/');
                if (mode === "mp") {
                  chime?.leaveRoom(true);
                  navigate(`${routes.MAIN}?id=${id}`);
                  // window.location.href = `${common.domain}complete?id=${id}`;
                } else {
                  const webhookRes = {
                    meetingId: meetingID,
                    internal_meeting_id: chime?.meetingId || "",
                    user_id: userID,
                    batch_id: batchId,
                    isJoin: false,
                  };

                  console.log("🏣🏣🏣🏣", webhookRes);
                  await attendanceWenhook(webhookRes);

                  chime?.leaveRoom(false);
                  navigate(routes.MAIN);
                  // window.location.href = `${common.domain}complete`;
                }
              }
            },
          });

          await chime?.joinRoom(audioElement.current);
        } catch (error: any) {
          // eslint-disable-next-line
          console.error(error);
          setMeetingStatus({
            meetingStatus: MeetingStatus.Failed,
            errorMessage: error.message,
          });
        }
      };
      start();
    } else {
      window.location.href = `${common.domain}complete`;
    }
  }, []);

  return (
    <MeetingStatusContext.Provider value={meetingStatus}>
      {/* eslint-disable-next-line */}
      <audio id="audioElement" ref={audioElement} style={{ display: "none" }} />
      {children}
    </MeetingStatusContext.Provider>
  );
}
