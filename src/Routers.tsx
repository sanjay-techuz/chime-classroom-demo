import React, { useContext } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import App from "./components/App";
import Classroom from "./components/Classroom";
import CreateOrJoin from "./components/CreateOrJoin";
import Main from "./components/Main";
import ThankyouPage from "./components/ThankyouPage";
import routes from "./constants/routes.json";
import getUIStateContext from "./context/getUIStateContext";
import GlobalVarProvider from "./providers/GlobalVarProvider";
import MeetingStatusProvider from "./providers/MeetingStatusProvider";

export default function Routers() {
  const [state] = useContext(getUIStateContext());

  const PrivateRoute = () => {
    return state.classMode ? <Outlet /> : <Navigate to={routes.HOME} />;
  };

  const ProtectedClassroom = () => {
    return (
      <GlobalVarProvider>
        <MeetingStatusProvider>
          <Classroom />
        </MeetingStatusProvider>
      </GlobalVarProvider>
    );
  };

  return (
    <App>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path={routes.CLASSROOM} element={<ProtectedClassroom />} />
        </Route>
        <Route path={routes.CREATE_OR_JOIN} element={<CreateOrJoin />} />
        <Route path={routes.MAIN} element={<ThankyouPage />} />
        <Route path={routes.HOME} element={<Main />} />
      </Routes>
    </App>
  );
}
