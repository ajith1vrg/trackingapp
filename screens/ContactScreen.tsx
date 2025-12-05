import React from "react";
import { View, Text, StyleSheet, Linking, ScrollView, TouchableOpacity, Platform, StatusBar } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

export default function ContactScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Details</Text>
        <Ionicons name="person-circle-outline" size={26} color="#000" />
      </View>

      <ScrollView>
        {/* Map Section */}
        <MapView
        style={styles.map}
        scrollEnabled={false}
        zoomEnabled={false}
        initialRegion={{
            latitude: 13.0387,
            longitude: 77.6485,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }}
        >
        <Marker
            coordinate={{ latitude: 13.0387, longitude: 77.6485 }}
            title="Crazy Holidays"
            description="Our Office Location"
        />
        </MapView>

        {/* Location Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Location</Text>
          <Text style={styles.cardText}>
            #132, 3rd Main, {"\n"}
            Lakeview Residency Layout {"\n"}
            Horamavu Agara Post, Hennur Bande {"\n"}
            Bangalore - 560043
          </Text>
        </View>

        {/* Support Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support (9:00am to 6:00pm)</Text>
          <Text style={styles.cardText}>
            We provide excellent service to all our customers
          </Text>

          <Text style={styles.subHeading}>Email :</Text>
          <TouchableOpacity onPress={() => Linking.openURL("mailto:santhosh@crazyholidays.in")}>
            <Text style={styles.link}>santhosh@crazyholidays.in</Text>
          </TouchableOpacity>

          <Text style={styles.subHeading}>Payment Gateway :</Text>
          <TouchableOpacity onPress={() => Linking.openURL("mailto:achash@crazyholidays.in")}>
            <Text style={styles.link}>achash@crazyholidays.in</Text>
          </TouchableOpacity>

          <Text style={styles.subHeading}>Payment Gateway Contact :</Text>
          <TouchableOpacity onPress={() => Linking.openURL("tel:9513588636")}>
            <Text style={styles.link}>9513588636</Text>
          </TouchableOpacity>

          <Text style={styles.subHeading}>Sales Team Email :</Text>
          <Text style={styles.link}>sales@crazyholidays.in</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 50, // fix for status bar
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  map: {
    width: "100%",
    height: 200,
  },
  card: {
    backgroundColor: "#f9f9f9", // light background
    padding: 16,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cardTitle: {
    fontSize: 18, // reduced a bit
    fontWeight: "bold",
    color: "#003399",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15, // reduced
    color: "#333",
    lineHeight: 22,
  },
  subHeading: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
    color: "#000",
  },
  link: {
    fontSize: 15,
    color: "#0066cc",
    marginBottom: 6,
  },
});