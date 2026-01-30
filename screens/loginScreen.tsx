import React, { useEffect, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { setLogin, setProfile } from "../userSlice";
import { RootState } from "../store";
import { getFCMToken } from "./notifications";

const { width } = Dimensions.get("window");

type RootStackParamList = {
  Login: undefined;
  AppDrawer: undefined;
};

type LoginScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList, "Login">;

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      navigation.replace("AppDrawer");
    }
  }, [user?.userId]);

  const handleLogin = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      // 🔑 Get FCM token (optional)
      const fcmToken = (await getFCMToken()) ?? "NA";

      const payload = {
        username: values.username.trim(),
        password: values.password,
        fcmid: fcmToken, // NEVER null now
      };

      const response = await fetch(
        "https://crazyholidays.in/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data?.status?.toString() === "true") {
        dispatch(
          setLogin({
            userId: data.userid.toString(),
            username: values.username,
          })
        );

        // Fetch profile
        const profileRes = await fetch(
          `https://crazyholidays.in/api/profile/${data.userid}`
        );
        const profileData = await profileRes.json();

        if (profileData?.status?.toString() === "true") {
          dispatch(
            setProfile({
              tripCode: profileData.trip_code ?? "",
              userName: profileData.user_name ?? "",
              vehicleNo: profileData.vechicle_no ?? "",
              phoneNo: profileData.phone_no ?? "",
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
          text2: data?.msg || "Invalid credentials",
        });
      }
    } catch (error) {
      console.log("Login error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to login. Please try again.",
      });
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid
      extraScrollHeight={180}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topImageHolder}>
        <Image
          source={require("../assets/Crazy-login-bg.png")}
          style={styles.topImage}
        />
        <Image
          source={require("../assets/login_border.png")}
          style={styles.borderImage}
        />
      </View>

      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.bottomSheet}>
            <Image
              source={require("../assets/Crazy-logo.png")}
              style={styles.logo}
            />
            <Text style={styles.subtitle}>Tour Manager Login</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Username"
              value={values.username}
              onChangeText={handleChange("username")}
              onBlur={handleBlur("username")}
            />
            {touched.username && errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}

            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter Password"
                secureTextEntry={!showPassword}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
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

            <Pressable style={styles.loginBtn} onPress={() => handleSubmit()}>
              <Text style={styles.loginText}>LOGIN</Text>
            </Pressable>
          </View>
        )}
      </Formik>

      <Toast />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff" },
  topImageHolder: { height: "40%" },
  topImage: { width: "100%", height: "100%" },
  borderImage: { position: "absolute", bottom: -5, width: "100%", height: 60 },
  bottomSheet: { padding: 20, alignItems: "center" },
  logo: { width: width * 0.5, height: 80 },
  subtitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", borderBottomWidth: 1, marginBottom: 10 },
  passwordWrapper: { flexDirection: "row", borderBottomWidth: 1 },
  passwordInput: { flex: 1 },
  errorText: { color: "red", fontSize: 12 },
  loginBtn: {
    backgroundColor: "#f4b400",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 8,
    marginTop: 20,
  },
  loginText: { textAlign: "center", fontWeight: "bold" },
});