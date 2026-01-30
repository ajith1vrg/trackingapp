import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveLocation } from "./db";
import { sendLocationToAPI } from "./locationAPI";

export const BACKGROUND_LOCATION_TASK = "background-location-task";

let lastSent = 0;

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Background task error:", error);
    return;
  }

  if (!data) return;

  const locations = (data as any)?.locations as Location.LocationObject[];
  const loc = locations?.[0];
  if (!loc) return;

  const now = Date.now();
  if (now - lastSent < 10000) return; // throttle AFTER valid fix

  lastSent = now;

  try {
    const { latitude, longitude } = loc.coords;

    // ✅ READ FLAGS FROM STORAGE (NOT task data)
    const backToSchoolStr = await AsyncStorage.getItem("BACK_TO_SCHOOL");
    const backToSchool = backToSchoolStr === "1" ? 1 : 0;

    const userIdStr = await AsyncStorage.getItem("TRACKING_USER_ID");
    if (!userIdStr) {
      console.log("No userId found for background task");
      return;
    }

    const userId = Number(userIdStr);
    if (Number.isNaN(userId)) {
      console.log("Invalid userId:", userIdStr);
      return;
    }

    // Optional local save (safe)
    await saveLocation(latitude, longitude, backToSchool);

    // Send to API
    await sendLocationToAPI(userId, latitude, longitude, backToSchool);

    console.log(
      "📍 Sent background location:",
      latitude,
      longitude,
      "speed:",
      loc.coords.speed
    );
  } catch (err) {
    console.error("Background task processing error:", err);
  }
});