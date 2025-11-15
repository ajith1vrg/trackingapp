import React from "react";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import * as SQLite from "expo-sqlite";

import { store, persistor, RootState } from "./store";
import LoginScreen from "./screens/loginScreen";
import DrawerNavigator from "./navigation/DrawerNavigator";
import BottomTabs from "./navigation/BottomTabs";
import LocationTracker from "./screens/LocationTracker";

const db = SQLite.openDatabaseSync("locations.db");

// --- Create Table
(async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL,
        longitude REAL,
        timestamp TEXT
      );
    `);
  } catch (error) {
    console.error("Error creating table:", error);
  }
})();

const LOCATION_TASK_NAME = "background-location-task";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Background Task Error:", error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    const location = locations[0];
    if (location) {
      console.log("📍 Background Location:", location.coords);
      try {
        await db.runAsync(
          "INSERT INTO locations (latitude, longitude, timestamp) VALUES (?, ?, ?)",
          [
            location.coords.latitude,
            location.coords.longitude,
            new Date().toISOString(),
          ]
        );
      } catch (err) {
        console.error("DB insert error:", err);
      }
    }
  }
});

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const user = useSelector((state: RootState) => state.user);
  const isLoggedIn = !!user.userId;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        // Drawer should be the main app container
        <Stack.Screen name="App" component={DrawerNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <RootNavigator />
          <Toast />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}