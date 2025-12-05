import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector, useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";

import DashboardScreen from "../screens/DashboardScreen";
import GalleryScreen from "../screens/GalleryScreen"; // will use as Tips
import TourDetailScreen from "../screens/TourDetailScreen"; // My Trip
import ContactScreen from "../screens/ContactScreen"; // Profile
import ManagerProfileScreen from "../screens/ManagerProfileScreen"; // Signout fallback

import { clearUser } from "../userSlice";
import { RootState } from "../store";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

export default function BottomTabs({ navigation }: any) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const handleLogout = () => {
    dispatch(clearUser());
    Toast.show({ type: "success", text1: "Logged out" });
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const tabNames = ["Dashboard", "ManagerProfile", "TourDetail", "Gallery", "Logout"];
    const tabLabels = ["Dashboard", "Profile", "My Trip", "Tips", "Signout"];
    const tabIcons = ["home", "person", "public", "lightbulb", "logout"];

    return (
      <View style={styles.tabBarContainer}>
        {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const isCenter = route.name === "TourDetail";

            const onPress = () => {
            if (route.name === "Logout") {
                handleLogout();
                return;
            }

            const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
            }
            };

            // Normal tab button
            if (!isCenter) {
            return (
                <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.8}
                style={styles.tabItem}
                >
                <Icon
                    name={tabIcons[index]}
                    size={24}
                    color={isFocused ? "#0061d8" : "#999"}
                />
                <Text
                    style={{
                    fontSize: 12,
                    color: isFocused ? "#0061d8" : "#999",
                    marginTop: 2,
                    }}
                >
                    {tabLabels[index]}
                </Text>
                </TouchableOpacity>
            );
            }

            // Floating center button
            return (
            <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.9}
                style={styles.centerTabWrapper}
            >
                <View style={styles.centerTab}>
                <Icon name="public" size={30} color="#fff" />
                </View>
                <Text style={styles.centerLabel}>My Trip</Text>
            </TouchableOpacity>
            );
        })}
        </View>

    );
  };

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Contact" component={ManagerProfileScreen} />
      <Tab.Screen
        name="TourDetail"
        component={TourDetailScreen}
        initialParams={{ userId: user.userId }}
      />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Logout" component={ManagerProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom:50,
    height: 100,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTabWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  centerTab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    elevation: 10,
  },
  centerLabel: {
    color: "#999",
    fontSize: 12,
    marginTop: -2,
  },
});