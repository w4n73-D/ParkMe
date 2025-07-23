import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Button,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image as ExpoImage } from "expo-image";
import axios from "axios";

const API_URL = "http://localhost:8000/process-image";

const FreeLots = () => {
  const [detectionResult, setDetectionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem("parkingHistory");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current && !loading) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        await processImage(photo.uri);
      } catch (error) {
        console.error("Camera error:", error);
        Alert.alert("Error", "Failed to take picture.");
      }
    }
  };

  const processImage = async (imageUri) => {
    setLoading(true);

    const formData = new FormData();
    const filename = imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append("image", {
      uri: imageUri,
      name: filename,
      type,
    });

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setDetectionResult(response.data);

        const newEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...response.data,
        };

        const updatedHistory = [newEntry, ...history];
        setHistory(updatedHistory);
        await AsyncStorage.setItem(
          "parkingHistory",
          JSON.stringify(updatedHistory)
        );
      } else {
        throw new Error(response.data.detail || "Failed to process image");
      }
    } catch (error) {
      console.error("Processing error:", error);
      Alert.alert("Error", error.message || "Failed to process image");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all detection history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setHistory([]);
            await AsyncStorage.removeItem("parkingHistory");
          },
        },
      ]
    );
  };

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={{ textAlign: "center" }}>
            We need your permission to show the camera
          </Text>
          <Button onPress={requestPermission} title="grant permission" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Parking Spot Detection</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Camera Section */}
        <View style={styles.cameraSection}>
          <CameraView style={styles.camera} facing="back" ref={cameraRef}>
            <View style={styles.cameraOverlay}>
              <View style={styles.topSpacer} />

              <View style={styles.captureContainer}>
                {!loading && (
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={takePicture}
                  >
                    <Ionicons name="camera" size={32} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.instructionText}>
                {loading ? "Processing image..." : "Tap to capture parking lot"}
              </Text>
            </View>
          </CameraView>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#0066cc" />
              <Text style={styles.loadingText}>Analyzing image...</Text>
            </View>
          )}
        </View>

        {/* Detection Result */}
        {detectionResult && (
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Detection Results</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {detectionResult.free_spots ?? "N/A"}
                </Text>
                <Text style={styles.statLabel}>Free Spots</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {detectionResult.total_spots ?? "N/A"}
                </Text>
                <Text style={styles.statLabel}>Total Spots</Text>
              </View>
            </View>

            {detectionResult.processed_image && (
              <View style={styles.processedImageContainer}>
                <Text style={styles.imageLabel}>Processed Image</Text>
                <ExpoImage
                  source={{
                    uri: `data:image/jpeg;base64,${detectionResult.processed_image}`,
                  }}
                  style={styles.processedImage}
                  contentFit="contain"
                />
              </View>
            )}
          </View>
        )}

        {/* History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Detection History</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={clearHistory}>
                <Ionicons name="trash" size={24} color="#ff4444" />
              </TouchableOpacity>
            )}
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="camera" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No detections yet</Text>
              <Text style={styles.emptySubtext}>
                Take a photo to get started
              </Text>
            </View>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <ExpoImage
                  source={{
                    uri: `data:image/jpeg;base64,${item.processed_image}`,
                  }}
                  style={styles.historyImage}
                  contentFit="cover"
                />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDate}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </Text>
                  <Text style={styles.historyTime}>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text style={styles.spotsText}>
                    {item.free_spots ?? "N/A"}/{item.total_spots ?? "N/A"} spots
                    free
                  </Text>
                </View>
              </View>
            ))
          )}
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
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
  },
  cameraSection: {
    height: 350,
    margin: 15,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  topSpacer: {
    flex: 1,
  },
  captureContainer: {
    alignItems: "center",
  },
  captureButton: {
    backgroundColor: "#0066cc",
    padding: 20,
    borderRadius: 50,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  instructionText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultSection: {
    margin: 15,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0066cc",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  processedImageContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  processedImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  historySection: {
    margin: 15,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: "row",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  historyInfo: {
    flex: 1,
    justifyContent: "center",
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  historyTime: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  spotsText: {
    fontSize: 14,
    color: "#0066cc",
    fontWeight: "bold",
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 15,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
});

export default FreeLots;
