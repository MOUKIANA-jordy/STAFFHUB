import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PrivateRoute from "./Components/PrivateRoute";
import Layout from "./Layout/Layout";
import Profile from "./Pages/Profile";
import Account from "./Pages/Account";

import Acompte from "./Pages/Dossiers/Demandes/Acompte";
import Avance from "./Pages/Dossiers/Demandes/Avance";
import Calendrier from "./Pages/Dossiers/Demandes/Calendrier";
import Fiches from "./Pages/Dossiers/Demandes/Fiches";
import PaiementCet from "./Pages/Dossiers/Demandes/Paiement_Cet";
import PaiementHSup from "./Pages/Dossiers/Demandes/Paiement_H_Sup";

import EtatCivil from "./Pages/Dossiers/Informations/EtatCivil";
import Adresse from "./Pages/Dossiers/Informations/Adresse";
import Famille from "./Pages/Dossiers/Informations/Famille";
import Iban from "./Pages/Dossiers/Informations/Iban";
import Documents from "./Pages/Dossiers/Informations/Documents";

import Absences from "./Pages/Activites/Absences";
import Planning from "./Pages/Activites/Planning";
import Pointages from "./Pages/Activites/Pointages";

import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Home from "./Pages/Home";

/* CSS */
import "./Styles/login.css";
import "./Styles/etatcivil.css";
import "./Styles/home.css";
import "./Styles/header.css";
import "./Styles/sidebar.css";
import "./Styles/form.css";

function App() {
  const user = {
    prenom: "",
    nom: "",
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* Pages publiques */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />

        {/* Routes protégées */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout user={user} />}>

            <Route path="/home" element={<Home />} />
	     <Route path="/profile" element={<Profile />} />
	     <Route path="/account" element={<Account />} />

            {/* Dossiers → Demandes */}
            <Route path="/dossiers/demandes/acompte" element={<Acompte />} />
            <Route path="/dossiers/demandes/avance" element={<Avance />} />
            <Route path="/dossiers/demandes/calendrier" element={<Calendrier />} />
            <Route path="/dossiers/demandes/fiches" element={<Fiches />} />
            <Route path="/dossiers/demandes/paiement-cet" element={<PaiementCet />} />
            <Route path="/dossiers/demandes/paiement-hsup" element={<PaiementHSup />} />

            {/* Dossiers → Informations */}
            <Route path="/dossiers/informations/etat-civil" element={<EtatCivil />} />
            <Route path="/dossiers/informations/adresse" element={<Adresse />} />
            <Route path="/dossiers/informations/famille" element={<Famille />} />
            <Route path="/dossiers/informations/iban" element={<Iban />} />
            <Route path="/dossiers/informations/documents" element={<Documents />} />

            {/* Activités */}
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
