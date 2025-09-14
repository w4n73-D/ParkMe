import { StyleSheet, Text, View, Linking } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider } from "./context/AuthContext"; // Corrected import path
import AuthWrapper from "./components/AuthWrapper";
import { supabase } from "../lib/supabase"; // Import supabase

const RootLayout = () => {
  const router = useRouter();

  useEffect(() => {
    // Listen for URL events (for password reset deep linking)
    const subscription = Linking.addEventListener('url', (event) => {
      const url = new URL(event.url);
      
      // Handle password reset
      if (url.pathname.includes('/reset-password')) {
        router.replace('/reset-password');
      }
    });

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

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
            name="reset-password"
            options={{ title: "Reset Password", headerShown: false }}
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
          <Stack.Screen
            name="lot"
            options={{ title: "Lot", headerShown: false }}
          />
        </Stack>
      </AuthWrapper>
    </AuthProvider>
  );
};

export default RootLayout;