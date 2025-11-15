import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

type MediaItem = {
  uri: string;
  type: "photo" | "video";
  thumb?: string; // thumbnail for videos
};

export default function GalleryScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // 🔹 Pick Photo or Video
  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your gallery");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // ✅ photo + video
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled) return;

    const newItems: MediaItem[] = [];

    for (const asset of result.assets) {
      const info = await FileSystem.getInfoAsync(asset.uri);
      let size = info.size ?? 0;

      if (asset.type?.startsWith("video")) {
        // ---- VIDEO ----
        if (size > 3 * 1024 * 1024) {
          Alert.alert("Video too large", "Please select a video < 3 MB");
          continue;
        }
        const { uri: thumb } = await VideoThumbnails.getThumbnailAsync(
          asset.uri,
          { time: 1500 }
        );
        newItems.push({ uri: asset.uri, type: "video", thumb });
      } else {
        // ---- PHOTO ----
        if (size > 3 * 1024 * 1024) {
          // compress photo to <=3MB (approx 0.5 compress ratio)
          const manip = await ImageManipulator.manipulateAsync(
            asset.uri,
            [],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
          );
          const info2 = await FileSystem.getInfoAsync(manip.uri);
          size = info2.size ?? 0;
          if (size > 3 * 1024 * 1024) {
            Alert.alert("Image too large", "Could not compress below 3 MB");
            continue;
          }
          newItems.push({ uri: manip.uri, type: "photo" });
        } else {
          newItems.push({ uri: asset.uri, type: "photo" });
        }
      }
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  const toggleSelect = (uri: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(uri) ? s.delete(uri) : s.add(uri);
      return s;
    });
  };

  const deleteSelected = () => {
    if (selected.size === 0) return;
    Alert.alert(
      "Delete",
      `Delete ${selected.size} selected item(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setItems((prev) => prev.filter((m) => !selected.has(m.uri)));
            setSelected(new Set());
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: MediaItem }) => {
    const isSelected = selected.has(item.uri);
    return (
      <TouchableOpacity
        style={styles.itemWrapper}
        onPress={() => toggleSelect(item.uri)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.type === "video" ? item.thumb! : item.uri }}
          style={styles.image}
        />
        {item.type === "video" && (
          <View style={styles.videoIcon}>
            <Ionicons name="play-circle" size={22} color="#fff" />
          </View>
        )}
        {isSelected && (
          <View style={styles.checkbox}>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Gallery</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, i) => i.toString()}
        numColumns={3}
        columnWrapperStyle={styles.row}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={pickMedia}>
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={styles.actionText}>Add Photo / Video</Text>
        </TouchableOpacity>

        {selected.size > 0 && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#d32f2f" }]}
            onPress={deleteSelected}
          >
            <Ionicons name="trash-outline" size={22} color="#fff" />
            <Text style={styles.actionText}>Delete ({selected.size})</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },

  row: { justifyContent: "space-between", paddingHorizontal: 8, marginBottom: 8 },
  itemWrapper: {
    width: "32%",
    aspectRatio: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%", borderRadius: 6 },
  checkbox: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,97,216,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoIcon: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 2,
  },
bottomActions: {
  position: "absolute",
  bottom: 40,      // moved up from bottom
  left: 20,
  right: 20,
  zIndex: 10,
},
actionBtn: {
  flexDirection: "row",
  backgroundColor: "#0061d8",
  paddingVertical: 14,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 10,
  width: "100%",       // full width
},
actionText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
  marginLeft: 6,
},
});