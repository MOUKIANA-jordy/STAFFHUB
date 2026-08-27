import React from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";


/* =========================================================
   PROTECTION
========================================================= */

import PrivateRoute from "./Components/PrivateRoute";


/* =========================================================
   LAYOUTS
========================================================= */

import Layout from "./Layout/Layout";
import AdminLayout from "./Layout/AdminLayout";


/* =========================================================
   PUBLIC
========================================================= */

import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import SetPassword from "./Pages/SetPassword";


/* =========================================================
   CORE
========================================================= */

import Home from "./Pages/Home";
import Notifications from "./Pages/Notifications";
import Messagerie from "./Pages/Messagerie";
import Profile from "./Pages/Profile";
import Account from "./Pages/Account";


/* =========================================================
   DOSSIERS - DEMANDES
========================================================= */

import Acompte from "./Pages/Dossiers/Demandes/Acompte";
import Avance from "./Pages/Dossiers/Demandes/Avance";
import Calendrier from "./Pages/Dossiers/Demandes/Calendrier";
import Fiches from "./Pages/Dossiers/Demandes/Fiches";
import PaiementCet from "./Pages/Dossiers/Demandes/Paiement_Cet";
import PaiementHSup from "./Pages/Dossiers/Demandes/Paiement_H_Sup";


/* =========================================================
   DOSSIERS - INFORMATIONS
========================================================= */

import Dossiers from "./Pages/Dossiers/Dossiers";
import EtatCivil from "./Pages/Dossiers/Informations/EtatCivil";
import Adresse from "./Pages/Dossiers/Informations/Adresse";
import Famille from "./Pages/Dossiers/Informations/Famille";
import Iban from "./Pages/Dossiers/Informations/Iban";
import Documents from "./Pages/Dossiers/Informations/Documents";
import DonneesComple from "./Pages/Dossiers/Informations/Donnees_Comple";


/* =========================================================
   ACTIVITÉS
========================================================= */

import Absences from "./Pages/Activites/Absences";
import Planning from "./Pages/Activites/Planning";
import Pointages from "./Pages/Activites/Pointages";


/* =========================================================
   ADMIN
========================================================= */

import AdminDashboard from "./Admin/AdminDashboard";
import Users from "./Admin/Users";
import Demandes from "./Admin/Demandes";
import Calendar from "./Admin/Calendar";
import Paie from "./Admin/Paie";
import Settings from "./Admin/Settings";
import AdminPanel from "./Admin/AdminPanel";
import CreateSalarie from "./Admin/CreateSalarie";
import DemandeDetail from "./Admin/DemandeDetail";
import SalarieDetail from "./Admin/SalarieDetail";
import EditSalarie from "./Admin/EditSalarie";


/* =========================================================
   CSS GLOBAL
========================================================= */

import "./Styles/theme.css";
import "./Styles/login.css";
import "./Styles/etatcivil.css";
import "./Styles/home.css";
import "./Styles/header.css";
import "./Styles/sidebar.css";
import "./Styles/admin.css";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            PUBLIC
        ================================================= */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/forgot"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset"
          element={<ResetPassword />}
        />

        <Route
          path="/set-password/:uid/:token"
          element={<SetPassword />}
        />


        {/* =================================================
            ZONE PROTÉGÉE
        ================================================= */}

        <Route element={<PrivateRoute />}>


          {/* ===============================================
              ESPACE SALARIÉ
          =============================================== */}

          <Route element={<Layout />}>

            <Route
              path="/home"
              element={<Home />}
            />

            <Route
              path="/home/notifications"
              element={<Notifications />}
            />

            <Route
              path="/home/messagerie"
              element={<Messagerie />}
            />

            <Route
              path="/home/profile"
              element={<Profile />}
            />

            <Route
              path="/home/account"
              element={<Account />}
            />


            {/* ---------------------------------------------
                ALIAS ANCIENS
            --------------------------------------------- */}

            <Route
              path="/profile"
              element={
                <Navigate
                  to="/home/profile"
                  replace
                />
              }
            />

            <Route
              path="/home/profil"
              element={
                <Navigate
                  to="/home/profile"
                  replace
                />
              }
            />


            {/* =============================================
                DOSSIERS
            ============================================= */}

            <Route
              path="/home/dossiers"
              element={<Dossiers />}
            />

            <Route
              path="/dossiers/demandes/acompte"
              element={<Acompte />}
            />

            <Route
              path="/dossiers/demandes/avance"
              element={<Avance />}
            />

            <Route
              path="/dossiers/demandes/calendrier"
              element={<Calendrier />}
            />

            <Route
              path="/dossiers/demandes/fiches"
              element={<Fiches />}
            />

            <Route
              path="/dossiers/demandes/paiement-cet"
              element={<PaiementCet />}
            />

            <Route
              path="/dossiers/demandes/paiement-hsup"
              element={<PaiementHSup />}
            />


            {/* =============================================
                INFORMATIONS PERSONNELLES
            ============================================= */}

            <Route
              path="/dossiers/informations/etat-civil"
              element={<EtatCivil />}
            />

            <Route
              path="/dossiers/informations/adresse"
              element={<Adresse />}
            />

            <Route
              path="/dossiers/informations/famille"
              element={<Famille />}
            />

            <Route
              path="/dossiers/informations/iban"
              element={<Iban />}
            />

            <Route
              path="/dossiers/informations/documents"
              element={<Documents />}
            />

	    <Route
              path="/dossiers/informations/donnees-complementaires"
              element={<DonneesComple />}
            />


            {/* =============================================
                ACTIVITÉS
            ============================================= */}

            <Route
              path="/home/activites"
              element={<Home />}
            />

            <Route
              path="/activites/absences"
              element={<Absences />}
            />

            <Route
              path="/activites/planning"
              element={<Planning />}
            />

            <Route
              path="/activites/pointages"
              element={<Pointages />}
            />

          </Route>


          {/* ===============================================
              ESPACE RH / ADMIN
          =============================================== */}

          <Route element={<AdminLayout />}>

            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/users"
              element={<Users />}
            />

            <Route
              path="/admin/salarie/create"
              element={<CreateSalarie />}
            />

            <Route
              path="/admin/requests"
              element={<Demandes />}
            />

            <Route
              path="/admin/calendar"
              element={<Calendar />}
            />

            <Route
              path="/admin/paie"
              element={<Paie />}
            />

            <Route
              path="/admin/settings"
              element={<Settings />}
            />

            <Route
              path="/admin/panel"
              element={<AdminPanel />}
            />

	    <Route
  	      path="/admin/demandes/:id"
  	      element={<DemandeDetail />}
            />

	    <Route
  	      path="/admin/salarie/:id"
              element={<SalarieDetail />}
            />

            <Route
              path="/admin/salarie/edit/:id"
              element={<EditSalarie />}
            />


            {/* ---------------------------------------------
                ANCIENNE ROUTE
            --------------------------------------------- */}

            <Route
              path="/admin/demandes"
              element={
                <Navigate
                  to="/admin/requests"
                  replace
                />
              }
            />

          </Route>

        </Route>


        {/* =================================================
            ROUTE INCONNUE
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;
