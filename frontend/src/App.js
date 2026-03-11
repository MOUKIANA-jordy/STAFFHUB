import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./Components/PrivateRoute";
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
import login from "./Styles/login.css";
import button from "./Styles/button.css";
import etatcivil from "./Styles/etatcivil.css";
import form from "./Styles/form.css";
import header from "./Styles/header.css";
import home from "./Styles/home.css";
import input from "./Styles/input.css";

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
	
	<Route path="/acompte" element={<Acompte />} />
  	<Route path="/avance" element={<Avance />} />
  	<Route path="/calendrier" element={<Calendrier />} />
  	<Route path="/fiches" element={<Fiches />} />
  	<Route path="/paiement-cet" element={<PaiementCet />} />
	<Route path="/paiement-hsup" element={<PaiementHSup />} />

	<Route path="/etat-civil" element={<EtatCivil />} />
	<Route path="/adresse" element={<Adresse />} />
	<Route path="/famille" element={<Famille />} />
	<Route path="/iban" element={<Iban />} />
	<Route path="/documents" element={<Documents />} />

	<Route path="/absences" element={<Absences />} />
  	<Route path="/planning" element={<Planning />} />
	<Route path="/pointages" element={<Pointages />} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;
