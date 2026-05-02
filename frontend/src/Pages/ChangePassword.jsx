import { useState } from "react";
import API from "../Services/api";

export default function ChangePassword() {

  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await API.post("/api/change-password/", {
      password
    });

    alert("Mot de passe changé !");
    window.location.href = "/home";
  };

  return (
    <div className="card">
      <h2>Nouveau mot de passe</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn-primary">Valider</button>
      </form>
    </div>
  );
}
