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
import axios from "axios";

const API_URL = "http://localhost:8000/process-video";

const lotImages = [
  require("../../assets/lots/lot1.jpg"),
  require("../../assets/lots/lot2.jpg"),
  require("../../assets/lots/lot3.jpg"),
  require("../../assets/lots/lot4.jpg"),
];

const FreeLots = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImagePress = async (image, index) => {
    setSelectedImage(index);
    setLoading(true);

    try {
      const asset = Asset.fromModule(image);
      await asset.downloadAsync();
      const imageUri = asset.localUri || asset.uri;
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      formData.append("video", {
        uri: imageUri,
        name: filename,
        type: "video/mp4",
      });
      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      if (
        response.status === 200 &&
        response.data.detections &&
        response.data.detections.length > 0
      ) {
        const firstDetection = response.data.detections.find((d) => d);

        if (firstDetection) {
          const paramsForNextPage = {
            free_spots: firstDetection[1] ?? "N/A",
            total_spots: "N/A", // Not available in the new response format
            processed_image: firstDetection[0],
          };
          router.push({
            pathname: "/dash/lot-analysis",
            params: paramsForNextPage,
          });
        } else {
          throw new Error("No valid detections found.");
        }
      } else {
        const errorMessage =
          response.data.msg ||
          "Failed to process video or no detections found.";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Processing error:", error);
      Alert.alert("Error", error.message || "Failed to process image");
    } finally {
      setLoading(false);
      setSelectedImage(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Select a Parking Lot</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.gridContainer}>
          {lotImages.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={styles.imageContainer}
              onPress={() => handleImagePress(image, index)}
              disabled={loading}
            >
              <Image source={image} style={styles.image} />
              {loading && selectedImage === index && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
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
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FreeLots;
