import { BrowserRouter as Router, Routes, Route } from "react-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "./ProtectedRoute";
import authRoute from "./route/auth";
import mainRoute from "./route/main";
import NotFound from "@pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { AppDispatch, RootState } from "store";
import { ScrollToTop } from "@components/common/ScrollToTop";
import Spin from "@components/spin";
import { restoreSession } from "@reducers/auth/authSlice";

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const [sessionReady, setSessionReady] = useState(false);
  const loading = useSelector((state: RootState) => state.loading.isLoading);

  useEffect(() => {
    dispatch(restoreSession()).finally(() => setSessionReady(true));
  }, [dispatch]);

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 dark:bg-brand-950">
        <Spin />
      </div>
    );
  }

  return (
    <>
      <Router basename="">
        <ScrollToTop />
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {mainRoute.map(({ path, component: Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Route>
          </Route>
          {authRoute.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      {loading && <Spin />}
    </>
  );
}
