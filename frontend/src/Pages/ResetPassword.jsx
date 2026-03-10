import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/login.css";

export default function ResetPassword(){

  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");
  const [error,setError] = useState("");

  const handleSubmit = (e)=>{
    e.preventDefault();

    if(!password || !confirm){
      setError("Veuillez remplir tous les champs");
      return;
    }

    if(password !== confirm){
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setError("");
    alert("Mot de passe réinitialisé !");
  };

  return(

    <div className="login-container">

      <div className="login-box">

        <h2>Réinitialiser le mot de passe</h2>

        <form onSubmit={handleSubmit}>

          <div className="field">
            <label>Nouveau mot de passe</label>

            <input
              type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />

          </div>

          <div className="field">
            <label>Confirmer le mot de passe</label>

            <input
              type="password"
              value={confirm}
              onChange={(e)=>setConfirm(e.target.value)}
            />

          </div>

          {error && <p className="error">{error}</p>}

          <button className="login-btn">
            Réinitialiser
          </button>

        </form>

        <div className="options">
          <Link to="/">Retour à la connexion</Link>
        </div>

      </div>

    </div>

  );

}
