import React, { useEffect, useState } from "react";
import { ImageBackground, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { Linking } from "react-native";

import { clearUser } from "../userSlice";
import { RootState } from "../store";
import AppHeader from "../components/AppHeader";

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { userId } = useSelector((state: RootState) => state.user);

  const [tourData, setTourData] = useState<null | {
    trip_name: string;
    customer_name: string;
    trip_date: string;
  }>(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (!userId) return;

    try {
      const response = await fetch("https://crazyholidays.in/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userId }),
      });

      const data = await response.json();

      if (data.status) {
        dispatch(clearUser());
        Toast.show({ type: "success", text1: "Logout Success", text2: data.msg });
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      } else {
        Toast.show({ type: "error", text1: "Logout Failed", text2: data.msg });
      }
    } catch (error) {
      console.error("Logout Error:", error);
      Toast.show({ type: "error", text1: "Error", text2: "Something went wrong during logout" });
    }
  };

  // ✅ Fetch tour profile
  useEffect(() => {
    if (!userId) return;

    const fetchTourProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://crazyholidays.in/api/tourprofile/?userid=${userId}`);
        const data = await response.json();

        if (data.status) {
          setTourData({
            trip_name: data.trip_name,
            customer_name: data.customer_name,
            trip_date: data.trip_date,
          });
        } else if (data.force_logout) {
          Toast.show({ type: "error", text1: "Session Expired", text2: data.msg });
          handleLogout();
        } else {
          // ✅ fallback to dummy data if no trip data
          setTourData({
            trip_name: "Sample School Educational Tour",
            customer_name: "Demo Institute, Wonderland",
            trip_date: "01/01/2025 8:00 AM - 01/01/2025 6:00 PM",
          });
          Toast.show({ type: "info", text1: "No Active Trip", text2: "Showing demo tour information." });
        }
      } catch (error) {
        console.error("TourProfile Error:", error);
        Toast.show({ type: "error", text1: "Error", text2: "Something went wrong" });
        // ✅ also show dummy tour if API fails
        setTourData({
          trip_name: "Sample School Educational Tour",
          customer_name: "Demo Institute, Wonderland",
          trip_date: "01/01/2025 8:00 AM - 01/01/2025 6:00 PM",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTourProfile();
  }, [userId]);

  return (
    <View style={styles.container}>
      <AppHeader title="Dashboard" onMenuPress={() => navigation.toggleDrawer()} />
      <Text style={styles.sectionTitle}>Your Trip</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#f4b400" />
      ) : (
        <>
          {tourData && (
            <View style={styles.tourCard}>
              <Text style={styles.tourTitle}>{tourData.trip_name}</Text>
              <Text style={styles.tourSub}>{tourData.customer_name}</Text>
              <Text style={styles.tourDate}>{tourData.trip_date}</Text>
              <View style={styles.tourActions}>
                <TouchableOpacity
                  style={styles.tourBtn}
                  onPress={() =>
                    navigation.navigate("TourDetail", { userId } as any)
                  }
                >
                  <Ionicons name="list-outline" size={35} color="#555" />
                  <Text style={styles.tourBtnText}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tourBtn} onPress={() => navigation.navigate("LocationTracker")}>
                  <Ionicons name="map-outline" size={35} color="#555" />
                  <Text style={styles.tourBtnText}>View Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tourBtn} onPress={() => navigation.navigate("Gallery" as never)}>
                  <Ionicons name="image-outline" size={35} color="#555" />
                  <Text style={styles.tourBtnText}>Photos</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}

      <Text style={styles.sectionTitle}>You can also</Text>
      <View style={styles.quickGrid}>
        {[
          { icon: "person-outline", label: "My Profile", action: () => navigation.navigate("ManagerProfile", { userId }) },
          { icon: "call-outline", label: "Contact Office" , action: () => navigation.navigate("Contact")},
          { icon: "globe-outline", label: "Visit Website", action: () => Linking.openURL("https://crazyholidays.in/") },
          { icon: "log-out-outline", label: "Sign Out", action: handleLogout },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.quickBtn} onPress={item.action}>
            <ImageBackground
              source={require("../assets/icon-background.png")}
              style={StyleSheet.absoluteFill}
              imageStyle={{ borderRadius: 10 }}
            />
            <Ionicons name={item.icon as any} size={55} color="#002e7b" />
            <Text style={styles.quickText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 40 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 14, color: "#000" },
  tourCard: { backgroundColor: "#fff", borderRadius: 10, padding: 18, borderWidth: 1, borderColor: "#ddd", marginBottom: 24 },
  tourTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },
  tourSub: { fontSize: 15, color: "#555", marginTop: 3 },
  tourDate: { fontSize: 14, color: "#666", marginTop: 8 },
  tourActions: { flexDirection: "row", marginTop: 12, justifyContent: "space-around" },
  tourBtn: { alignItems: "center" },
  tourBtnText: { fontSize: 13, color: "#555", marginTop: 2 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 12 },
  quickBtn: { width: "48%", aspectRatio: 1, borderRadius: 12, overflow: "hidden", marginBottom: 16, justifyContent: "center", alignItems: "center" },
  quickText: { marginTop: 8, fontSize: 15, fontWeight: "600", color: "#fff" },
});