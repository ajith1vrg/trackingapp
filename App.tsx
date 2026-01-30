import React, { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import * as SQLite from "expo-sqlite";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { store, persistor, RootState } from "./store";
import LoginScreen from "./screens/loginScreen";
import DrawerNavigator from "./navigation/DrawerNavigator";

// --- Notification handler ---
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
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
        <Stack.Screen name="App" component={DrawerNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Request permissions for location & notifications
    const requestPermissions = async () => {
      const fg = await Location.requestForegroundPermissionsAsync();
      const bg = await Location.requestBackgroundPermissionsAsync();

      const notif = await Notifications.requestPermissionsAsync();
      if (fg.status !== "granted" || bg.status !== "granted") {
        console.warn("Location permissions not granted");
      }
      if (!notif.granted) {
        console.warn("Notifications permissions not granted");
      }
    };

    requestPermissions();
  }, []);

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