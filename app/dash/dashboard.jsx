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
  Linking,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Circle, Callout } from "react-native-maps";
import locationService from "../services/LocationService";
import notificationService from "../services/NotificationService";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";

// Parking lot coordinates
const PARKING_LOTS = {
  0: { latitude: 6.672834, longitude: -1.567513, name: "Lot 1", address: "Main Campus Parking" },
  1: { latitude: 6.673834, longitude: -1.568513, name: "Lot 2", address: "Science Block Parking" },
  2: { latitude: 6.674834, longitude: -1.569513, name: "Lot 3", address: "Library Parking" },
  3: { latitude: 6.675834, longitude: -1.570513, name: "Lot 4", address: "Sports Complex Parking" },
};

const Dashboard = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbySpots, setNearbySpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking");
  const [selectedLot, setSelectedLot] = useState(null);
  const mapRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();

  const [region, setRegion] = useState({
    latitude: 6.672834,
    longitude: -1.567513,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    initializeApp();
    return () => {
      locationService.stopLocationTracking();
    };
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    try {
      // Test server connection first
      const serverTest = await locationService.testServerConnection();
      if (serverTest) {
        setServerStatus("connected");
        console.log("✅ Server connection successful");
      } else {
        setServerStatus("disconnected");
        console.log("❌ Server connection failed");
      }

      // Initialize location
      await initializeLocation();
      
      // Initialize notifications
      notificationService.initialize();
      const notificationSubscription = notificationService.setupNotificationListeners();

      // Send welcome notification
      if (user?.name) {
        notificationService.sendWelcomeNotification(user.name);
      }

      return () => {
        if (notificationSubscription && notificationSubscription.remove) {
          notificationSubscription.remove();
        }
      };
    } catch (error) {
      console.error("Error initializing app:", error);
      setServerStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const initializeLocation = async () => {
    setLoading(true);
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        updateMapRegion(location);
        await updateNearbySpots();
        checkProximityToParkingLots(location);
      }
    } catch (error) {
      console.error("Error initializing location:", error);
      Alert.alert("Error", "Failed to get location");
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

  const updateNearbySpots = async () => {
    setLoading(true);
    try {
      const spots = await locationService.findNearbyParkingSpots(1000);
      setNearbySpots(spots);
      console.log("📍 Updated nearby spots:", spots.length);
    } catch (error) {
      console.error("Error updating nearby spots:", error);
      Alert.alert("Error", "Failed to load parking data");
    } finally {
      setLoading(false);
    }
  };

  const checkProximityToParkingLots = async (location) => {
    const nearbyLots = await locationService.findNearbyParkingSpots(300);
    if (nearbyLots.length > 0) {
      const availableSpots = nearbyLots.reduce((sum, lot) => sum + (lot.availableSpots || 0), 0);
      notificationService.sendProximityNotification(
        `You're near ${nearbyLots.length} parking lot(s)!`,
        `Total available spots: ${availableSpots}`
      );
    }
  };

  const centerOnUser = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const handleParkingLotPress = (spot) => {
    setSelectedLot(spot);
    Alert.alert(
      spot.name,
      `${spot.availableSpots} spots available\n${spot.distance}m away`,
      [
        {
          text: "View Details",
          onPress: () => navigateToLotDetails(spot)
        },
        {
          text: "Navigate",
          onPress: () => navigateToParkingLot(spot)
        },
        {
          text: "Open in Maps",
          onPress: () => openGoogleMapsNavigation(spot)
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const navigateToLotDetails = (spot) => {
    router.push({
      pathname: "/parking-lot-details",
      params: {
        lotId: spot.id,
        lotName: spot.name,
        availableSpots: spot.availableSpots,
        totalSpots: spot.totalSpots,
        distance: spot.distance,
        cameraIndex: spot.cameraIndex
      }
    });
  };

  const navigateToParkingLot = (spot) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: spot.latitude,
          longitude: spot.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
    }
  };

  const navigateToFreeLots = () => {
    router.push("/dash/freelots");
  };

  const openGoogleMapsNavigation = (lot) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${lot.latitude},${lot.longitude}&dirflg=d`,
      android: `google.navigation:q=${lot.latitude},${lot.longitude}`,
    });
    
    Linking.openURL(url).catch(err => {
      // Fallback to web Google Maps
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lot.latitude},${lot.longitude}&travelmode=driving`;
      Linking.openURL(webUrl).catch(err => {
        Alert.alert("Error", "Could not open maps application");
      });
    });
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case "connected": return "#28a745";
      case "disconnected": return "#dc3545";
      case "checking": return "#ffc107";
      default: return "#6c757d";
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case "connected": return "Server Connected";
      case "disconnected": return "Server Disconnected";
      case "checking": return "Checking Connection...";
      default: return "Connection Error";
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#0066cc", flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>PARKME DASHBOARD</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        {/* Server Status Banner */}
        {serverStatus !== "connected" && (
          <View style={[styles.serverBanner, { backgroundColor: getStatusColor() }]}>
            <Ionicons name="warning" size={20} color="white" />
            <Text style={styles.serverBannerText}>
              {serverStatus === "disconnected" 
                ? "Using demo data - server not connected"
                : "Checking server connection..."}
            </Text>
          </View>
        )}

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsPointsOfInterest={false}
            showsCompass={true}
            showsScale={true}
            loadingEnabled={true}
            loadingIndicatorColor="#0066cc"
            loadingBackgroundColor="#f5f5f5"
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
                onPress={() => handleParkingLotPress(spot)}
                pinColor={spot.availableSpots > 0 ? "#28a745" : "#dc3545"}
              >
                <Callout tooltip>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{spot.name}</Text>
                    <Text style={styles.calloutText}>
                      {spot.availableSpots} / {spot.totalSpots} spots available
                    </Text>
                    <Text style={styles.calloutText}>
                      {spot.distance}m away
                    </Text>
                    {spot.address && (
                      <Text style={styles.calloutAddress}>{spot.address}</Text>
                    )}
                    <TouchableOpacity 
                      style={styles.navigateButton}
                      onPress={() => openGoogleMapsNavigation(spot)}
                    >
                      <Ionicons name="navigate" size={16} color="white" />
                      <Text style={styles.navigateButtonText}>Open in Maps</Text>
                    </TouchableOpacity>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
            <Ionicons name="locate" size={24} color="#0066cc" />
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#0066cc" />
              <Text style={styles.loadingText}>
                {serverStatus === "checking" ? "Checking server..." : "Loading parking data..."}
              </Text>
            </View>
          )}
        </View>

        {/* Statistics Panel */}
        <View style={styles.statsPanel}>
          <View style={styles.statItem}>
            <Ionicons name="car-sport" size={24} color="#0066cc" />
            <Text style={styles.statNumber}>
              {nearbySpots.reduce((sum, spot) => sum + spot.availableSpots, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Available</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="business" size={24} color="#0066cc" />
            <Text style={styles.statNumber}>{nearbySpots.length}</Text>
            <Text style={styles.statLabel}>Nearby Lots</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="navigate" size={24} color="#0066cc" />
            <Text style={styles.statNumber}>
              {nearbySpots.length > 0 ? Math.min(...nearbySpots.map(s => s.distance)) : '--'}m
            </Text>
            <Text style={styles.statLabel}>Closest Lot</Text>
          </View>
        </View>

        {/* Controls Container */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.selectLotButton]}
            onPress={navigateToFreeLots}
            disabled={loading}
          >
            <Ionicons name="list" size={24} color="white" />
            <Text style={styles.buttonText}>Select Lot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.refreshButton]}
            onPress={updateNearbySpots}
            disabled={loading}
          >
            <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>

          {selectedLot && (
            <TouchableOpacity
              style={[styles.button, styles.navigateButton]}
              onPress={() => openGoogleMapsNavigation(selectedLot)}
              disabled={loading}
            >
              <Ionicons name="navigate" size={24} color="white" />
              <Text style={styles.buttonText}>Navigate</Text>
            </TouchableOpacity>
          )}
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
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  serverBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingHorizontal: 15,
    gap: 10,
  },
  serverBannerText: {
    color: "white",
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: "#0066cc",
    fontWeight: "600",
  },
  statsPanel: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  statItem: {
    alignItems: "center",
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0066cc",
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 10,
  },
  centerButton: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "white",
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    gap: 8,
    flex: 1,
  },
  selectLotButton: {
    backgroundColor: "#0066cc",
  },
  refreshButton: {
    backgroundColor: "#28a745",
  },
  navigateButton: {
    backgroundColor: "#ff6b35",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  calloutContainer: {
    width: 220,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#0066cc",
  },
  calloutText: {
    fontSize: 14,
    marginBottom: 3,
    color: "#333",
  },
  calloutAddress: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 10,
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0066cc",
    padding: 8,
    borderRadius: 5,
    justifyContent: "center",
    gap: 5,
  },
  navigateButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default Dashboard;