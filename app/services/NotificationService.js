// services/NotificationService.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  // Initialize notification service
  async initialize() {
    if (this.isInitialized) return true;
    
    try {
      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permissions not granted");
        this.isInitialized = true;
        return true; // Continue with local notifications
      }

      // Try to get push token but don't fail if it doesn't work
      try {
        if (Device.isDevice) {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          
          // Only try to get push token if we have a valid projectId
          if (projectId && this.isValidUUID(projectId)) {
            this.expoPushToken = await Notifications.getExpoPushTokenAsync({
              projectId: projectId,
            });
            await AsyncStorage.setItem("pushToken", this.expoPushToken.data);
            console.log("Expo Push Token obtained successfully");
          } else {
            console.warn("Invalid or missing projectId, using local notifications only");
          }
        } else {
          console.log("Must use physical device for Push Notifications");
        }
      } catch (tokenError) {
        console.warn("Push notifications not available, using local notifications only:", tokenError.message);
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

      this.isInitialized = true;
      console.log("Notifications initialized successfully");
      return true;

    } catch (error) {
      console.warn("Error initializing notifications, continuing without them:", error.message);
      this.isInitialized = true; // Still mark as initialized to prevent repeated attempts
      return false;
    }
  }

  // Helper function to validate UUID format
  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
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

  // Send local notification (works without push token)
  async sendLocalNotification(title, body, data = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
          sound: true,
        },
        trigger: null,
      });
      
      console.log('Local notification sent:', title);
    } catch (error) {
      console.warn('Error sending local notification, using alert fallback:', error.message);
      // Fallback to alert
      Alert.alert(title, body);
    }
  }

  // Send welcome notification
  async sendWelcomeNotification(userName) {
    await this.sendLocalNotification(
      'Welcome to ParkMe! 🚗',
      `Hi ${userName}, welcome back! Ready to find the perfect parking spot?`,
      { type: 'welcome' }
    );
  }

  // Send proximity notification
  async sendProximityNotification(title, body) {
    await this.sendLocalNotification(
      title || '🚗 Parking Nearby!',
      body || "You're close to available parking spots",
      { type: 'proximity_alert' }
    );
  }

  // Clean up listeners
  cleanup() {
    this.notificationListener?.remove();
    this.responseListener?.remove();
  }

  // Check if push notifications are available
  hasPushNotifications() {
    return this.expoPushToken !== null;
  }

  // Get push token
  getPushToken() {
    return this.expoPushToken?.data;
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;