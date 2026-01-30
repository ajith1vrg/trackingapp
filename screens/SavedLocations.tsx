import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAllLocations, clearAllLocations } from "./db";
import { Ionicons } from "@expo/vector-icons";

export default function SavedLocations({ navigation }: any) {
  const [locations, setLocations] = useState<any[]>([]);

  const loadData = () => {
    const rows = getAllLocations();
    setLocations(rows);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleClear = () => {
    if (locations.length === 0) return;

    Alert.alert(
      "Clear All?",
      "This will permanently delete all saved locations.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            clearAllLocations();
            loadData();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <View style={styles.row}>
        <Ionicons name="location-outline" size={22} color="#0061d8" style={{ marginRight: 8 }} />
        <Text style={styles.coord}>Lat: {item.latitude}</Text>
        <Text style={styles.coord}>Lng: {item.longitude}</Text>
      </View>
      <Text style={styles.info}>Back to School: {item.backToSchool === 1 ? "Yes" : "No"}</Text>
      <Text style={styles.time}>Saved: {item.timestamp}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Locations</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {locations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#666" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>Location Tracking is not available</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "ios" ? 120 : 100 }}
          data={locations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "ios" ? 20 : 40, // move top bar down
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  clearText: {
    color: "#ff4d4d",
    fontWeight: "bold",
    fontSize: 14,
  },
  item: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  coord: {
    fontSize: 15,
    color: "#333",
    marginRight: 12,
  },
  info: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "gray",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
});