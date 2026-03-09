import React from "react";

import Header from "../../components/Header";
import Button from "../../components/Button";

export default function DossierScreen({ navigation }) {
  return (
    <div style={styles.container}>
      <Header title="Mon Dossier" />

      <Button
        title="Mes Demandes"
        onClick={() => navigation.navigate("MesDemandes")}
      />

      <Button
        title="Informations"
        onClick={() => navigation.navigate("Informations")}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
};
