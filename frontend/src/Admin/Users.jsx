import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔥 LOAD USERS
  useEffect(() => {
    API.get("/api/salaries/")
      .then(res => {
        setUsers(res.data);
      })
      .catch(err => {
        console.error(err);
        alert("Erreur chargement salariés");
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔥 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce salarié ?")) return;

    try {
      await API.delete(`/api/salaries/${id}/`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur suppression");
    }
  };

  return (
    <div className="admin-dashboard">

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="dashboard-title">👥 Salariés</h1>

        {/* ➕ AJOUT */}
        <button 
          className="add-btn"
          onClick={() => navigate("/admin/salarie/create")}
        >
          ➕ Ajouter
        </button>
      </div>

      <div className="table-container">

        {loading ? (
          <p>Chargement...</p>
        ) : users.length === 0 ? (
          <p>Aucun salarié</p>
        ) : (
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
                  className="clickable-row"
                  onClick={() => navigate(`/admin/salarie/${u.id}`)}
                >
                  <td>{u.nom}</td>
                  <td>{u.prenom}</td>
                  <td>{u.poste}</td>
                  <td>{u.etablissement}</td>

                  <td onClick={(e) => e.stopPropagation()}>

                    {/* 👁️ VIEW */}
                    <button 
                      className="view-btn"
                      onClick={() => navigate(`/admin/salarie/${u.id}`)}
                    >
                      👁️
                    </button>

                    {/* ✏️ EDIT */}
                    <button 
                      className="edit-btn"
                      onClick={() => navigate(`/admin/salarie/edit/${u.id}`)}
                    >
                      ✏️
                    </button>

                    {/* 🗑 DELETE */}
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(u.id)}
                    >
                      🗑
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
}
