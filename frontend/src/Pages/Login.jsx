import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/login.css";
import API from "../Services/api";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifiant: "",
    password: "",
    remember: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    if (!form.identifiant || !form.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {

      const response = await API.post("/api/token/", {
  	username: form.identifiant,
  	password: form.password
      });

      // sauvegarde token
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      // redirection vers home
      navigate("/home");

    } catch (err) {

      setError("Identifiant ou mot de passe incorrect");

    }
  };

  return (
    <div className="login-container">
	  <div className="header-blue">

  <div className="app-name">StaffHub</div>

  <svg className="wave" viewBox="0 0 1440 320">
    <path fill="#ffffff" fillOpacity="0.3"
      d="M0,192L80,197.3C160,203,320,213,480,197.3C640,181,800,139,960,133.3C1120,128,1280,160,1360,176L1440,192L1440,320L0,320Z">
    </path>
  </svg>

</div>
      <div className="login-box">

        <h2>Connexion</h2>

        <form onSubmit={handleSubmit}>

          <div className="field">
            <label>Identifiant</label>

            <input
              type="text"
              name="identifiant"
              value={form.identifiant}
              onChange={handleChange}
            />

          </div>

          <div className="field password-field">

            <label>Mot de passe</label>

            <div className="password-input">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
              />

              <span
                className="toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
              </span>

            </div>

          </div>

          {error && <p className="error">{error}</p>}

          <div className="options">

            <label>
              <input
                type="checkbox"
                name="remember"
                onChange={handleChange}
              />
              Se souvenir de moi
            </label>

            <Link to="/forgot">
              Mot de passe oublié ?
            </Link>

          </div>

          <button className="login-btn">
            Se connecter
          </button>

        </form>

      </div>
    </div>
  );
}
