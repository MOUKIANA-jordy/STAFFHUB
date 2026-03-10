import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Home from "./Pages/Home";

function App() {

  const user = {
    prenom: "Utilisateur",
    nom: ""
  };

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/forgot" element={<ForgotPassword />} />

        <Route path="/reset" element={<ResetPassword />} />

        <Route path="/home" element={<Home user={user} />} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;
