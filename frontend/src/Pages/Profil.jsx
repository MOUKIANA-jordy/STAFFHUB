import React, { useEffect, useState } from "react";
import { Camera, Save, UserRound } from "lucide-react";

import useAuth from "../Hooks/useAuth";
import "../Styles/profil.css";

export default function Profil() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
  });

  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
    });

    setPreview(user.photo || "");
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Données du profil :", formData);

    // Ajouter ici l'appel à votre API Django.
  };

  return (
    <section className="profile-page">
      <header className="profile-page-header">
        <h1>Mon profil</h1>
        <p>Consultez et modifiez vos informations personnelles.</p>
      </header>

      <form className="profile-card" onSubmit={handleSubmit}>
        <div className="profile-photo-section">
          <div className="profile-photo">
            {preview ? (
              <img src={preview} alt="Profil" />
            ) : (
              <UserRound size={48} />
            )}
          </div>

          <label className="profile-photo-button">
            <Camera size={18} />
            Modifier la photo

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </label>
        </div>

        <div className="profile-fields">
          <div className="profile-field">
            <label htmlFor="first_name">Prénom</label>
            <input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="last_name">Nom</label>
            <input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="username">Nom d’utilisateur</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field profile-field-full">
            <label htmlFor="phone">Téléphone</label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="profile-actions">
          <button type="submit">
            <Save size={18} />
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </section>
  );
}
