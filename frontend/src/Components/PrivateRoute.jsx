import {
  Navigate,
  Outlet,
} from "react-router-dom";

import useAuth from "../Hooks/useAuth";


export default function PrivateRoute() {
  const {
    user,
    loading,
  } = useAuth();


  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
        }}
      >
        Chargement...
      </div>
    );
  }


  return user
    ? <Outlet />
    : <Navigate to="/" replace />;
}
