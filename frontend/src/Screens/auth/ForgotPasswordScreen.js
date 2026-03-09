import React, { useState } from "react";
import Header from "../../Components/Header";
import Input from "../../Components/Input";
import Button from "../../Components/Button";

export default function ForgotPasswordScreen() {

  const [email, setEmail] = useState("");

  const handleSend = () => {
    if (!email) {
      alert("Veuillez entrer votre email.");
      return;
    }

    console.log("Email envoyé à :", email);
    alert("Un lien de réinitialisation a été envoyé.");
  };

  return (
    <div style={styles.container}>

      <Header title="Mot de passe oublié" />

      <p style={styles.text}>
        Entrez votre email professionnel
      </p>

      <Input
        placeholder="email@staffhub.com"
        value={email}
        onChange={setEmail}
      />

      <Button
        title="Envoyer le lien"
        onClick={handleSend}
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
  },

  text: {
    textAlign: "center",
    marginBottom: "20px"
  }
};
