import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import API from "../Services/api";
import "../Styles/login.css";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await API.post("/api/token/", {
        username: form.username.trim(),
        password: form.password,
      });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      navigate("/home", {
        replace: true,
      });
    } catch (err) {
      console.error("Erreur de connexion :", err);

      if (!err.response) {
        setError(
          "Impossible de contacter le serveur. Veuillez réessayer."
        );
      } else {
        setError("Identifiant ou mot de passe incorrect");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="wrapper">
        <div className="form-box login">
          <form onSubmit={handleSubmit}>
            <h1>Connexion</h1>

            <div className="input-box">
              <input
                type="text"
                name="username"
                placeholder="Nom d’utilisateur"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />

              <FaUser className="icon" />
            </div>

            <div className="input-box">
              <input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <FaLock className="icon" />
            </div>

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}

            <div className="remember-forgot">
              <Link to="/forgot">
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
