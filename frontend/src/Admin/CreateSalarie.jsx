import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";

export default function CreateSalarie() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    nom: "",
    prenom: "",
    role: "SALARIE",
    matricule: "",
    telephone: "",
    poste: "",
    etablissement: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/api/salaries/", form);
      alert("Salarié créé !");
      navigate("/admin/users");
    } catch (err) {
      console.error(err);
      alert("Erreur création");
    }
  };

  return (
    <div className="card">

      <h2>➕ Créer un salarié</h2>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Username</label>
          <input name="username" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input type="password" name="password" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Nom</label>
          <input name="nom" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Prénom</label>
          <input name="prenom" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Rôle</label>
          <select name="role" onChange={handleChange}>
            <option value="SALARIE">Salarié</option>
            <option value="RH">RH</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="form-group">
          <label>Matricule</label>
          <input name="matricule" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Téléphone</label>
          <input name="telephone" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Poste</label>
          <input name="poste" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Établissement</label>
          <input name="etablissement" onChange={handleChange} />
        </div>

        <button className="btn-primary">Créer</button>

      </form>
    </div>
  );
}
