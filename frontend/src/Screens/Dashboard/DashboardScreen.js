import React from "react";
import Button from "../Components/Button";

export default function DashboardScreen({ navigation }) {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard RH</h1>

      <Button
        title="👥 Salariés"
        onClick={() => navigation.navigate("Employees")}
      />

      <Button
        title="📅 Demande de congés"
        onClick={() => navigation.navigate("LeaveRequest")}
      />

      <Button
        title="👤 Profil"
        onClick={() => navigation.navigate("Profile")}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  title: {
    fontSize: "30px",
    fontWeight: "bold",
    marginBottom: "40px",
    textAlign: "center",
  },
};
