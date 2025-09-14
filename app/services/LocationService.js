// services/LocationService.js
import * as Location from "expo-location";
import notificationService from "./NotificationService";

const API_BASE_URL = "https://b0c148c84337.ngrok-free.app"; // Change to your server IP if needed

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.locationSubscription = null;
    this.nearbyNotificationsSent = new Set();
  }

  // Request location permissions
  async requestPermissions() {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") {
        console.error("Foreground location permission not granted");
        return false;
      }

      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== "granted") {
        console.error("Background location permission not granted");
      }

      return true;
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  }

  // Get current location
  async getCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };

      return this.currentLocation;
    } catch (error) {
      console.error("Error getting current location:", error);
      
      try {
        const lastKnownLocation = await Location.getLastKnownPositionAsync();
        if (lastKnownLocation) {
          this.currentLocation = {
            latitude: lastKnownLocation.coords.latitude,
            longitude: lastKnownLocation.coords.longitude,
            accuracy: lastKnownLocation.coords.accuracy,
          };
          return this.currentLocation;
        }
      } catch (lastKnownError) {
        console.error("Error getting last known location:", lastKnownError);
      }

      return null;
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // ==================== NEW INTEGRATION FUNCTIONS ====================

  // Test connection to FastAPI server
  async testServerConnection() {
    try {
      console.log('🌐 Testing connection to server...');
      const response = await fetch(`${API_BASE_URL}/api/test-connection`);
      const data = await response.json();
      console.log('✅ Server connection successful:', data);
      return data;
    } catch (error) {
      console.error('❌ Cannot connect to server:', error);
      return null;
    }
  }

  // Fetch real parking data from FastAPI server
  async fetchRealParkingData(radius = 1000) {
    if (!this.currentLocation) {
      await this.getCurrentLocation();
    }

    if (!this.currentLocation) {
      return [];
    }

    try {
      console.log('📡 Fetching real parking data from server...');
      const response = await fetch(
        `${API_BASE_URL}/api/nearby-parking?lat=${this.currentLocation.latitude}&lng=${this.currentLocation.longitude}&radius=${radius}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Received parking data:', data.spots?.length, 'spots');
      return data.spots || [];
      
    } catch (error) {
      console.error('❌ Error fetching parking data:', error);
      return this.getFallbackParkingSpots();
    }
  }

  // Fallback mock data (when API is unavailable)
  getFallbackParkingSpots() {
    if (!this.currentLocation) return [];
    
    const mockSpots = [
      {
        id: 1,
        name: "Main Parking Garage",
        address: "123 Main St",
        latitude: this.currentLocation.latitude + 0.001,
        longitude: this.currentLocation.longitude + 0.001,
        availableSpots: Math.floor(Math.random() * 20),
        totalSpots: 50,
        distance: Math.round(this.calculateDistance(
          this.currentLocation.latitude,
          this.currentLocation.longitude,
          this.currentLocation.latitude + 0.001,
          this.currentLocation.longitude + 0.001
        )),
        cameraIndex: 0
      },
      {
        id: 2,
        name: "Central Parking Lot",
        address: "456 Center Ave",
        latitude: this.currentLocation.latitude - 0.002,
        longitude: this.currentLocation.longitude + 0.002,
        availableSpots: Math.floor(Math.random() * 15),
        totalSpots: 30,
        distance: Math.round(this.calculateDistance(
          this.currentLocation.latitude,
          this.currentLocation.longitude,
          this.currentLocation.latitude - 0.002,
          this.currentLocation.longitude + 0.002
        )),
        cameraIndex: 1
      }
    ];
    
    return mockSpots.sort((a, b) => a.distance - b.distance);
  }

  // Find nearby parking spots (now uses real API)
  async findNearbyParkingSpots(radius = 1000) {
    return await this.fetchRealParkingData(radius);
  }

  // Get parking lot details from API
  async getParkingLotDetails(lotId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parking-lot/${lotId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching parking lot details:", error);
      return null;
    }
  }

  // Get live camera feed for parking lot
  async getLiveCameraFeed(lotId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/live-feed/${lotId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching live feed:", error);
      return null;
    }
  }

  // ==================== EXISTING FUNCTIONS (UPDATED) ====================

  // Check for nearby parking spots and send notifications
  async checkNearbyParking() {
    if (!this.currentLocation) {
      await this.getCurrentLocation();
    }

    if (!this.currentLocation) {
      return;
    }

    const nearbySpots = await this.findNearbyParkingSpots(500);

    nearbySpots.forEach((spot) => {
      if (spot.distance <= 200 && !this.nearbyNotificationsSent.has(spot.id)) {
        notificationService.sendNearbyParkingNotification(
          spot.name,
          spot.distance,
          spot.availableSpots
        );
        this.nearbyNotificationsSent.add(spot.id);
      }
    });
  }

  // Start location tracking
  async startLocationTracking() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log("Location permission denied");
        return false;
      }

      await this.getCurrentLocation();

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 50,
        },
        (location) => {
          this.currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          };

          this.checkNearbyParking();
        }
      );

      return true;
    } catch (error) {
      console.error("Error starting location tracking:", error);
      return false;
    }
  }

  // Stop location tracking
  stopLocationTracking() {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  // Clear nearby notifications cache
  clearNearbyNotificationsCache() {
    this.nearbyNotificationsSent.clear();
  }
}

// Create singleton instance
const locationService = new LocationService();
export default locationService;