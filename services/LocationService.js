import * as Location from "expo-location";
import notificationService from "./NotificationService";

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.locationSubscription = null;
    this.parkingSpots = [
      {
        id: 1,
        name: "Downtown Parking Garage",
        address: "123 Main St, Downtown",
        latitude: 40.7128,
        longitude: -74.006,
        available: true,
        price: "$5/hour",
      },
      {
        id: 2,
        name: "Central Park Parking",
        address: "456 Park Ave, Central",
        latitude: 40.7589,
        longitude: -73.9851,
        available: true,
        price: "$3/hour",
      },
      {
        id: 3,
        name: "Shopping Mall Parking",
        address: "789 Mall Blvd, Shopping District",
        latitude: 40.7505,
        longitude: -73.9934,
        available: true,
        price: "$4/hour",
      },
      {
        id: 4,
        name: "Airport Parking Lot",
        address: "321 Airport Rd, Terminal 1",
        latitude: 40.6413,
        longitude: -73.7781,
        available: true,
        price: "$8/hour",
      },
      {
        id: 5,
        name: "University Parking",
        address: "654 Campus Dr, University Area",
        latitude: 40.7295,
        longitude: -73.9965,
        available: true,
        price: "$2/hour",
      },
    ];
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
        // Depending on your app's needs, you might want to handle this differently.
        // For now, we'll return true if foreground is granted, as background might be optional.
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

      // If fetching current location fails, try to get the last known location
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

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Find nearby parking spots
  findNearbyParkingSpots(radius = 1000) {
    // Default 1km radius
    if (!this.currentLocation) {
      return [];
    }

    const nearbySpots = this.parkingSpots.filter((spot) => {
      const distance = this.calculateDistance(
        this.currentLocation.latitude,
        this.currentLocation.longitude,
        spot.latitude,
        spot.longitude
      );

      spot.distance = Math.round(distance);
      return distance <= radius && spot.available;
    });

    // Sort by distance
    return nearbySpots.sort((a, b) => a.distance - b.distance);
  }

  // Check for nearby parking spots and send notifications
  async checkNearbyParking() {
    if (!this.currentLocation) {
      await this.getCurrentLocation();
    }

    if (!this.currentLocation) {
      return;
    }

    const nearbySpots = this.findNearbyParkingSpots(500); // 500m radius

    // Send notifications for spots within 200m that haven't been notified yet
    nearbySpots.forEach((spot) => {
      if (spot.distance <= 200 && !this.nearbyNotificationsSent.has(spot.id)) {
        notificationService.sendNearbyParkingNotification(
          spot.name,
          spot.distance
        );
        this.nearbyNotificationsSent.add(spot.id);
      }
    });
  }

  // Simulate finding a parking spot
  async simulateParkingSpotFound() {
    if (!this.currentLocation) {
      await this.getCurrentLocation();
    }

    if (!this.currentLocation) {
      return;
    }

    const nearbySpots = this.findNearbyParkingSpots(300); // 300m radius

    if (nearbySpots.length > 0) {
      const closestSpot = nearbySpots[0];

      // Simulate finding the spot
      notificationService.sendParkingSpotFoundNotification(
        closestSpot.name,
        closestSpot.address
      );

      return closestSpot;
    }

    return null;
  }

  // Start location tracking
  async startLocationTracking() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log("Location permission denied");
        return false;
      }

      // Get initial location
      await this.getCurrentLocation();

      // Start watching location
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Update when moved 50 meters
        },
        (location) => {
          this.currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          };

          // Check for nearby parking spots
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

  // Get all parking spots (for testing)
  getAllParkingSpots() {
    return this.parkingSpots.map((spot) => ({
      ...spot,
      distance: this.currentLocation
        ? this.calculateDistance(
            this.currentLocation.latitude,
            this.currentLocation.longitude,
            spot.latitude,
            spot.longitude
          )
        : null,
    }));
  }

  // Add a new parking spot
  addParkingSpot(spot) {
    this.parkingSpots.push({
      id: Date.now(),
      ...spot,
      available: true,
    });
  }

  // Update parking spot availability
  updateParkingSpotAvailability(spotId, available) {
    const spot = this.parkingSpots.find((s) => s.id === spotId);
    if (spot) {
      spot.available = available;
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
