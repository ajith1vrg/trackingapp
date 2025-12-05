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

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const { navigation } = props;

  const handleLogout = () => {
    dispatch(clearUser());
    Toast.show({ type: "success", text1: "Logged out" });
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, justifyContent: "space-between" }}
    >
      <View>
        <Text style={styles.greeting}>
          Hi, {user.user_name || "Tour Manager"}
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
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* ✅ Bottom Tabs now inside Drawer */}
      <Drawer.Screen name="HomeTabs" component={BottomTabs} />

      {/* ✅ Other screens still accessible directly */}
      <Drawer.Screen name="Gallery" component={GalleryScreen} />
      <Drawer.Screen name="TourDetail" component={TourDetailScreen} />
      <Drawer.Screen name="Contact" component={ContactScreen} />
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