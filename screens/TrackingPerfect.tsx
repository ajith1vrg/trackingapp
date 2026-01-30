import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button, Switch, Alert, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { initDB, saveLocation } from "./db";
import { BACKGROUND_LOCATION_TASK } from "./BackgroundTask";
import { setBackToSchoolFlag } from "./TrackingState";
import { sendLocationToAPI } from "./locationAPI";

// Configure notification handler for foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true, // required in new types
    shouldShowList: true,   // required in new types
  }),
});

export default function SimpleMapScreen2({ route, navigation }: any) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [backToSchool, setBackToSchool] = useState(false);
  const { userId } = route.params ?? {};

  const mapRef = useRef<MapView | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initDB();
    requestNotificationPermission();
  }, []);

  // --- Request notification permission ---
  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Notification permissions not granted");
    }
  };

  // --- Send stop tracking notification ---
  const sendStopTrackingNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Tracking Stopped",
        body: "Background tracking has been turned off.",
      },
      trigger: null, // immediate
    });
  };

  // --- Foreground location fetch ---
  const fetchLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    setLocation(coords);
    saveLocation(coords.latitude, coords.longitude, backToSchool ? 1 : 0);
    sendLocationToAPI(userId, coords.latitude, coords.longitude, backToSchool ? 1 : 0);
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        { ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 },
        800
      );
    }
  };

  // --- Background tracking ---
  const startBackgroundTracking = async () => {
    const fg = await Location.requestForegroundPermissionsAsync();
    const bg = await Location.requestBackgroundPermissionsAsync();
    if (fg.status !== "granted" || bg.status !== "granted") return;

    const running = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (!running) {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Highest,
        showsBackgroundLocationIndicator: true,
        timeInterval: 30000,
        distanceInterval: 0,
        foregroundService: {
          notificationTitle: "Tracking location",
          notificationBody: "Background tracking active",
        },
      });
    }
  };

  const stopBackgroundTracking = async () => {
    const running = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (running) await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  };

  // --- Unified Start/Stop button ---
  const toggleTracking = () => {
    if (tracking) {
      setTracking(false);
      setLocation(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopBackgroundTracking();

      // Foreground alert
      if (Platform.OS === "web") {
        console.log("Tracking stopped");
      } else {
        Alert.alert("Tracking stopped", "Background tracking has been turned off.");
      }

      // Background notification
      sendStopTrackingNotification();
    } else {
      setTracking(true);
      fetchLocation();
      intervalRef.current = setInterval(fetchLocation, 30000);
      startBackgroundTracking();
    }
  };

  // --- Handle Back to School toggle ---
  const handleBackToSchoolChange = (val: boolean) => {
    setBackToSchool(val);
    setBackToSchoolFlag(val ? 1 : 0); // update global variable for background task
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Button
        title={tracking ? "Stop Tracking" : "Start Tracking"}
        onPress={toggleTracking}
        color={tracking ? "red" : undefined}
      />

      <View style={styles.checkboxRow}>
        <Text style={{ fontSize: 18 }}>Back to School</Text>
        <Switch value={backToSchool} onValueChange={handleBackToSchoolChange} />
      </View>

      <Button title="View Saved Locations" onPress={() => navigation.navigate("SavedLocations")} />

      {tracking && (
        <>
          {!location ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="blue" />
              <Text style={{ marginTop: 10 }}>Fetching current location...</Text>
            </View>
          ) : (
            <>
              <MapView
                ref={mapRef}
                style={styles.map}
                showsUserLocation
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker coordinate={location} title="You are here" pinColor="red" />
              </MapView>

              <View style={styles.coordsBox}>
                <Text>Latitude: {location.latitude.toFixed(6)}</Text>
                <Text>Longitude: {location.longitude.toFixed(6)}</Text>
                <Text>Back to School: {backToSchool ? "Yes (1)" : "No (0)"}</Text>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: "#fff" },
  map: { height: "50%", width: "100%", marginTop: 10 },
  center: { height: "50%", justifyContent: "center", alignItems: "center" },
  coordsBox: { alignItems: "center", paddingVertical: 15, backgroundColor: "#f0f0f0", borderTopWidth: 1, borderColor: "#ddd" },
  checkboxRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 10, paddingHorizontal: 10 },
});