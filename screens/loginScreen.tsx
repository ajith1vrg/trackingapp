import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Formik } from "formik";
import * as Yup from "yup";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setLogin, setProfile } from "../userSlice";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getFCMToken } from "./notifications";

const { width } = Dimensions.get("window");

// Stack screens
type RootStackParamList = {
  Login: undefined;
  AppDrawer: undefined;
};

// Typed navigation prop for LoginScreen
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();

  const handleLogin = async (values: { username: string; password: string }) => {
    const fcmid = await getFCMToken();
    try {
      const payload = {
      username: values.username,
      password: values.password,
      fcmid: fcmid, // constant value
    };
      // ---------------------------
      // 🚀 REAL LOGIN API (uncomment when ready)
      // ---------------------------
      const response = await fetch("https://crazyholidays.in/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // tell server we send JSON
      },
      body: JSON.stringify(payload), // convert object → JSON string
    });

      const data = await response.json();
      console.log("Login API Response:", data);
      if (data.status && data.status.toString() === "true") {
        dispatch(setLogin({ userId: data.userid.toString(), username: values.username }));

        const profileRes = await fetch(`https://crazyholidays.in/api/profile/${data.userid}`);
        const profileData = await profileRes.json();

        if (profileData.status && profileData.status.toString() === "true") {
          dispatch(
            setProfile({
              tripCode: profileData.trip_code?.toString() || "",
              userName: profileData.user_name || "",
              vehicleNo: profileData.vechicle_no || "",
              phoneNo: profileData.phone_no || "",
              isStart: profileData.is_start === 1,
            })
          );
        }

        Toast.show({
          type: "success",
          text1: "Login Successful 🎉",
          text2: data.msg,
        });

        navigation.replace("AppDrawer");
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: data.msg || "Please try again",
        });
      }
    } catch (error) {
      console.error("Login/Profile Error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong",
      });
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid
      extraScrollHeight={180}
      enableAutomaticScroll
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topImageHolder}>
        <Image
          source={require("../assets/Crazy-login-bg.png")}
          style={styles.topImage}
          resizeMode="cover"
        />
        <Image
          source={require("../assets/login_border.png")}
          style={styles.borderImage}
          resizeMode="contain"
        />
      </View>

      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={(values) => handleLogin(values)}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.bottomSheet}>
            <Image
              source={require("../assets/Crazy-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Tour Manager Login</Text>

            {/* Username */}
            <TextInput
              style={styles.input}
              placeholder="Enter Username"
              placeholderTextColor="#888"
              value={values.username}
              onChangeText={handleChange("username")}
              onBlur={handleBlur("username")}
            />
            {touched.username && errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}

            {/* Password */}
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter Password"
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Login Button */}
            <Pressable style={styles.loginBtn} onPress={() => handleSubmit()}>
              <Text style={styles.loginText}>LOGIN</Text>
            </Pressable>

            <Text style={styles.forgotText}>
              Forgot Password? <Text style={styles.link}>Request New</Text>
            </Text>
          </View>
        )}
      </Formik>

      <Toast />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", paddingBottom: 80 },
  topImageHolder: { width: "100%", height: "40%", position: "relative" },
  topImage: { width: "100%", height: "100%" },
  borderImage: { position: "absolute", bottom: -5, width: "100%", height: 60 },
  bottomSheet: { backgroundColor: "#fff", alignItems: "center", paddingHorizontal: 20, paddingVertical: 40, width: "100%" },
  logo: { width: width * 0.5, height: 80, marginBottom: 10 },
  subtitle: { fontSize: 20, fontWeight: "bold", marginBottom: 25, color: "#000" },
  input: { width: "100%", borderBottomWidth: 1, borderBottomColor: "#ccc", paddingVertical: 12, marginBottom: 12, fontSize: 16, color: "#000" },
  passwordWrapper: { width: "100%", flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#ccc", paddingVertical: 10, marginBottom: 12 },
  passwordInput: { flex: 1, fontSize: 16, color: "#000", paddingVertical: 0 },
  eyeButton: { paddingHorizontal: 8, justifyContent: "center", alignItems: "center" },
  errorText: { width: "100%", fontSize: 12, color: "red", marginBottom: 8 },
  loginBtn: { width: "100%", backgroundColor: "#f4b400", paddingVertical: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  loginText: { color: "#000", fontWeight: "bold", fontSize: 16 },
  forgotText: { marginTop: 20, fontSize: 14, color: "#333" },
  link: { color: "#f4b400", fontWeight: "bold" },
});
