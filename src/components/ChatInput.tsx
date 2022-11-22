// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable  */

import classNames from "classnames/bind";
import React, { useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import ChimeSdkWrapper from "../chime/ChimeSdkWrapper";
import getChimeContext from "../context/getChimeContext";
import getGlobalVarContext from "../context/getGlobalVarContext";
// import getUIStateContext from "../context/getUIStateContext";
import ClassMode from "../enums/ClassMode";
// import useFocusMode from "../hooks/useFocusMode";
import styles from "./ChatInput.css";
import MessageTopic from "../enums/MessageTopic";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { IconButton } from "@mui/material";
import AWS from "aws-sdk";
import SendIcon from "@mui/icons-material/Send";

const S3_BUCKET = "chime-message-attachments";

AWS.config.update({
  accessKeyId: "AKIAUMB57EQBTHOTTM45",
  secretAccessKey: "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",
});

const cx = classNames.bind(styles);

let timeoutId: number;

type Props = {
  activeChannel: string;
  activeChatAttendee?: string;
};

export default React.memo(function ChatInput(props: Props) {
  const { activeChannel, activeChatAttendee } = props;
  const chime: ChimeSdkWrapper | null = useContext(getChimeContext());
  const { globalVar } = useContext(getGlobalVarContext());
  const { classMode } = globalVar;
  // const [state] = useContext(getUIStateContext());
  const [inputText, setInputText] = useState("");
  const [raised, setRaised] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  // const focusMode = useFocusMode();
  const intl = useIntl();

  useEffect(() => {
    const attendeeId = chime?.configuration?.credentials?.attendeeId;
    if (!attendeeId) {
      return;
    }

    chime?.sendMessage(
      raised ? MessageTopic.RaiseHand : MessageTopic.DismissHand,
      attendeeId
    );

    if (raised) {
      timeoutId = window.setTimeout(() => {
        chime?.sendMessage(MessageTopic.DismissHand, attendeeId);
        setRaised(false);
      }, 10000);
    } else {
      clearTimeout(timeoutId);
    }
  }, [raised, chime?.configuration]);

  const handleFileInput = (e: any) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadFile = (file: any) => {
    console.log("///////////",file)
    var upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: S3_BUCKET,
        Key: file.name,
        Body: file,
        ContentDisposition:"inline",
        ContentType: file.type
      },
    }).on("httpUploadProgress", (evt) => {
      setProgress(Math.round((evt.loaded / evt.total) * 100));
    });

    var promise = upload.promise();

    promise.then(
      function (data: any) {
        console.log(data);
        setInputText(data.Location);
        const sendingMessage = data.Location;
        const msgObject = {
          sendingMessage,
          channel: activeChannel,
          targetId: activeChatAttendee,
        };
        const attendeeId = chime?.configuration?.credentials?.attendeeId;
        if (sendingMessage !== "" && attendeeId) {
          chime?.sendMessage(MessageTopic.GroupChat, JSON.stringify(msgObject));
          setInputText("");
        }
      },
      function (err: any) {
        console.log(err);
        return err;
      }
    );
  };

  return (
    <div className={cx("chatInput")}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
        className={cx("form")}
      >
        <input
          className={cx("input")}
          value={inputText}
          onChange={(event) => {
            setInputText(event.target.value);
          }}
          onKeyUp={async (event) => {
            event.preventDefault();
            // send message stop on focus on
            // if (focusMode && classMode === ClassMode.Student) {
            //   return;
            // }
            if (event.keyCode === 13) {
              const sendingMessage = inputText.trim();
              const msgObject = {
                sendingMessage,
                channel: activeChannel,
                targetId: activeChatAttendee,
              };
              const attendeeId = chime?.configuration?.credentials?.attendeeId;
              if (sendingMessage !== "" && attendeeId) {
                chime?.sendMessage(
                  MessageTopic.GroupChat,
                  JSON.stringify(msgObject)
                );
                setInputText("");
              }
            }
          }}
          placeholder={intl.formatMessage({ id: "ChatInput.inputPlaceholder" })}
        />
        <IconButton color="inherit" sx={{
              position: "absolute",
              right: "40px",
              width: "40px",
              height: "40px",
              color:" #FFF",
              cursor: "pointer"
        }}>
          <input type="file" onChange={handleFileInput} style={{
            opacity: "0",
            zIndex: "10",
            position: "absolute",
            height: "40px",
            width: "40px"
          }} />
          <AttachFileIcon />
        </IconButton>
        <IconButton color="inherit" onClick={() => uploadFile(selectedFile)} sx={{
              width: "40px",
              height: "40px",
              color:" #FFF",
              cursor: "pointer"
        }}>
          <SendIcon />
        </IconButton>

        {classMode === ClassMode.Student && (
          <button
            type="button"
            className={cx("raiseHandButton", {
              raised,
            })}
            onClick={() => {
              setRaised(!raised);
            }}
          >
            <span
              role="img"
              aria-label={intl.formatMessage({
                id: "ChatInput.raiseHandAriaLabel",
              })}
            >
              ✋
            </span>
          </button>
        )}
      </form>
    </div>
  );
});
