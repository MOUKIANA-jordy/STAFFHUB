import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/login.css";

export default function ForgotPassword() {

  const [identifiant, setIdentifiant] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!identifiant) {
      setMessage("Veuillez entrer votre identifiant");
      return;
    }

    // Simulation envoi email
    setMessage("Un lien de réinitialisation a été envoyé.");
  };

  return (
    <div className="login-page"> {/* CENTRAGE */}

      <div className="wrapper">

        <div className="form-box login">

          <form onSubmit={handleSubmit}>

            <h1>Mot de passe oublié</h1>

            {/* INPUT */}
            <div className="input-box">
              <input
                type="text"
                placeholder="Identifiant ou Email"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
              />
            </div>

            {/* MESSAGE */}
            {message && <p className="error">{message}</p>}

            {/* BUTTON */}
            <div className="input-box forgot-input">
              <button type="submit">Envoyer le lien</button>
            </div>

            {/* BACK */}
            <div className="register-link">
              <p>
                <Link to="/">Retour à la connexion</Link>
              </p>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
