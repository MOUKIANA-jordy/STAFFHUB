import React from "react";
import Header from "../Components/Header";
import Button from "../Components/Button";

export default function HomeScreen({ navigation }) {
  return (
    <div style={styles.container}>
      <Header title="Accueil StaffHub" />

      <Button
        title="Mon dossier"
        onClick={() => navigation.navigate("Dossier")}
      />

      <Button
        title="Activité"
        onClick={() => navigation.navigate("Activite")}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "15px",
  },
};
