import { useEffect, useState } from "react";
import API from "../Services/api";

export default function Paie() {
  const [fiches, setFiches] = useState([]);

  useEffect(() => {
    API.get("/api/paie/")
      .then(res => setFiches(res.data));
  }, []);

  return (
    <div className="page">
      <h1>📄 Fiches de paie</h1>

      {fiches.map(f => (
        <div key={f.id} className="card">
          {f.mois} - {f.salaire} €
        </div>
      ))}
    </div>
  );
}
