import { useParams } from "react-router-dom";
import { useState } from "react";
import API from "../Services/api";

export default function SetPassword() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    await API.post("/api/set-password/", {
      uid,
      token,
      password
    });

    alert("Mot de passe défini !");
  };

  return (
    <div>
      <h2>Créer votre mot de passe</h2>

      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSubmit}>
        Valider
      </button>
    </div>
  );
}
