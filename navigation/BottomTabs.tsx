import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector, useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";

import DashboardScreen from "../screens/DashboardScreen";
import AppTipsScreen from "../screens/AppTips";
import TourDetailScreen from "../screens/TourDetailScreen";
import ManagerProfileScreen from "../screens/ManagerProfileScreen";
import { logoutAPI } from "../components/logoutApi";

import { clearUser } from "../userSlice";
import { RootState } from "../store";

const Tab = createBottomTabNavigator();

export default function BottomTabs({ navigation }: any) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

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

  const CustomTabBar = ({ state, navigation }: any) => {
    const labels = ["Dashboard", "Profile", "My Trip", "Tips", "Signout"];
    const icons = ["home", "person", "public", "lightbulb", "logout"];

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
            navigation.navigate(route.name);
          };

          // Floating center button (My Trip)
          if (isCenter) {
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
          }

          // Normal tabs
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabItem}
            >
              <Icon
                name={icons[index]}
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
                {labels[index]}
              </Text>
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
      <>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Profile" component={ManagerProfileScreen} />
        <Tab.Screen
          name="TourDetail"
          component={TourDetailScreen}
          initialParams={{ userId: user.userId }}
        />
        <Tab.Screen name="Tips" component={AppTipsScreen} />
        <Tab.Screen name="Logout" component={ManagerProfileScreen} />
      </>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom:60,
    height: 120,
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
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
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