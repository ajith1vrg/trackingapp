import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TourCardProps {
  title: string;
  school: string;
  pax: number;
  date: string;
}

export default function TourCard({ title, school, pax, date }: TourCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.tourTitle}>{title}</Text>
      <Text style={styles.tourSub}>{school}</Text>
      <Text style={styles.tourSub}>{pax} PAX</Text>
      <Text style={styles.tourDate}>Departed on: {date}</Text>
      <View style={styles.tourActions}>
        <TouchableOpacity style={styles.tourBtn}>
          <Ionicons name="list-outline" size={20} color="#555" />
          <Text style={styles.tourBtnText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tourBtn}>
          <Ionicons name="map-outline" size={20} color="#555" />
          <Text style={styles.tourBtnText}>View Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tourBtn}>
          <Ionicons name="image-outline" size={20} color="#555" />
          <Text style={styles.tourBtnText}>Photos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 24,
    borderTopWidth: 4,
    borderTopColor: "green", // ✅ active trip highlight
  },
  tourTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },
  tourSub: { fontSize: 15, color: "#555", marginTop: 3 },
  tourDate: { fontSize: 14, color: "#666", marginTop: 8 },
  tourActions: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-around",
  },
  tourBtn: { alignItems: "center" },
  tourBtnText: { fontSize: 13, color: "#555", marginTop: 2 },
});