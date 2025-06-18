import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";

const AuthWrapper = ({ children }) => {
  const { user, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (user) {
        // User is authenticated, navigate to dashboard
        router.replace("/dash/dashboard");
      } else {
        // User is not authenticated, navigate to home
        router.replace("/");
      }
    }
  }, [user, isLoading, isInitialized]);

  if (isLoading || !isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
});

export default AuthWrapper;
