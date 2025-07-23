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
      // Request permissions
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

      // Get push token
      if (Device.isDevice) {
        this.expoPushToken = await Notifications.getExpoPushTokenAsync({
          projectId: "your-project-id", // Replace with your Expo project ID
        });
        console.log("Push token:", this.expoPushToken.data);

        // Store token in AsyncStorage
        await AsyncStorage.setItem("pushToken", this.expoPushToken.data);
      } else {
        console.log("Must use physical device for Push Notifications");
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      // Configure notification channel for Android
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
    // Listen for incoming notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    // Listen for notification responses (when user taps notification)
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        this.handleNotificationResponse(response);
      });

    // Return an object with a remove method for cleanup
    return {
      remove: () => {
        if (this.notificationListener) {
          Notifications.removeNotificationSubscription(
            this.notificationListener
          );
        }
        if (this.responseListener) {
          Notifications.removeNotificationSubscription(this.responseListener);
        }
      },
    };
  }

  // Handle notification response
  handleNotificationResponse(response) {
    const { notification } = response;
    const data = notification.request.content.data;

    // Handle different notification types
    switch (data.type) {
      case "welcome":
        // Navigate to dashboard
        break;
      case "parking_spot_found":
        // Navigate to parking details
        break;
      case "parking_reminder":
        // Navigate to parking session
        break;
      default:
        break;
    }
  }

  // Send welcome notification 5 seconds after login
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

  // Send notification when user is close to a parking spot
  async sendNearbyParkingNotification(spotName, distance) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Parking Spot Nearby! 🎯",
          body: `${spotName} is only ${distance}m away. Tap to navigate!`,
          data: {
            type: "nearby_parking",
            spotName,
            distance,
          },
          sound: "default",
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error("Error sending nearby parking notification:", error);
    }
  }

  // Send notification when user finds a parking spot
  async sendParkingSpotFoundNotification(spotName, address) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Parking Spot Found! ✅",
          body: `Great! You found a spot at ${spotName}, ${address}`,
          data: {
            type: "parking_spot_found",
            spotName,
            address,
          },
          sound: "default",
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error("Error sending parking spot found notification:", error);
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
        trigger: null, // Send immediately
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
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error("Error sending custom notification:", error);
    }
  }

  // Send proximity notification when user is near parking lots
  async sendProximityNotification(title, body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: "proximity_alert" },
          sound: "default",
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error("Error sending proximity notification:", error);
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

  // Cancel specific notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  }

  // Get push token
  getPushToken() {
    return this.expoPushToken?.data;
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;
