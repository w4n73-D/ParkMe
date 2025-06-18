import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack, Tabs } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import AuthWrapper from "./components/AuthWrapper";

const RootLayout = () => {
  return (
    <AuthProvider>
      <AuthWrapper>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="index"
            options={{ title: "Home", headerShown: false }}
          />
          <Stack.Screen
            name="about"
            options={{ title: "About", headerShown: false }}
          />
          <Stack.Screen
            name="signup"
            options={{ title: "Sign Up", headerShown: false }}
          />
          <Stack.Screen
            name="login"
            options={{ title: "Log In", headerShown: false }}
          />
          <Stack.Screen
            name="forgotpassword"
            options={{ title: "Forgot Password", headerShown: false }}
          />
          <Stack.Screen
            name="dash"
            options={{ title: "Dashboard", headerShown: false }}
          />
          <Stack.Screen
            name="change-password"
            options={{ title: "Change Password", headerShown: false }}
          />
          <Stack.Screen
            name="notification-settings"
            options={{ title: "Notification Settings", headerShown: false }}
          />
          <Stack.Screen
            name="privacy-settings"
            options={{ title: "Privacy Settings", headerShown: false }}
          />
        </Stack>
      </AuthWrapper>
    </AuthProvider>
  );
};

export default RootLayout;
