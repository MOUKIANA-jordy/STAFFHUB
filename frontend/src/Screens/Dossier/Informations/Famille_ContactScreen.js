import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import Header from "../../Components/Header";
import Input from "../../Components/Input";
import Button from "../../Components/Button";

export default function FamilleScreen() {

  const [contactUrgence, setContactUrgence] = useState("");
  const [telephone, setTelephone] = useState("");

  const handleSave = () => {
    console.log(contactUrgence, telephone);
  };

  return (
    <View style={styles.container}>

      <Header title="Famille / Contact" />

      <Input
        placeholder="Contact d'urgence"
        value={contactUrgence}
        onChangeText={setContactUrgence}
      />

      <Input
        placeholder="Téléphone"
        value={telephone}
        onChangeText={setTelephone}
      />

      <Button title="Enregistrer" onPress={handleSave} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  }
});
