import { useState } from "react";
import "../../../Styles/form.css";

export default function PaiementCet() {
  const [jours, setJours] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Demande CET envoyée : ${jours} jours`);
  };

  return (
    <div className="page">
      <h1>💰 Paiement CET</h1>

      <form onSubmit={handleSubmit} className="form">

        <label>Nombre de jours :</label>
        <input
          type="number"
          value={jours}
          onChange={(e) => setJours(e.target.value)}
        />

        <button type="submit">Envoyer</button>

      </form>
    </div>
  );
}
