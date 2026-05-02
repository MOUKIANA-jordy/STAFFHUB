import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";

export default function DemandesAdmin() {
  const [demandes, setDemandes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/demandes/")
      .then(res => setDemandes(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="admin-dashboard">

      <h1 className="dashboard-title">📊 Demandes</h1>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Salarié</th>
              <th>Type</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            {demandes.map(d => (
              <tr
                key={d.id}
                className="clickable-row"
                onClick={() => navigate(`/admin/demandes/${d.id}`)}
              >
                <td>{d.salarie_nom}</td>

                <td>{d.type_demande}</td>

                <td>
                  {{
                    EN_ATTENTE: "🕐 En attente",
                    APPROUVE: "✅ Approuvé",
                    REFUSE: "❌ Refusé"
                  }[d.statut]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
