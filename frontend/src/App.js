import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* CLéS */
import PrivateRoute from "./Components/PrivateRoute";
import Layout from "./Layout/Layout";

/* PUBLIC */
import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

/* CORE */
import Home from "./Pages/Home";
import Profile from "./Pages/Profile";
import Account from "./Pages/Account";

/* DOSSIERS */
import Acompte from "./Pages/Dossiers/Demandes/Acompte";
import Avance from "./Pages/Dossiers/Demandes/Avance";
import Calendrier from "./Pages/Dossiers/Demandes/Calendrier";
import Fiches from "./Pages/Dossiers/Demandes/Fiches";
import PaiementCet from "./Pages/Dossiers/Demandes/Paiement_Cet";
import PaiementHSup from "./Pages/Dossiers/Demandes/Paiement_H_Sup";

/* INFOS */
import EtatCivil from "./Pages/Dossiers/Informations/EtatCivil";
import Adresse from "./Pages/Dossiers/Informations/Adresse";
import Famille from "./Pages/Dossiers/Informations/Famille";
import Iban from "./Pages/Dossiers/Informations/Iban";
import Documents from "./Pages/Dossiers/Informations/Documents";

/* ACTIVITÉS */
import Absences from "./Pages/Activites/Absences";
import Planning from "./Pages/Activites/Planning";
import Pointages from "./Pages/Activites/Pointages";

/* ADMIN */
import AdminDashboard from "./Admin/AdminDashboard";
import Users from "./Admin/Users";
import Demandes from "./Admin/Demandes";
import Calendar from "./Admin/Calendar";
import Paie from "./Admin/Paie";
import Settings from "./Admin/Settings";
import AdminPanel from "./Admin/AdminPanel";
import CreateSalarie from "./Admin/CreateSalarie";

/* CSS */
import "./Styles/login.css";
import "./Styles/etatcivil.css";
import "./Styles/home.css";
import "./Styles/header.css";
import "./Styles/sidebar.css";
import "./Styles/form.css";
import "./Styles/admin.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />

        {/* ================= PROTECTED ================= */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>

            {/* HOME */}
            <Route path="/home" element={<Home />} />
            <Route path="/home/dossiers" element={<Home />} />
            <Route path="/home/activites" element={<Home />} />

            {/* USER */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/account" element={<Account />} />

            {/* ================= ADMIN ================= */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/demandes" element={<Demandes />} />
	    <Route path="/admin/salarie/create" element={<CreateSalarie />} />
            <Route path="/admin/calendar" element={<Calendar />} />
            <Route path="/admin/paie" element={<Paie />} />
            <Route path="/admin/settings" element={<Settings />} />
	    <Route path="/admin/panel" element={<AdminPanel />} />

            {/* ================= DOSSIERS ================= */}
            <Route path="/dossiers/demandes/acompte" element={<Acompte />} />
            <Route path="/dossiers/demandes/avance" element={<Avance />} />
            <Route path="/dossiers/demandes/calendrier" element={<Calendrier />} />
            <Route path="/dossiers/demandes/fiches" element={<Fiches />} />
            <Route path="/dossiers/demandes/paiement-cet" element={<PaiementCet />} />
            <Route path="/dossiers/demandes/paiement-hsup" element={<PaiementHSup />} />

            {/* ================= INFOS ================= */}
            <Route path="/dossiers/informations/etat-civil" element={<EtatCivil />} />
            <Route path="/dossiers/informations/adresse" element={<Adresse />} />
            <Route path="/dossiers/informations/famille" element={<Famille />} />
            <Route path="/dossiers/informations/iban" element={<Iban />} />
            <Route path="/dossiers/informations/documents" element={<Documents />} />

            {/* ================= ACTIVITÉS ================= */}
            <Route path="/activites/absences" element={<Absences />} />
            <Route path="/activites/planning" element={<Planning />} />
            <Route path="/activites/pointages" element={<Pointages />} />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
