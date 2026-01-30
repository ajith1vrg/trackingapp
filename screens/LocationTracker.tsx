import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  Switch,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";

import { initDB, saveLocation } from "./db";
import { BACKGROUND_LOCATION_TASK } from "./BackgroundTask";
import { setBackToSchoolFlag } from "./TrackingState";
import { sendLocationToAPI } from "./locationAPI";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function SimpleMapScreen({ route, navigation }: any) {
  const { userId } = route.params ?? {};

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [backToSchool, setBackToSchool] = useState(false);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef<MapView | null>(null);
  const fgSubscription = useRef<Location.LocationSubscription | null>(null);

 useEffect(() => {
  initDB();
  requestNotificationPermission();
  loadInitialLocation();

  return () => {
    stopTracking(); // ✅ call async fn, don't return it
  };
}, []);

  const requestNotificationPermission = async () => {
    await Notifications.requestPermissionsAsync();
  };

  const loadInitialLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  // ---------------- TRACKING ----------------

  const startTracking = async () => {
    setLoading(true);

    const fg = await Location.requestForegroundPermissionsAsync();
    const bg = await Location.requestBackgroundPermissionsAsync();

    if (fg.status !== "granted") {
      Alert.alert("Permission required", "Location permission needed");
      setLoading(false);
      return;
    }

    setTracking(true);

    // 🔹 Foreground live tracking
    fgSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000,
        distanceInterval: 0,
      },
      (loc) => {
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        setLocation(coords);
        saveLocation(coords.latitude, coords.longitude, backToSchool ? 1 : 0);
        sendLocationToAPI(userId, coords.latitude, coords.longitude, backToSchool);

        mapRef.current?.animateToRegion(
          {
            ...coords,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          800
        );
      }
    );

    // 🔹 Background tracking
    if (bg.status === "granted") {
      const running = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      if (!running) {
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000,
          distanceInterval: 0,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "Tracking location",
            notificationBody: "Background tracking active",
          },
        });
      }
    }

    setLoading(false);
  };

  const stopTracking = async () => {
    setTracking(false);

    fgSubscription.current?.remove();
    fgSubscription.current = null;

    const running = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (running) await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);

    if (Platform.OS !== "web") {
      Alert.alert("Tracking stopped", "Location tracking turned off");
    }
  };

  const toggleTracking = () => {
    tracking ? stopTracking() : startTracking();
  };

  const handleBackToSchoolChange = (val: boolean) => {
    setBackToSchool(val);
    setBackToSchoolFlag(val ? 1 : 0);
  };

  // ---------------- UI ----------------

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#000" />
      </TouchableOpacity>

      {/* Map (50% height) */}
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        initialRegion={{
          latitude: location?.latitude ?? 10.8505,
          longitude: location?.longitude ?? 76.2711,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {location && <Marker coordinate={location} />}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Button
            title={tracking ? "Stop Tracking" : "Start Tracking"}
            onPress={toggleTracking}
            color={tracking ? "red" : undefined}
          />
        )}

        <View style={styles.switchRow}>
          <Text style={{ fontSize: 16 }}>Back to School</Text>
          <Switch value={backToSchool} onValueChange={handleBackToSchoolChange} />
        </View>
      </View>
    </View>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  backBtn: {
    position: "absolute",
    top: 45,
    left: 15,
    zIndex: 10,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },

  map: {
    height: "50%",
    width: "100%",
  },

  controls: {
    flex: 1,
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
});