// TrackingScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  Switch,
  FlatList,
  Platform,
  StyleSheet,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as SQLite from "expo-sqlite";
import KalmanFilter from "kalmanjs";

/* ----------------------- CONFIG ----------------------- */
const LOCATION_TASK = "LOCATION_TASK_V1";
const API_URL = "https://kareva.co.in/apicrazy/insert.php";

/* -------------------- Globals for background -------------------- */
let globalUserId = null;
let globalBackToSchool = false;

/* -------------------- Persistent Kalman filters -------------------- */
const kfLat = new KalmanFilter({ R: 0.01, Q: 3 });
const kfLng = new KalmanFilter({ R: 0.01, Q: 3 });

/* -------------------- SQLite Helpers -------------------- */
async function openDb() {
  if (SQLite.openDatabaseAsync) {
    return SQLite.openDatabaseAsync("trackdata.db");
  }

  const db = SQLite.openDatabase("trackdata.db");

  // Add promise helpers if needed
  if (!db.execAsync) {
    db.execAsync = (sql) =>
      new Promise((resolve, reject) =>
        db.exec([{ sql, args: [] }], false, (_, result) =>
          result ? resolve(result) : reject(result)
        )
      );
  }
  if (!db.runAsync) {
    db.runAsync = (sql, ...args) =>
      new Promise((resolve, reject) =>
        db.exec([{ sql, args }], false, (tx, result) =>
          result ? resolve(result) : reject(result)
        )
      );
  }
  if (!db.getAllAsync) {
    db.getAllAsync = (sql, ...args) =>
      new Promise((resolve, reject) =>
        db.readTransaction(
          (tx) =>
            tx.executeSql(
              sql,
              args,
              (_, { rows }) => resolve(rows._array),
              (_, err) => reject(err)
            ),
          (err) => reject(err)
        )
      );
  }

  return db;
}

/* -------------------- BACKGROUND TASK -------------------- */
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  try {
    console.log("[BG] TASK RUN", new Date().toISOString());

    if (error) {
      console.log("[BG] Task error:", error);
      return;
    }

    if (!data || !data.locations || data.locations.length === 0) {
      console.log("[BG] Empty payload");
      return;
    }

    const loc = data.locations[0];

    // ⛔ Prevent "Cannot convert undefined value to object"
    if (!loc || !loc.coords || typeof loc.coords.latitude !== "number") {
      console.log("[BG] Invalid coords:", loc);
      return;
    }

    // Raw coordinates
    let latitude = loc.coords.latitude;
    let longitude = loc.coords.longitude;

    // Kalman smoothing (persistent internal state)
    latitude = kfLat.filter(latitude);
    longitude = kfLng.filter(longitude);

    const timestamp = new Date(loc.timestamp || Date.now()).toISOString();

    const db = await openDb();

    // Tables always exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        latitude REAL,
        longitude REAL,
        timestamp TEXT,
        isBackToSchool INTEGER DEFAULT 0
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pending_uploads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payload TEXT,
        created_at TEXT
      );
    `);

    // Insert
    await db.runAsync(
      "INSERT INTO locations (userId, latitude, longitude, timestamp, isBackToSchool) VALUES (?, ?, ?, ?, ?)",
      globalUserId ?? 0,
      latitude,
      longitude,
      timestamp,
      globalBackToSchool ? 1 : 0
    );

    console.log("[BG] Saved:", latitude, longitude);

    // Upload attempt
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: globalUserId ?? 0,
          latitude,
          longitude,
          IsBackToSchool: globalBackToSchool ? 1 : 0,
        }),
      });

      console.log("[BG] Upload OK");
    } catch (uploadErr) {
      console.log("[BG] Upload failed, saving pending");

      const payload = JSON.stringify({
        userId: globalUserId ?? 0,
        latitude,
        longitude,
        IsBackToSchool: globalBackToSchool ? 1 : 0,
      });

      await db.runAsync(
        "INSERT INTO pending_uploads (payload, created_at) VALUES (?, ?)",
        payload,
        timestamp
      );
    }
  } catch (crash) {
    console.log("[BG] FATAL ERROR:", crash);
  }
});

/* -------------------- SCREEN -------------------- */
export default function TrackingScreen({ route, navigation }) {
  const { userId } = route.params ?? {};

  const [coords, setCoords] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [isBackToSchool, setIsBackToSchool] = useState(false);
  const [dbInstance, setDbInstance] = useState(null);

  const mapRef = useRef(null);

  /* Init DB & load UI data */
  useEffect(() => {
    (async () => {
      const db = await openDb();
      setDbInstance(db);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          latitude REAL,
          longitude REAL,
          timestamp TEXT,
          isBackToSchool INTEGER DEFAULT 0
        );
      `);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS pending_uploads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payload TEXT,
          created_at TEXT
        );
      `);

      await loadCoords(db);
    })();

    // Poll DB every 5 seconds for UI updates
    const poll = setInterval(() => {
      if (dbInstance) loadCoords(dbInstance);
    }, 5000);

    TaskManager.isTaskRegisteredAsync(LOCATION_TASK).then((reg) => {
      setTracking(reg);
    });

    return () => clearInterval(poll);
  }, [dbInstance]);

  /* auto-center map */
  useEffect(() => {
    if (coords.length > 0 && mapRef.current) {
      const last = coords[coords.length - 1];
      mapRef.current.animateToRegion(
        {
          latitude: last.latitude,
          longitude: last.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        600
      );
    }
  }, [coords]);

  /* load coords */
  async function loadCoords(db) {
    try {
      const d = db || dbInstance;
      if (!d) return;

      const rows = await d.getAllAsync(
        "SELECT id, userId, latitude, longitude, timestamp, isBackToSchool FROM locations ORDER BY id ASC"
      );

      const normalized = rows.map((r) => ({
        ...r,
        timestamp: r.timestamp || new Date().toISOString(),
      }));

      setCoords(normalized);

      await flushPendingUploads(d);
    } catch (e) {
      console.warn("[UI] loadCoords error:", e);
    }
  }

  /* flush pending uploads */
  async function flushPendingUploads(db) {
    try {
      const pending = await db.getAllAsync(
        "SELECT id, payload FROM pending_uploads ORDER BY id ASC LIMIT 20"
      );

      if (!pending.length) return;

      for (const p of pending) {
        try {
          const body = JSON.parse(p.payload);
          await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          await db.runAsync("DELETE FROM pending_uploads WHERE id = ?", p.id);
          console.log("[UI] flushed pending:", p.id);
        } catch (err) {
          console.log("[UI] flush failed:", err);
          break;
        }
      }
    } catch (err) {
      console.warn("[UI] flush error:", err);
    }
  }

  /* start tracking */
  async function startTracking() {
    try {
      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== "granted") {
        Alert.alert("Permission needed", "Foreground location required.");
        return;
      }

      const bg = await Location.requestBackgroundPermissionsAsync();
      if (bg.status !== "granted") {
        Alert.alert("Permission needed", "Enable 'Allow all the time'.");
        return;
      }

      globalUserId = userId ?? 0;
      globalBackToSchool = isBackToSchool;

      const options = {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 10000,
        distanceInterval: 1,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: Platform.OS === "ios",
        deferredUpdatesInterval: 10000,
        deferredUpdatesDistance: 1,
        foregroundService: {
          notificationTitle: "Route Tracking Active",
          notificationBody: "Tracking in background...",
          notificationColor: "#00aaff",
        },
      };

      await Location.startLocationUpdatesAsync(LOCATION_TASK, options);

      const reg = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
      setTracking(reg);

      if (dbInstance) await loadCoords(dbInstance);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  }

  /* stop tracking */
  async function stopTracking() {
    const reg = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
    if (reg) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    setTracking(false);
  }

  /* clear DB */
  async function clearData() {
    if (!dbInstance) return;
    Alert.alert("Confirm", "Delete all points?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await dbInstance.execAsync("DELETE FROM locations");
          await dbInstance.execAsync("DELETE FROM pending_uploads");
          setCoords([]);
        },
      },
    ]);
  }

  /* toggle */
  function onToggleBackToSchool(v) {
    setIsBackToSchool(v);
    globalBackToSchool = v;
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ height: 380 }}
        showsUserLocation
        initialRegion={{
          latitude: coords[0]?.latitude || 10,
          longitude: coords[0]?.longitude || 76,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {coords.length > 0 && (
          <>
            <Polyline coordinates={coords} strokeWidth={5} strokeColor="blue" />
            <Marker coordinate={coords[0]} pinColor="green" title="Start" />
            <Marker
              coordinate={coords[coords.length - 1]}
              pinColor="red"
              title="Latest"
            />
          </>
        )}
      </MapView>

      <View style={{ padding: 16 }}>
        <View style={styles.row}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>Back To School</Text>
          <Switch value={isBackToSchool} onValueChange={onToggleBackToSchool} />
        </View>

        <Button
          title={tracking ? "Stop Tracking" : "Start Tracking"}
          color={tracking ? "orange" : undefined}
          onPress={tracking ? stopTracking : startTracking}
        />

        <View style={{ height: 10 }} />

        <Button title="Clear Saved Data" color="red" onPress={clearData} />

        <Text style={{ fontWeight: "700", marginTop: 20 }}>Saved Points</Text>

        <FlatList
          data={coords}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={{ fontSize: 12 }}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
              <Text style={{ fontSize: 12 }}>
                Lat: {item.latitude.toFixed(6)} | Lon: {item.longitude.toFixed(6)}
              </Text>
              <Text style={{ fontSize: 12 }}>
                BackToSchool: {item.isBackToSchool ? "YES" : "NO"}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

/* -------------------- styles -------------------- */
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
});