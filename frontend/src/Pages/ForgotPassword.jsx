import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/login.css";

export default function ForgotPassword(){

  const [identifiant,setIdentifiant] = useState("");
  const [message,setMessage] = useState("");

  const handleSubmit = (e)=>{
    e.preventDefault();

    if(!identifiant){
      setMessage("Veuillez entrer votre identifiant");
      return;
    }

    // simulation envoi email
    setMessage("Un lien de réinitialisation a été envoyé.");
  };

  return(

    <div className="login-container">

      <div className="login-box">

        <h2>Mot de passe oublié</h2>

        <form onSubmit={handleSubmit}>

          <div className="field">
            <label>Identifiant ou Email</label>

            <input
              type="text"
              value={identifiant}
              onChange={(e)=>setIdentifiant(e.target.value)}
            />

          </div>

          {message && <p className="error">{message}</p>}

          <button className="login-btn">
            Envoyer le lien
          </button>

        </form>

        <div className="options">
          <Link to="/">Retour à la connexion</Link>
        </div>

      </div>

    </div>

  );

}
