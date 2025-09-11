import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Asset } from "expo-asset";
import { ParkingAPI } from "../../services/apiService"; // Import the API service
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const lotImages = [
  require("../../assets/lots/lot1.jpg"),
  require("../../assets/lots/lot2.jpg"),
  require("../../assets/lots/lot3.jpg"),
  require("../../assets/lots/lot4.jpg"),
];

// Map each parking lot image to a camera index AND lot name
const lotConfigurations = {
  0: { 
    cameraIndex: 0, 
    name: "College of Science", 
    shortName: "Front Parking Lot" 
  },
  1: { 
    cameraIndex: 1, 
    name: "New Pharmacy Block", 
    shortName: "Side Parking Lot" 
  },
  2: { 
    cameraIndex: 2, 
    name: "Pharmacy Building", 
    shortName: "Front Parking Lot" 
  },
  3: { 
    cameraIndex: 3, 
    name: "Sports Complex Parking", 
    shortName: "Sports Complex" 
  },
};

const FreeLots = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "favorites"
  const [favorites, setFavorites] = useState([]);

  // Load favorites from storage on component mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem("favoriteLots");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const toggleFavorite = async (lotIndex) => {
    try {
      let newFavorites;
      if (favorites.includes(lotIndex)) {
        newFavorites = favorites.filter((fav) => fav !== lotIndex);
      } else {
        newFavorites = [...favorites, lotIndex];
      }
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem("favoriteLots", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Error saving favorite:", error);
      Alert.alert("Error", "Failed to update favorites");
    }
  };

  const saveParkingHistory = async (lotNumber, freeSpots, totalSpots = "N/A") => {
    try {
      const lotConfig = lotConfigurations[lotNumber - 1];
      const historyItem = {
        lotNumber,
        lotName: lotConfig.name,
        freeSpots,
        totalSpots,
        timestamp: new Date().toISOString(),
      };

      const storedHistory = await AsyncStorage.getItem("parkingHistory");
      let history = storedHistory ? JSON.parse(storedHistory) : [];
      
      // Add new item to beginning of array
      history.unshift(historyItem);
      
      // Keep only last 100 items to prevent storage issues
      if (history.length > 100) {
        history = history.slice(0, 100);
      }
      
      await AsyncStorage.setItem("parkingHistory", JSON.stringify(history));
    } catch (error) {
      console.error("Error saving parking history:", error);
    }
  };

  const handleImagePress = async (index) => {
    setSelectedImage(index);
    setLoading(true);

    try {
      // Get the camera index for this parking lot
      const cameraIndex = lotConfigurations[index].cameraIndex;
      
      // Call the new API endpoint
      const response = await ParkingAPI.getParkingStatus(cameraIndex);
      
      console.log("API Response:", response);
      
      if (response.success) {
        // Save to parking history
        await saveParkingHistory(index + 1, response.emptySlots.toString());
        
        const paramsForNextPage = {
          free_spots: response.emptySlots.toString(),
          total_spots: "N/A",
          processed_image: response.image,
          timestamp: response.timestamp,
          message: response.message,
          camera_index: cameraIndex.toString(),
          lot_name: lotConfigurations[index].name, // Add lot name
        };
        
        router.push({
          pathname: "/dash/lot-analysis",
          params: paramsForNextPage,
        });
      } else {
        throw new Error(response.message || "Failed to get parking status");
      }
    } catch (error) {
      console.error("Processing error:", error);
      Alert.alert("Error", error.message || "Failed to process parking lot");
    } finally {
      setLoading(false);
      setSelectedImage(null);
    }
  };

  // Filter lots based on active tab
  const filteredLots = activeTab === "favorites" 
    ? lotImages.filter((_, index) => favorites.includes(index))
    : lotImages;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Select a Parking Lot</Text>
        <Text style={styles.subHeaderText}>Live camera feed analysis</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>
            All Lots
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "favorites" && styles.activeTab]}
          onPress={() => setActiveTab("favorites")}
        >
          <Text style={[styles.tabText, activeTab === "favorites" && styles.activeTabText]}>
            Favorites
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {filteredLots.length === 0 && activeTab === "favorites" ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No favorite lots yet</Text>
            <Text style={styles.emptyStateSubText}>
              Tap the heart icon on any lot to add it to favorites
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredLots.map((image, index) => {
              const originalIndex = lotImages.indexOf(image);
              const lotConfig = lotConfigurations[originalIndex];
              
              return (
                <TouchableOpacity
                  key={originalIndex}
                  style={styles.imageContainer}
                  onPress={() => handleImagePress(originalIndex)}
                  disabled={loading}
                >
                  <Image source={image} style={styles.image} />
                  <View style={styles.imageOverlay}>
                    <Text style={styles.imageText}>{lotConfig.name}</Text>
                    <Text style={styles.cameraText}>{lotConfig.shortName}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(originalIndex)}
                    disabled={loading}
                  >
                    <Ionicons 
                      name={favorites.includes(originalIndex) ? "heart" : "heart-outline"} 
                      size={24} 
                      color={favorites.includes(originalIndex) ? "#ff4757" : "white"} 
                    />
                  </TouchableOpacity>
                  
                  {loading && selectedImage === originalIndex && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color="#ffffff" />
                      <Text style={styles.loadingText}>Analyzing live feed...</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            📷 Each parking lot is monitored by a live camera
          </Text>
          <Text style={styles.infoText}>
            ⚡ Real-time slot detection analysis
          </Text>
          <Text style={styles.infoText}>
            🅿️ Tap any lot to see current availability
          </Text>
          <Text style={styles.infoText}>
            ❤️ Tap the heart icon to add to favorites
          </Text>
          <Text style={styles.infoText}>
            🗺️ Get turn-by-turn directions after analysis
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0066cc",
  },
  header: {
    backgroundColor: "#0066cc",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subHeaderText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#0066cc",
    borderBottomWidth: 1,
    borderBottomColor: "#0052a3",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "white",
  },
  tabText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  activeTabText: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
  },
  imageContainer: {
    width: "45%",
    aspectRatio: 1,
    margin: 5,
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 8,
  },
  imageText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  cameraText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontStyle: "italic",
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 14,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "white",
    margin: 15,
    borderRadius: 10,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default FreeLots;