import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // 🔥 LOAD USERS
  useEffect(() => {
    API.get("/api/salaries/")
      .then(res => {
        console.log("USERS:", res.data);
        setUsers(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  // 🔥 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce salarié ?")) return;

    await API.delete(`/api/salaries/${id}/`);
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="admin-dashboard">

      <h1 className="dashboard-title">👥 Salariés</h1>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Poste</th>
              <th>Établissement</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr 
                key={u.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/admin/salarie/${u.id}`)}
              >
                <td>{u.nom}</td>
                <td>{u.prenom}</td>
                <td>{u.poste}</td>
                <td>{u.etablissement}</td>

                <td onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => navigate(`/admin/salarie/${u.id}`)}>
                    👁️
                  </button>

                  <button style={{ color: "red" }} onClick={() => handleDelete(u.id)}>
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
