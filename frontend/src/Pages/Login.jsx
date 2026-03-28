import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import axios from "axios";
import "../Styles/login.css";

const Login = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false
  });

  const [error, setError] = useState("");

  // gestion des inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        {
          username: form.username,
          password: form.password
        }
      );

      // stockage tokens
      if (form.remember) {
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
      } else {
        sessionStorage.setItem("access", response.data.access);
        sessionStorage.setItem("refresh", response.data.refresh);
      }

      navigate("/home");

    } catch (err) {
      console.error(err.response?.data);
      setError("Identifiant ou mot de passe incorrect");
    }
  };

  return (
    <div className="wrapper">

      <div className="form-box login">

        <form onSubmit={handleSubmit}>

          <h1>Login</h1>

          {/* USERNAME */}
          <div className="input-box">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <FaUser className="icon" />
          </div>

          {/* PASSWORD */}
          <div className="input-box">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <FaLock className="icon" />
          </div>

          {/* ERROR */}
          {error && <p className="error">{error}</p>}

          {/* OPTIONS */}
          <div className="remember-forgot">
            <label>
              <input
                type="checkbox"
                name="remember"
                onChange={handleChange}
              />
              remember me
            </label>

            <Link to="/forgot">Forgot password ?</Link>
          </div>

          {/* BUTTON */}
          <button type="submit">Login</button>

          {/* REGISTER */}
          <div className="register-link">
            <p>
              Do not have an account ?{" "}
              <Link to="/register">Register</Link>
            </p>
          </div>

        </form>

      </div>

    </div>
  );
};

export default Login;
