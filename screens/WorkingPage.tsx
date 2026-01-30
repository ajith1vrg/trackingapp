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

  /* -------------------- LOAD DATA ON EVERY FOCUS -------------------- */
  const loadLocations = useCallback(() => {
    const raw = getAllLocations() as LocationRow[];

    if (!raw || raw.length === 0) {
      setCoords([]);
      return;
    }

    // IMPORTANT: DB should be ASC for polyline correctness
    const sorted = raw.sort((a, b) => a.id - b.id);

    const points = sorted.map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
    }));

    setCoords(points);

    // Fit map AFTER render
    requestAnimationFrame(() => {
      if (mapRef.current && points.length > 0) {
        mapRef.current.fitToCoordinates(points, {
          edgePadding: {
            top: 80,
            bottom: 80,
            left: 80,
            right: 80,
          },
          animated: true,
        });
      }
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Clear previous state to avoid stale map
      setCoords([]);

      // Reload fresh data
      loadLocations();

      return () => {
        // Cleanup (important for stack navigation)
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
        <MapView
          ref={mapRef}
          style={styles.map}
          key={coords.length} // 🔥 Forces fresh render every time
        >
          {coords.length > 1 && (
            <Polyline
              coordinates={coords}
              strokeColor="#007AFF"
              strokeWidth={5}
            />
          )}
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