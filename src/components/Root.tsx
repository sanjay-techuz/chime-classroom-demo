/* eslint-disable  */

import React from "react";
// import { hot } from "react-hot-loader/root";
import { BrowserRouter } from "react-router-dom";

import ChimeProvider from "../providers/ChimeProvider";
import I18nProvider from "../providers/I18nProvider";
import { NotificationProvider } from "../providers/NotificationProvider";
import UIStateProvider from "../providers/UIStateProvider";
import Routers from "../Routers";
import NotificationGroup from "./NotificationGroup";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const Root = () => {
  const theme = createTheme({
    typography: {
      fontFamily: "Poppins",
    },
  });

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <I18nProvider>
            <ChimeProvider>
              <UIStateProvider>
                <Routers />
                <NotificationGroup />
              </UIStateProvider>
            </ChimeProvider>
          </I18nProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default Root;
