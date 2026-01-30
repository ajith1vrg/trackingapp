import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { useFocusEffect } from "@react-navigation/native";
import { getAllLocations } from "./db";
import { Ionicons } from "@expo/vector-icons";

type LocationRow = {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  backToSchool: number;
};

export default function TrackMap({ navigation }: any) {
  const mapRef = useRef<MapView | null>(null);

  const [coords, setCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  /* -------------------- LOAD ON FOCUS -------------------- */
  const loadLocations = useCallback(() => {
    const raw = getAllLocations() as LocationRow[];

    if (!raw || raw.length === 0) {
      setCoords([]);
      return;
    }

    // Sort ASC
    const sorted = raw.sort((a, b) => a.id - b.id);

    const points = sorted.map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
    }));

    setCoords(points);

    // 🟢 CENTER ON LAST POINT ONLY (MY AREA)
    const last = points[points.length - 1];

    requestAnimationFrame(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: last.latitude,
          longitude: last.longitude,
          latitudeDelta: 0.01,   // 👈 adjust for your city
          longitudeDelta: 0.01,
        },
        700
      );
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCoords([]);
      loadLocations();

      return () => {
        setCoords([]);
      };
    }, [loadLocations])
  );

  /* -------------------- UI -------------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Track Map</Text>

        <View style={{ width: 28 }} />
      </View>

      {coords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={50}
            color="#666"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyText}>
            No locations have been marked yet
          </Text>
        </View>
      ) : (
        <MapView ref={mapRef} style={styles.map}>
          <Polyline
            coordinates={coords}
            strokeColor="#007AFF"
            strokeWidth={5}
          />
        </MapView>
      )}
    </SafeAreaView>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "ios" ? 20 : 40,
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
    textAlign: "center",
    flex: 1,
  },
  map: {
    flex: 1,
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