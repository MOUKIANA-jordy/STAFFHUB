import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Components/Header";

export default function MainLayout({ user }) {

  return (

    <div>

      <Header user={user} />

      <div className="main-content">

        <Outlet />

      </div>

    </div>

  );

}
