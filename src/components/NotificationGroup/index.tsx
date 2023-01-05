import React from "react";
import classNames from "classnames/bind";

import {
  useNotificationsState,
  useNotificationDispatch,
  Type,
} from "../../providers/NotificationProvider";
import { Snackbar } from "@mui/material";
import Alert from "../../custom/classroom/Alert";
import styles from "./index.css";

const cx = classNames.bind(styles);

export enum Variant {
  ERROR = "error",
  SUCCESS = "success",
  INFO = "info",
  WARNING = "warning",
}

const NotificationGroup = () => {
  const { notifications } = useNotificationsState();
  const dispatch = useNotificationDispatch();

  console.log("🏮🏮🏮🏮🏮🏮", notifications);

  return (
    <>
      {notifications.map((item: any) =>
        item.variant === Variant.WARNING ? (
          <Snackbar
            key={item.id}
            open={true}
            className={cx("Mui_snackbar_from_top")}
            onClose={() => dispatch({ type: Type.REMOVE, payload: item.id })}
            anchorOrigin={{
              vertical: item.vertical,
              horizontal: item.horizontal,
            }}
          >
            <Alert
              onClose={() => dispatch({ type: Type.REMOVE, payload: item.id })}
              severity="warning"
              sx={{
                width: "100%",
                background: item.background,
                color: item.color,
              }}
            >
              {item.message}
            </Alert>
          </Snackbar>
        ) : (
          <Snackbar
            key={item.id}
            open={true}
            className={cx("Mui_snackbar_from_top")}
            sx={{
              background: item.background,
              color: item.color,
              border: "1px solid #5F5F5F",
            }}
            onClose={() => dispatch({ type: Type.REMOVE, payload: item.id })}
            anchorOrigin={{
              vertical: item.vertical,
              horizontal: item.horizontal,
            }}
            message={item.message}
          >
            <Alert
              onClose={() => dispatch({ type: Type.REMOVE, payload: item.id })}
              severity="info"
              sx={{
                width: "100%",
                background: item.background,
                color: item.color,
              }}
            >
              {item.message}
            </Alert>
          </Snackbar>
        )
      )}
    </>
  );
};
export default NotificationGroup;
