import { useEffect, useState } from "react";
import API from "../Services/api";

export default function DemandesAdmin() {
  const [demandes, setDemandes] = useState([]);

  useEffect(() => {
    API.get("/api/demandes/")
      .then(res => setDemandes(res.data));
  }, []);

  const updateStatut = (id, statut) => {
    API.patch(`/api/demandes/${id}/`, { statut })
      .then(() => {
        setDemandes(prev =>
          prev.map(d =>
            d.id === id ? { ...d, statut } : d
          )
        );
      });
  };

  return (
    <div className="page">

      <h1>📊 Suivi des demandes</h1>

      <table>
        <thead>
          <tr>
            <th>Salarié</th>
            <th>Type</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {demandes.map(d => (
            <tr key={d.id}>
              <td>{d.salarie_nom}</td>
              <td>{d.type}</td>
              <td>{d.statut}</td>

              <td>
                <button onClick={() => updateStatut(d.id, "VALIDE")}>
                  ✔️
                </button>

                <button onClick={() => updateStatut(d.id, "REFUSE")}>
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
