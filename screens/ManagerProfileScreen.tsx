// ManagerProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ProfileData = {
  user_name?: string;
  phone_no?: string;
  vechicle_no?: string;
  email?: string;
  address?: string;
};

export default function ManagerProfileScreen({ route, navigation }: any) {
  const { userId } = route.params ?? {};
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`https://crazyholidays.in/api/profile/?userid=${userId}`);
      const json = await res.json();

      if (json.status) {
        setProfile({
          user_name: json.user_name,
          phone_no: json.phone_no,
          vechicle_no: json.vechicle_no,
          email: "",
          address: "",
        });
      } else {
        setProfile({ user_name: "", phone_no: "", vechicle_no: "", email: "", address: "" });
      }
    } catch (err) {
      setProfile({ user_name: "", phone_no: "", vechicle_no: "", email: "", address: "" });
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
        <Text style={styles.headerTitle}>Tour Manager</Text>
        <Ionicons name="person-circle-outline" size={28} color="#000" />
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>My Profile</Text>
        <View style={styles.cardBody}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{profile?.user_name}</Text>

          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{profile?.phone_no}</Text>

          <Text style={styles.label}>Vehicle No</Text>
          <Text style={styles.value}>{profile?.vechicle_no}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile?.email}</Text>

          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{profile?.address}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },

  card: {
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  cardHeader: {
    backgroundColor: "#f0f6ff",
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    fontSize: 17,
    fontWeight: "bold",
    color: "#004aad",
  },
  cardBody: { padding: 16 },
  label: { fontSize: 15, color: "#444", marginTop: 8 },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
});