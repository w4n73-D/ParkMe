import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const LotAnalysis = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { free_spots, total_spots, processed_image } = params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Analysis Result</Text>
        <Text>.</Text>
      </View>
      <ScrollView style={styles.content}>
        {params ? (
          <View style={styles.resultSection}>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{free_spots ?? "N/A"}</Text>
                <Text style={styles.statLabel}>Free Spots</Text>
              </View>
              {total_spots !== "N/A" && (
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{total_spots}</Text>
                  <Text style={styles.statLabel}>Total Spots</Text>
                </View>
              )}
            </View>

            {processed_image && (
              <View style={styles.processedImageContainer}>
                <Text style={styles.imageLabel}>Processed Image</Text>
                <ExpoImage
                  source={{
                    uri: `data:image/jpeg;base64,${processed_image}`,
                  }}
                  style={styles.processedImage}
                  contentFit="contain"
                />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text>Loading results...</Text>
          </View>
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
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
  loadingContainer: {
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
    minWidth: 100,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0066cc",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  processedImageContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  processedImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
});

export default LotAnalysis;
