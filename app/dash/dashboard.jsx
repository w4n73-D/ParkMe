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
import MapView, { Marker, Circle } from "react-native-maps";
import locationService from "../services/LocationService";
import notificationService from "../services/NotificationService";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbySpots, setNearbySpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    initializeLocation();
    notificationService.initialize();
    const notificationSubscription =
      notificationService.setupNotificationListeners();

    return () => {
      locationService.stopLocationTracking();
      if (notificationSubscription && notificationSubscription.remove) {
        notificationSubscription.remove();
      }
    };
  }, []);

  const initializeLocation = async () => {
    setLoading(true);
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        updateMapRegion(location);
        updateNearbySpots();
        checkProximityToParkingLots(location);
      }
    } catch (error) {
      console.error("Error initializing location:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateMapRegion = (location) => {
    setRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const updateNearbySpots = () => {
    const spots = locationService.findNearbyParkingSpots(1000); // 1km radius
    setNearbySpots(spots);
  };

  const checkProximityToParkingLots = (location) => {
    const nearbyLots = locationService.findNearbyParkingSpots(300); // 300m radius
    if (nearbyLots.length > 0) {
      notificationService.sendProximityNotification(
        `You're near ${nearbyLots.length} parking lot(s)!`,
        `Check the map for available spots.`
      );
    }
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

  return (
    <SafeAreaView style={{ backgroundColor: "#0066cc", flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>DASHBOARD</Text>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {currentLocation && (
              <Circle
                center={currentLocation}
                radius={300}
                strokeColor="rgba(0, 102, 204, 0.3)"
                fillColor="rgba(0, 102, 204, 0.1)"
              />
            )}
            {nearbySpots.map((spot, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: spot.latitude,
                  longitude: spot.longitude,
                }}
                title={spot.name}
                description={`${spot.availableSpots} spots available`}
                pinColor={spot.availableSpots > 0 ? "green" : "red"}
              />
            ))}
          </MapView>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#0066cc" />
            </View>
          )}
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              isLocationTracking
                ? styles.secondaryButton
                : styles.primaryButton,
            ]}
            onPress={
              isLocationTracking ? stopLocationTracking : startLocationTracking
            }
            disabled={loading}
          >
            <Ionicons
              name={isLocationTracking ? "stop-circle" : "play-circle"}
              size={24}
              color={isLocationTracking ? "#0066cc" : "white"}
            />
            <Text
              style={[
                styles.buttonText,
                isLocationTracking && styles.secondaryButtonText,
              ]}
            >
              {isLocationTracking ? "Stop Tracking" : "Start Tracking"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.refreshButton]}
            onPress={initializeLocation}
            disabled={loading}
          >
            <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.buttonText}>Refresh</Text>
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
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#0066cc",
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#0066cc",
    flex: 1,
  },
  refreshButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#0066cc",
  },
});

export default Dashboard;
