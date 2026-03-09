import React, { useState } from "react";

import Header from "../../components/Header";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function AdresseScreen() {
  const [adresse, setAdresse] = useState("");
  const [numero, setNumero] = useState("");
  const [bis, setBis] = useState("");
  const [typeVoie, setTypeVoie] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [commune, setCommune] = useState("");
  const [pays, setPays] = useState("");
  const [tel, setTel] = useState("");
  const [mailPerso, setMailPerso] = useState("");
  const [mailPro, setMailPro] = useState("");

  const handleSave = () => {
    console.log({
      adresse,
      numero,
      bis,
      typeVoie,
      codePostal,
      commune,
      pays,
      tel,
      mailPerso,
      mailPro,
    });
    alert("Informations enregistrées !");
  };

  return (
    <div style={styles.container}>
      <Header title="Adresse" />

      <Input placeholder="Adresse personnelle" value={adresse} onChange={e => setAdresse(e.target.value)} />
      <Input placeholder="Numéro" value={numero} onChange={e => setNumero(e.target.value)} />
      <Input placeholder="Bis / Rue" value={bis} onChange={e => setBis(e.target.value)} />
      <Input placeholder="Type de voie" value={typeVoie} onChange={e => setTypeVoie(e.target.value)} />
      <Input placeholder="Code postal" value={codePostal} onChange={e => setCodePostal(e.target.value)} />
      <Input placeholder="Commune" value={commune} onChange={e => setCommune(e.target.value)} />
      <Input placeholder="Pays" value={pays} onChange={e => setPays(e.target.value)} />
      <Input placeholder="Téléphone" value={tel} onChange={e => setTel(e.target.value)} />
      <Input placeholder="Mail personnel" value={mailPerso} onChange={e => setMailPerso(e.target.value)} />
      <Input placeholder="Mail professionnel" value={mailPro} onChange={e => setMailPro(e.target.value)} />

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
