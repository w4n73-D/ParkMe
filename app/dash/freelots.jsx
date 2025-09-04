import React, { useState } from "react";
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

const lotImages = [
  require("../../assets/lots/lot1.jpg"),
  require("../../assets/lots/lot2.jpg"),
  require("../../assets/lots/lot3.jpg"),
  require("../../assets/lots/lot4.jpg"),
];

// Map each parking lot image to a camera index
const lotCameraMapping = {
  0: 0, // lot1.jpg uses camera index 0
  1: 1, // lot2.jpg uses camera index 1
  2: 2, // lot3.jpg uses camera index 2
  3: 3, // lot4.jpg uses camera index 3
};

const FreeLots = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImagePress = async (index) => {
    setSelectedImage(index);
    setLoading(true);

    try {
      // Get the camera index for this parking lot
      const cameraIndex = lotCameraMapping[index] || 0;
      
      // Call the new API endpoint
      const response = await ParkingAPI.getParkingStatus(cameraIndex);
      
      console.log("API Response:", response);
      
      if (response.success) {
        const paramsForNextPage = {
          free_spots: response.emptySlots.toString(),
          total_spots: "N/A", // You might want to calculate this from predictions
          processed_image: response.image, // base64 encoded image with boxes
          timestamp: response.timestamp,
          message: response.message,
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Select a Parking Lot</Text>
        <Text style={styles.subHeaderText}>Live camera feed analysis</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.gridContainer}>
          {lotImages.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={styles.imageContainer}
              onPress={() => handleImagePress(index)}
              disabled={loading}
            >
              <Image source={image} style={styles.image} />
              <View style={styles.imageOverlay}>
                <Text style={styles.imageText}>Lot {index + 1}</Text>
                <Text style={styles.cameraText}>Camera {lotCameraMapping[index]}</Text>
              </View>
              
              {loading && selectedImage === index && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.loadingText}>Analyzing live feed...</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
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
});

export default FreeLots;