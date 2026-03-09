import React, { useState } from "react";
import Header from "../../Components/Header";
import Input from "../../Components/Input";
import Button from "../../Components/Button";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function LoginScreen() {
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!identifiant || !password) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await api.post("token/", {
        username: identifiant,
        password: password,
      });

      const { access, refresh } = response.data;

      console.log("Access Token :", access);
      console.log("Refresh Token :", refresh);

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      alert("Connexion réussie !");
      navigate("/dashboard");

    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Identifiant ou mot de passe incorrect");
    }
  };

  return (
    <div style={styles.container}>
      <Header title="StaffHub" />

      <Input
        placeholder="Identifiant"
        value={identifiant}
        onChange={setIdentifiant}
      />

      <Input
        placeholder="Mot de passe"
        value={password}
        onChange={setPassword}
        type="password"
      />

      <Button title="Se connecter" onClick={handleLogin} />

      <Button
        title="Mot de passe oublié ?"
        onClick={() => navigate("/forgot-password")}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
};
