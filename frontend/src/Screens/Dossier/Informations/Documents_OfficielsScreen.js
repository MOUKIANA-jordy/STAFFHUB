import React, { useState } from "react";

import Header from "../../components/Header";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function DocumentsScreen() {
  const [typeDoc, setTypeDoc] = useState("");
  const [numeroDoc, setNumeroDoc] = useState("");
  const [organisme, setOrganisme] = useState("");
  const [numeroCarte, setNumeroCarte] = useState("");
  const [dateDelivrance, setDateDelivrance] = useState("");
  const [dateExpiration, setDateExpiration] = useState("");
  const [statut, setStatut] = useState("");

  const handleSave = () => {
    console.log({
      typeDoc,
      numeroDoc,
      organisme,
      numeroCarte,
      dateDelivrance,
      dateExpiration,
      statut,
    });
    alert("Document enregistré !");
  };

  return (
    <div style={styles.container}>
      <Header title="Documents officiels" />

      <Input placeholder="Type de document" value={typeDoc} onChange={e => setTypeDoc(e.target.value)} />
      <Input placeholder="Numéro du document" value={numeroDoc} onChange={e => setNumeroDoc(e.target.value)} />
      <Input placeholder="Organisme" value={organisme} onChange={e => setOrganisme(e.target.value)} />
      <Input placeholder="Numéro de la carte" value={numeroCarte} onChange={e => setNumeroCarte(e.target.value)} />
      <Input placeholder="Date de délivrance" value={dateDelivrance} onChange={e => setDateDelivrance(e.target.value)} />
      <Input placeholder="Date d'expiration" value={dateExpiration} onChange={e => setDateExpiration(e.target.value)} />
      <Input placeholder="Statut" value={statut} onChange={e => setStatut(e.target.value)} />

      <Button title="Enregistrer" onClick={handleSave} />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "30px auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
};
