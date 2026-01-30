import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { View, Text, StyleSheet, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { RootState } from "../store";
import { clearUser } from "../userSlice";

// Screens
import BottomTabs from "./BottomTabs"; // ✅ Your bottom tab navigation
import GalleryScreen from "../screens/GalleryScreen";
import TourDetailScreen from "../screens/TourDetailScreen";
import ContactScreen from "../screens/ContactScreen";
import ManagerProfileScreen from "../screens/ManagerProfileScreen";
import LocationTracker from "../screens/LocationTracker";
import SavedLocations from "../screens/SavedLocations";
import TrackMap from "../screens/TrackMap";
import AppTipsScreen from "../screens/AppTips";
import { logoutAPI } from "../components/logoutApi";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const { navigation } = props;

  const handleLogout = async () => {
    try {
      Toast.show({
        type: "info",
        text1: "Logging out...",
      });
  
      // 🔹 API call
      if (user?.userId) {
        await logoutAPI(String(user.userId));
      }
  
        // 🔹 Clear redux
        dispatch(clearUser());
  
        Toast.show({
          type: "success",
          text1: "Logged out successfully",
        });
  
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
  
      } catch (error: any) {
        console.log("Logout error:", error);
  
        Toast.show({
          type: "error",
          text1: "Logout failed",
          text2: "Please try again",
        });
  
        // Optional: still logout locally
        dispatch(clearUser());
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, justifyContent: "space-between" }}
    >
      <View>
        <Text style={styles.greeting}>
          Hi, {user.username || "Tour Manager"}
        </Text>

        {/* ✅ Drawer Links */}
        <DrawerItem
          label="Dashboard"
          onPress={() => navigation.navigate("HomeTabs")}
        />
        <DrawerItem
          label="Active Trip"
          onPress={() => navigation.navigate("TourDetail", { userId: user.userId })}
        />
        <DrawerItem
          label="Important Contacts"
          onPress={() => navigation.navigate("Contact")}
        />
        <DrawerItem
          label="Saved Locations"
          onPress={() => navigation.navigate("SavedLocations")}
        />
        <DrawerItem
          label="Track Your Way"
          onPress={() => navigation.navigate("TrackMap")}
        />
        <DrawerItem
          label="My Profile"
          onPress={() => navigation.navigate("ManagerProfile", { userId: user.userId })}
        />
        <DrawerItem label="Logout" onPress={handleLogout} />
      </View>

      {/* ✅ Bottom Branding */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/Crazy-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  const isLoggedIn = useSelector(
    (state: RootState) => !!state.user.userId
  );

  if (!isLoggedIn) {
    return null; // or loading screen
  }
  
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* Bottom Tabs */}
      <Drawer.Screen name="HomeTabs" component={BottomTabs} />

      {/* Other screens */}
      <Drawer.Screen name="Gallery" component={GalleryScreen} />
      <Drawer.Screen name="TourDetail" component={TourDetailScreen} />
      <Drawer.Screen name="Contact" component={ContactScreen} />
      <Drawer.Screen name="SavedLocations" component={SavedLocations} />
      <Drawer.Screen name="TrackMap" component={TrackMap} />
      <Drawer.Screen name="ManagerProfile" component={ManagerProfileScreen} />
      <Drawer.Screen name="LocationTracker" component={LocationTracker} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0061d8",
    marginVertical: 10,
    marginLeft: 15,
  },
  logoContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 60,
  },
});