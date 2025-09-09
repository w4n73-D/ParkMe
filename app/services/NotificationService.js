// services/NotificationService.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notification service
  async initialize() {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return false;
      }

      if (Device.isDevice) {
        this.expoPushToken = await Notifications.getExpoPushTokenAsync({
          projectId: "your-project-id",
        });
        await AsyncStorage.setItem("pushToken", this.expoPushToken.data);
      } else {
        console.log("Must use physical device for Push Notifications");
      }

      this.setupNotificationListeners();

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      return true;
    } catch (error) {
      console.error("Error initializing notifications:", error);
      return false;
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        this.handleNotificationResponse(response);
      });

    return {
      remove: () => {
        this.notificationListener?.remove();
        this.responseListener?.remove();
      },
    };
  }

  // Handle notification response
  handleNotificationResponse(response) {
    const { notification } = response;
    const data = notification.request.content.data;

    switch (data.type) {
      case "welcome":
        break;
      case "nearby_parking":
        console.log("User tapped nearby parking notification:", data);
        break;
      case "parking_spot_found":
        break;
      case "parking_reminder":
        break;
      case "proximity_alert":
        break;
      default:
        break;
    }
  }

  // Send nearby parking notification with real data
  async sendNearbyParkingNotification(spotName, distance, availableSpots) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Parking Spot Nearby! 🎯",
          body: `${spotName} - ${availableSpots} spots available (${distance}m away)`,
          data: {
            type: "nearby_parking",
            spotName,
            distance,
            availableSpots
          },
          sound: "default",
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error sending nearby parking notification:", error);
    }
  }

  // Send notification when user finds a parking spot
  async sendParkingSpotFoundNotification(spotName, address, availableSpots = 0) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Parking Spot Found! ✅",
          body: `Great! You found ${availableSpots} spots at ${spotName}, ${address}`,
          data: {
            type: "parking_spot_found",
            spotName,
            address,
            availableSpots
          },
          sound: "default",
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error sending parking spot found notification:", error);
    }
  }

  // Send proximity notification when user is near parking lots
  async sendProximityNotification(title, body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title || "🚗 Parking Nearby!",
          body: body || "You're close to available parking spots",
          data: { type: "proximity_alert" },
          sound: "default",
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error sending proximity notification:", error);
    }
  }

  // Send welcome notification
  async sendWelcomeNotification(userName) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Welcome to ParkMe! 🚗",
          body: `Hi ${userName}, welcome back! Ready to find the perfect parking spot?`,
          data: { type: "welcome" },
          sound: "default",
        },
        trigger: { seconds: 5 },
      });
    } catch (error) {
      console.error("Error sending welcome notification:", error);
    }
  }

  // Send parking session reminder
  async sendParkingReminderNotification(spotName, timeRemaining) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Parking Session Reminder ⏰",
          body: `Your parking at ${spotName} expires in ${timeRemaining} minutes`,
          data: {
            type: "parking_reminder",
            spotName,
            timeRemaining,
          },
          sound: "default",
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error sending parking reminder notification:", error);
    }
  }

  // Send custom notification
  async sendCustomNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: "default",
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error sending custom notification:", error);
    }
  }

  // Schedule notification for later
  async scheduleNotification(title, body, trigger, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: "default",
        },
        trigger,
      });
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling notifications:", error);
    }
  }

  // Get push token
  getPushToken() {
    return this.expoPushToken?.data;
  }

  // Clean up listeners
  cleanup() {
    this.notificationListener?.remove();
    this.responseListener?.remove();
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;