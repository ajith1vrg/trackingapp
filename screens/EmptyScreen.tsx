import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const EmptyScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This screen is intentionally left empty.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    color: "#999",
    fontSize: 16,
  },
});
