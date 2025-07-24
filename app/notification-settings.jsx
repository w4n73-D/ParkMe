import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import notificationService from "./services/NotificationService";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    parkingReminders: true,
    nearbyParking: true,
    welcomeNotifications: true,
  });
  const [loading, setLoading] = useState(false);

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

  const toggleSetting = async (key) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);

    try {
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify(newSettings)
      );
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings to AsyncStorage
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify(settings)
      );

      // Send test notification if enabled
      if (settings.welcomeNotifications) {
        await notificationService.sendCustomNotification(
          "Settings Updated",
          "Your notification preferences have been saved successfully!",
          { type: "settings_updated" }
        );
      }

      Alert.alert("Success", "Notification settings updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      Alert.alert("Error", "Failed to save notification settings");
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      await notificationService.sendCustomNotification(
        "Test Notification",
        "This is a test notification to verify your settings!",
        { type: "test" }
      );
    } catch (error) {
      console.error("Error sending test notification:", error);
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#0066cc", flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Notification Settings</Text>
        </View>

        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Welcome Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive welcome messages when you log in
              </Text>
            </View>
            <Switch
              value={settings.welcomeNotifications}
              onValueChange={() => toggleSetting("welcomeNotifications")}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.welcomeNotifications ? "#0066cc" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Nearby Parking Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified when you're close to available parking spots
              </Text>
            </View>
            <Switch
              value={settings.nearbyParking}
              onValueChange={() => toggleSetting("nearbyParking")}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.nearbyParking ? "#0066cc" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Parking Reminders</Text>
              <Text style={styles.settingDescription}>
                Receive reminders when you're close to available parking spots
              </Text>
            </View>
            <Switch
              value={settings.parkingReminders}
              onValueChange={() => toggleSetting("parkingReminders")}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.parkingReminders ? "#0066cc" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={sendTestNotification}
          >
            <Ionicons name="notifications-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Send Test Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#0066cc",
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  settingsContainer: {
    padding: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    gap: 10,
  },
  testButton: {
    backgroundColor: "#4CAF50",
  },
  saveButton: {
    backgroundColor: "#0066cc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NotificationSettings;
