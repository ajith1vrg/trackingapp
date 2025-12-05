// TourDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TourData = {
  trip_name?: string;
  customer_name?: string;
  trip_date?: string;
  trip_end_date?: string;
  trip_code?: string;
  class_section?: string;
  seats_remaining?: string;
};

export default function TourDetailScreen({ route, navigation }: any) {
  const { userId } = route.params ?? {};
  const [loading, setLoading] = useState(true);
  const [tour, setTour] = useState<TourData | null>(null);

  useEffect(() => {
    fetchTour();
  }, []);

  const fetchTour = async () => {
    try {
      const res = await fetch(
        `https://crazyholidays.in/api/tourprofile/?userid=${userId}`
      );
      const json = await res.json();

      if (json.status) {
        setTour(json);
      } else if (json.force_logout) {
        Alert.alert("Session expired", "Please login again", [
          { text: "OK", onPress: () => navigation.replace("Login") },
        ]);
      } else {
        Alert.alert("Error", json.msg || "Invalid response");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to fetch tour details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0061d8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <Ionicons name="person-circle-outline" size={28} color="#000" />
      </View>

      {/* Trip Info */}
      <View style={styles.section}>
        <Text style={styles.tripName}>{tour?.trip_name || "Tour Name"}</Text>
        <Text style={styles.date}>
          {tour?.trip_date || ""} to{" "}
          {tour?.trip_end_date || ""}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="school-outline" size={20} color="#000" />
          <View style={styles.infoTextWrapper}>
            <Text style={styles.label}>Program</Text>
            <Text style={styles.value}>{tour?.customer_name || "-"}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="ticket-outline" size={20} color="#000" />
          <View style={styles.infoTextWrapper}>
            <Text style={styles.label}>Trip Code</Text>
            <Text style={styles.value}>{tour?.trip_code || "-"}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={20} color="#000" />
          <View style={styles.infoTextWrapper}>
            <Text style={styles.label}>Class and Section</Text>
            <Text style={styles.value}>{tour?.class_section || "-"}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="stats-chart-outline" size={20} color="#000" />
          <View style={styles.infoTextWrapper}>
            <Text style={styles.label}>Seats Remaining</Text>
            <Text style={styles.value}>{tour?.seats_remaining || "-"}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <Text style={styles.subHeader}>You can also</Text>
      <View style={styles.actionRow}>
        <ActionButton
          label="Pay Online"
          icon="card-outline"
          backgroundImage={require("../assets/icon-background.png")}
        />
        <ActionButton
          label="Watch on Map"
          icon="map-outline"
          backgroundImage={require("../assets/icon-background.png")}
        />
      </View>
      <View style={styles.actionRow}>
        <ActionButton
          label="Tour Plan"
          icon="globe-outline"
          backgroundImage={require("../assets/icon-background.png")}
        />
        <ActionButton
          label="Announcements"
          icon="notifications-outline"
          backgroundImage={require("../assets/icon-background.png")}
        />
      </View>
    </ScrollView>
  );
}

// Reusable ActionButton
function ActionButton({
  label,
  icon,
  backgroundImage,
  onPress,
}: {
  label: string;
  icon: any;
  backgroundImage?: any;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      {backgroundImage && (
        <ImageBackground
          source={backgroundImage}
          style={StyleSheet.absoluteFill}
          imageStyle={{ borderRadius: 12 }}
        />
      )}
      <Ionicons name={icon} size={40} color="#002e7b" />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingTop: 50,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },

  section: {
    marginBottom: 20,
  },
  tripName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  date: { fontSize: 13, color: "#666", marginBottom: 16 },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  infoTextWrapper: { marginLeft: 12 },
  label: { fontSize: 13, color: "#666" },
  value: { fontSize: 15, fontWeight: "600", color: "#000" },

  subHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 12,
    color: "#000",
  },

  actionBtn: {
    width: "48%",       // two items per row
    aspectRatio: 1.5,   // slightly shorter than full square
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f8d64e", // fallback color
    },
    actionText: {
    marginTop: 4,       // smaller spacing above text
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    },
    actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    },
});