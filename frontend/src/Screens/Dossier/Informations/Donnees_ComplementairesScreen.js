import React from "react";
import { View, Text, StyleSheet } from "react-native";

import Header from "../../Components/Header";

export default function DonneesScreen() {

  return (
    <View style={styles.container}>

      <Header title="Données complémentaires" />

      <Text style={styles.text}>
        Poste : Développeur
      </Text>

      <Text style={styles.text}>
        Etablissement : Paris
      </Text>

      <Text style={styles.text}>
        Type de contrat : CDI
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20
  },

  text: {
    fontSize: 16,
    marginBottom: 10
  }

});
