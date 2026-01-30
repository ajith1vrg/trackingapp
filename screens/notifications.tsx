// notifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

export async function getFCMToken(): Promise<string | null> {
  try {
    // FCM only works on real devices
    if (!Device.isDevice) {
      console.log("Not a physical device, skipping FCM");
      return null;
    }

    // 1️⃣ Check / request notification permission
    const perm = await Notifications.getPermissionsAsync();
    let finalStatus = perm.status;

    if (finalStatus !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      finalStatus = req.status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // 2️⃣ Get FCM token (Android)
    const deviceToken = await Notifications.getDevicePushTokenAsync();

    if (!deviceToken?.data) {
      console.log("FCM token not available yet");
      return null;
    }

    return deviceToken.data; // ✅ Always string
  } catch (error) {
    console.log("FCM token error:", error);
    return null;
  }
}