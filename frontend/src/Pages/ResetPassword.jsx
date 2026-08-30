import React, {
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../Services/api";

import "../Styles/login.css";


export default function ResetPassword() {

  const navigate =
    useNavigate();

  const {
    uid,
    token,
  } = useParams();


  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirm,
    setConfirm,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");
    setMessage("");


    if (
      !password
      || !confirm
    ) {
      setError(
        "Veuillez remplir tous les champs."
      );

      return;
    }


    if (
      password !== confirm
    ) {
      setError(
        "Les mots de passe ne correspondent pas."
      );

      return;
    }


    if (
      password.length < 8
    ) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );

      return;
    }


    if (
      !uid
      || !token
    ) {
      setError(
        "Le lien de réinitialisation est invalide."
      );

      return;
    }


    try {

      setLoading(true);


      await API.post(
        "/api/password-reset-confirm/",
        {
          uid,
          token,
          password,
        }
      );


      setMessage(
        "Votre mot de passe a été réinitialisé."
      );


      window.setTimeout(
        () => {
          navigate(
            "/",
            {
              replace: true,
            }
          );
        },
        1800
      );


    } catch (err) {

      console.error(
        "RESET PASSWORD ERROR",
        err
      );


      const data =
        err.response?.data;


      setError(
        data?.detail
        || data?.password?.[0]
        || data?.token?.[0]
        || "Impossible de réinitialiser le mot de passe."
      );


    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="login-page">

      <div className="wrapper">

        <div className="form-box login">

          <form
            onSubmit={
              handleSubmit
            }
          >

            <h1>
              Réinitialiser le mot de passe
            </h1>


            <div className="input-box">

              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={
                  password
                }
                onChange={
                  (event) =>
                    setPassword(
                      event.target.value
                    )
                }
                autoComplete="new-password"
              />

            </div>


            <div className="input-box">

              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={
                  confirm
                }
                onChange={
                  (event) =>
                    setConfirm(
                      event.target.value
                    )
                }
                autoComplete="new-password"
              />

            </div>


            {
              error
              && (
                <p className="error">
                  {error}
                </p>
              )
            }


            {
              message
              && (
                <p className="reset-success">
                  {message}
                </p>
              )
            }


            <button
              type="submit"
              disabled={
                loading
              }
            >
              {
                loading
                  ? "Réinitialisation..."
                  : "Réinitialiser"
              }
            </button>


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
