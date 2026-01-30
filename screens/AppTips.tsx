import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AppTips({ navigation }: any) {
  const appName = Platform.OS === "ios" ? "this app" : "this app";

  const tipsData = {
    ios: [
      { icon: "location-outline", text: "Make sure location permission is set to Always." },
      { icon: "settings-outline", text: `Go to Settings → Privacy → Location Services → ${appName} → Select “Always”.` },
      { icon: "refresh-outline", text: "Enable Background App Refresh: Settings → General → Background App Refresh." },
      { icon: "battery-half-outline", text: "Turn off Low Power Mode, as it can pause background tracking." },
      { icon: "close-circle-outline", text: "Do not force-close the app." },
    ],
    android: [
      { icon: "location-outline", text: `Allow location access all the time: Settings → Apps → ${appName} → Permissions.` },
      { icon: "battery-outline", text: "Disable battery optimization for this app." },
      { icon: "close-circle-outline", text: "Do not force stop the app." },
      { icon: "play-back-outline", text: "Allow background activity and auto-start if available." },
    ],
  };

  const TipItem = ({ icon, text }: { icon: any; text: string }) => (
    <View style={styles.tipItem}>
      <Ionicons name={icon} size={24} color="#0061d8" style={styles.tipIcon} />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );

  const Section = ({ title, tips }: { title: string; tips: typeof tipsData.ios }) => (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {tips.map((tip, index) => (
        <TipItem key={index} icon={tip.icon} text={tip.text} />
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f2f5" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Background Tracking Tips</Text>
        <View style={{ width: 28 }} /> {/* placeholder for spacing */}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Section title="iOS Users" tips={tipsData.ios} />
        <Section title="Android Users" tips={tipsData.android} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#0061d8",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
  },
});