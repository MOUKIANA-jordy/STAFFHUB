import React, {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import API from "../Services/api";

import "../Styles/login.css";


export default function ForgotPassword() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");


    if (!email.trim()) {
      setError(
        "Veuillez entrer votre adresse e-mail."
      );

      return;
    }


    try {
      setLoading(true);


      const response = await API.post(
        "/api/password-reset/",
        {
          email: email.trim(),
        }
      );


      setMessage(
        response.data?.message
        || (
          "Si cette adresse e-mail est associée "
          + "à un compte StaffHub, un lien de "
          + "réinitialisation a été envoyé."
        )
      );

    } catch (err) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        err
      );


      const data =
        err.response?.data;


      setError(
        data?.email?.[0]
        || data?.detail
        || (
          "Impossible d'envoyer la demande. "
          + "Veuillez réessayer."
        )
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">
      <div className="wrapper">
        <div className="form-box login">
          <form onSubmit={handleSubmit}>
            <h1>
              Mot de passe oublié
            </h1>


            <div className="input-box">
              <input
                type="email"
                name="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );

                  setError("");
                  setMessage("");
                }}
                autoComplete="email"
                required
              />
            </div>


            {error && (
              <p
                className="error"
                role="alert"
              >
                {error}
              </p>
            )}


            {message && (
              <p className="reset-success">
                {message}
              </p>
            )}


            <div className="input-box forgot-input">
              <button
                type="submit"
                disabled={loading}
              >
                {
                  loading
                    ? "Envoi en cours..."
                    : "Envoyer le lien"
                }
              </button>
            </div>


            <div className="register-link">
              <p>
                <Link to="/">
                  Retour à la connexion
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
