import { useState } from "react";

export default function PaiementHSup() {
  const [heures, setHeures] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Demande H Sup envoyée : ${heures} heures`);
  };

  return (
    <div className="page">
      <h1>⏱️ Paiement Heures Supplémentaires</h1>

      <form onSubmit={handleSubmit} className="form">

        <label>Nombre d'heures :</label>
        <input
          type="number"
          value={heures}
          onChange={(e) => setHeures(e.target.value)}
        />

        <button type="submit">Envoyer</button>

      </form>
    </div>
  );
}
