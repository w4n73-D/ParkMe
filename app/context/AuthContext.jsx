import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import notificationService from "../services/NotificationService";
import { useNotifications } from "../hooks/useNotifications";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { sendWelcomeNotification } = useNotifications();

  useEffect(() => {
    checkAuthStatus();
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
    } catch (error) {
      console.error("Error initializing notifications:", error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Don't navigate here, let the app handle navigation based on auth state
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (userData, authToken) => {
    try {
      await AsyncStorage.setItem("token", authToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);

      // Send welcome notification using the hook
      const userName =
        userData.firstName || userData.email?.split("@")[0] || "User";
      await sendWelcomeNotification(userName);

      router.replace("/dash/dashboard");
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setToken(null);
      setUser(null);

      // Cancel all notifications on logout
      await notificationService.cancelAllNotifications();

      router.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isInitialized,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
