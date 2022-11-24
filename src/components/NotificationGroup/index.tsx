import React from "react";

import {
  useNotificationsState,
  useNotificationDispatch,
  Type,
} from "../../providers/NotificationProvider";
import { Snackbar } from "@mui/material";
import Alert from "../../custom/classroom/Alert";

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
              open={true}
              onClose={() => dispatch({ type: Type.REMOVE, payload: item.id })}
              anchorOrigin={{
                vertical: item.vertical,
                horizontal: item.horizontal,
              }}
            >
              <Alert
                onClose={() =>
                  dispatch({ type: Type.REMOVE, payload: item.id })
                }
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
              open={true}
              sx={{
                background: item.background,
                color: item.color,
              }}
              onClose={() => dispatch({ type: Type.REMOVE, payload: item.id })}
              anchorOrigin={{
                vertical: item.vertical,
                horizontal: item.horizontal,
              }}
              message={item.message}
            />
          )
      )}
    </>
  );
};
export default NotificationGroup;
