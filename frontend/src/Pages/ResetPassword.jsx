import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/login.css";

export default function ResetPassword() {

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password || !confirm) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setError("");
    alert("Mot de passe réinitialisé !");
  };

  return (
    <div className="wrapper">

      <div className="form-box login">

        <form onSubmit={handleSubmit}>

          <h1>Réinitialiser le mot de passe</h1>

          <div className="input-box">
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit">Réinitialiser</button>

          <div className="register-link">
            <p>
              <Link to="/">Retour à la connexion</Link>
            </p>
          </div>

        </form>

      </div>

    </div>
  );
}
