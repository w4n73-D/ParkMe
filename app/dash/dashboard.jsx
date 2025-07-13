import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import locationService from "../services/LocationService";
import notificationService from "../services/NotificationService";

const Dashboard = () => {
  const { user } = useAuth();
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbySpots, setNearbySpots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeLocation();
    return () => {
      locationService.stopLocationTracking();
    };
  }, []);

  const initializeLocation = async () => {
    setLoading(true);
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        updateNearbySpots();
      }
    } catch (error) {
      console.error("Error initializing location:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateNearbySpots = () => {
    const spots = locationService.findNearbyParkingSpots(1000); // 1km radius
    setNearbySpots(spots);
  };

  const startLocationTracking = async () => {
    setLoading(true);
    try {
      const success = await locationService.startLocationTracking();
      if (success) {
        setIsLocationTracking(true);
        Alert.alert(
          "Location Tracking Started",
          "You'll now receive notifications when you're near parking spots!"
        );
      } else {
        Alert.alert(
          "Permission Required",
          "Please enable location permissions to use this feature."
        );
      }
    } catch (error) {
      console.error("Error starting location tracking:", error);
      Alert.alert("Error", "Failed to start location tracking");
    } finally {
      setLoading(false);
    }
  };

  const stopLocationTracking = () => {
    locationService.stopLocationTracking();
    setIsLocationTracking(false);
    Alert.alert(
      "Location Tracking Stopped",
      "You'll no longer receive parking notifications."
    );
  };

  const simulateParkingSpotFound = async () => {
    setLoading(true);
    try {
      const spot = await locationService.simulateParkingSpotFound();
      if (spot) {
        Alert.alert(
          "Parking Spot Found!",
          `Great! You found a spot at ${spot.name} (${spot.distance}m away)`
        );
      } else {
        Alert.alert(
          "No Nearby Spots",
          "No parking spots found within 300m of your location."
        );
      }
    } catch (error) {
      console.error("Error simulating parking spot found:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      await notificationService.sendCustomNotification(
        "Test Notification",
        "This is a test notification from ParkMe!",
        { type: "test" }
      );
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  };

  const sendParkingReminder = async () => {
    try {
      await notificationService.sendParkingReminderNotification(
        "Downtown Parking Garage",
        15
      );
    } catch (error) {
      console.error("Error sending parking reminder:", error);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#0066cc", flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>DASHBOARD</Text>
        </View>

        <View style={styles.content}>
          {/* Location Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Services</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Ionicons
                  name={currentLocation ? "location" : "location-outline"}
                  size={24}
                  color={currentLocation ? "#4CAF50" : "#FF9800"}
                />
                <Text style={styles.statusText}>
                  {currentLocation ? "Location Active" : "Location Inactive"}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons
                  name={isLocationTracking ? "radio" : "radio-outline"}
                  size={24}
                  color={isLocationTracking ? "#4CAF50" : "#FF9800"}
                />
                <Text style={styles.statusText}>
                  {isLocationTracking ? "Tracking Active" : "Tracking Inactive"}
                </Text>
              </View>
            </View>
          </View>

          {/* Test Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Notifications</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.testButton]}
                onPress={sendTestNotification}
              >
                <Ionicons name="notifications" size={20} color="white" />
                <Text style={styles.buttonText}>Test Notification</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.testButton]}
                onPress={sendParkingReminder}
              >
                <Ionicons name="time" size={20} color="white" />
                <Text style={styles.buttonText}>Send Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: "white",
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statusItem: {
    alignItems: "center",
  },
  statusText: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
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
  primaryButton: {
    backgroundColor: "#0066cc",
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#0066cc",
  },
  testButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  spotItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  spotAddress: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  spotDistance: {
    fontSize: 12,
    color: "#0066cc",
    marginTop: 2,
  },
  spotPrice: {
    backgroundColor: "#0066cc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  priceText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  noSpotsText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
});

export default Dashboard;
