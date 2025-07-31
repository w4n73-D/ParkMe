import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import notificationService from "../services/NotificationService";

export const useNotifications = () => {
  const [settings, setSettings] = useState({
    parkingReminders: true,
    paymentNotifications: true,
    promotionalOffers: false,
    securityAlerts: true,
    nearbyParking: true,
    welcomeNotifications: true,
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("notificationSettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify(newSettings)
      );
    } catch (error) {
      console.error("Error updating notification settings:", error);
    }
  };

  const sendNotification = async (type, data = {}) => {
    // Check if the specific notification type is enabled
    if (!settings[type]) {
      return false;
    }

    try {
      switch (type) {
        case "welcomeNotifications":
          await notificationService.sendWelcomeNotification(data.userName);
          break;
        case "nearbyParking":
          await notificationService.sendNearbyParkingNotification(
            data.spotName,
            data.distance
          );
          break;
        case "parkingReminders":
          await notificationService.sendParkingReminderNotification(
            data.spotName,
            data.timeRemaining
          );
          break;
        case "parkingSpotFound":
          await notificationService.sendParkingSpotFoundNotification(
            data.spotName,
            data.address
          );
          break;
        default:
          await notificationService.sendCustomNotification(
            data.title,
            data.body,
            data.extraData
          );
      }
      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  };

  const sendWelcomeNotification = async (userName) => {
    return await sendNotification("welcomeNotifications", { userName });
  };

  const sendNearbyParkingNotification = async (spotName, distance) => {
    return await sendNotification("nearbyParking", { spotName, distance });
  };

  const sendParkingReminderNotification = async (spotName, timeRemaining) => {
    return await sendNotification("parkingReminders", {
      spotName,
      timeRemaining,
    });
  };

  const sendParkingSpotFoundNotification = async (spotName, address) => {
    return await sendNotification("parkingSpotFound", { spotName, address });
  };

  const sendCustomNotification = async (title, body, extraData = {}) => {
    return await sendNotification("custom", { title, body, extraData });
  };

  return {
    settings,
    updateSettings,
    sendNotification,
    sendWelcomeNotification,
    sendNearbyParkingNotification,
    sendParkingReminderNotification,
    sendParkingSpotFoundNotification,
    sendCustomNotification,
  };
};
