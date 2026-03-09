import React, { useState } from "react";
import Header from "../../Components/Header";
import Input from "../../Components/Input";
import Button from "../../Components/Button";

export default function ResetPasswordScreen() {

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = () => {

    if (!password || !confirmPassword) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    console.log("Mot de passe changé :", password);
    alert("Mot de passe modifié avec succès !");
  };

  return (
    <div style={styles.container}>

      <Header title="Nouveau mot de passe" />

      <Input
        placeholder="Nouveau mot de passe"
        type="password"
        value={password}
        onChange={setPassword}
      />

      <Input
        placeholder="Confirmer le mot de passe"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />

      <Button
        title="Modifier mot de passe"
        onClick={handleReset}
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
    boxShadow: "0 0 10px rgba(0,0,0,0.1)"
  }
};
