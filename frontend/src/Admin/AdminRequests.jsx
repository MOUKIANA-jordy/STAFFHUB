import { useEffect, useState } from "react";
import API from "../Services/api";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    API.get("/api/demandes/")
      .then(res => setRequests(res.data))
      .catch(err => console.log(err));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/api/demandes/${id}/`, { statut: status });

      setRequests(prev =>
        prev.map(r => r.id === id ? { ...r, statut: status } : r)
      );
    } catch (err) {
      alert("Erreur");
    }
  };

  return (
    <div className="admin-dashboard">

      <h1>📁 Demandes RH</h1>

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
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.salarie_nom}</td>
              <td>{r.type}</td>

              <td>
                <span className={`status ${r.statut}`}>
                  {r.statut}
                </span>
              </td>

              <td>
                <button onClick={() => updateStatus(r.id, "ACCEPTE")}>✅</button>
                <button onClick={() => updateStatus(r.id, "REFUSE")}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
