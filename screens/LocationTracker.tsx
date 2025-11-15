import React, { useEffect, useState, useRef } from "react";
import { View, Text, Button, StyleSheet, FlatList, Alert, Platform } from "react-native";
import * as Location from "expo-location";
import * as SQLite from "expo-sqlite";
import MapView, { Marker, Polyline, Region } from "react-native-maps";

type LocationRecord = {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
};

type Coord = {
  latitude: number;
  longitude: number;
};

const db = SQLite.openDatabaseSync("locations.db");

export default function LocationTracker() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [tracking, setTracking] = useState<boolean>(false);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Coord | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    createTable();
    requestPermission();
    readAllLocations();
    return () => stopTracking();
  }, []);

  async function requestPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Location permission is needed to track device location.");
      setHasPermission(false);
      return;
    }
    setHasPermission(true);
  }

  function createTable() {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          latitude REAL,
          longitude REAL,
          timestamp TEXT
        );`
      );
    });
  }

  function insertLocation({ latitude, longitude }: Coord) {
    const ts = new Date().toISOString();
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO locations (latitude, longitude, timestamp) VALUES (?, ?, ?)",
        [latitude, longitude, ts],
        (_, result) => readAllLocations(),
        (_, error) => {
          console.error("Insert failed", error);
          return true;
        }
      );
    });
  }

  function readAllLocations() {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM locations ORDER BY id DESC",
        [],
        (_, { rows }) => {
          const data: LocationRecord[] = rows._array;
          setLocations(data);
          if (data.length > 0) {
            const latest = data[0];
            setCurrentLocation({ latitude: latest.latitude, longitude: latest.longitude });
          }
        }
      );
    });
  }

  async function captureOnce() {
    if (!hasPermission) {
      await requestPermission();
      if (!hasPermission) return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const { latitude, longitude } = loc.coords;
      setCurrentLocation({ latitude, longitude });
      insertLocation({ latitude, longitude });
    } catch (e) {
      console.error("Get location error", e);
    }
  }

  function startTracking() {
    if (!hasPermission) {
      Alert.alert("No permission", "Please allow location permission first.");
      return;
    }
    if (tracking) return;
    captureOnce();
    intervalRef.current = setInterval(captureOnce, 20000);
    setTracking(true);
  }

  function stopTracking() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTracking(false);
  }

  function clearAll() {
    db.transaction((tx) => {
      tx.executeSql("DELETE FROM locations", [], () => {
        setLocations([]);
        setCurrentLocation(null);
      });
    });
  }

  const polylineCoords = [...locations].reverse().map(r => ({ latitude: r.latitude, longitude: r.longitude }));

  const initialRegion: Region = {
    latitude: currentLocation ? currentLocation.latitude : 37.78825,
    longitude: currentLocation ? currentLocation.longitude : -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Location tracker (every 20s to SQLite)</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView style={styles.map} initialRegion={initialRegion}>
          {currentLocation && <Marker coordinate={currentLocation} title="Latest" description={new Date().toLocaleString()} />}
          {polylineCoords.length > 1 && <Polyline coordinates={polylineCoords} strokeWidth={4} />}
        </MapView>
      </View>

      <View style={styles.controls}>
        <Button title={tracking ? "Stop tracking" : "Start tracking"} onPress={tracking ? stopTracking : startTracking} />
        <View style={{ height: 8 }} />
        <Button title="Capture once now" onPress={captureOnce} />
        <View style={{ height: 8 }} />
        <Button title="Clear saved points" onPress={clearAll} />
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.subtitle}>Saved points (most recent first)</Text>
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>#{item.id} — {new Date(item.timestamp).toLocaleString()}</Text>
              <Text>Lat: {item.latitude.toFixed(6)}, Lon: {item.longitude.toFixed(6)}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === "android" ? 24 : 40 },
  header: { paddingHorizontal: 12, paddingBottom: 8 },
  title: { fontSize: 16, fontWeight: "600" },
  mapContainer: { height: 300, margin: 12, borderRadius: 8, overflow: "hidden" },
  map: { flex: 1 },
  controls: { paddingHorizontal: 12, marginBottom: 8 },
  listContainer: { flex: 1, paddingHorizontal: 12, paddingBottom: 12 },
  subtitle: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderColor: "#eee" },
});
