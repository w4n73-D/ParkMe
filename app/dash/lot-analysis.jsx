import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const LotAnalysis = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extract parameters with fallbacks
  const free_spots = params.emptySlots || params.free_spots || "N/A";
  const total_spots = params.total_spots || "N/A";
  const processed_image = params.processed_image || params.image;
  const timestamp = params.timestamp;
  const message = params.message;

  useEffect(() => {
    if (params && Object.keys(params).length > 0) {
      setLoading(false);
    } else {
      setError("No analysis data received");
      setLoading(false);
    }
  }, [params]);

  const handleRetry = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading analysis results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Analysis Error</Text>
          <Text>.</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <View style={styles.resultSection}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, free_spots !== "N/A" && free_spots > 0 ? styles.availableCard : styles.unavailableCard]}>
              <Text style={styles.statNumber}>{free_spots}</Text>
              <Text style={styles.statLabel}>Free Spots</Text>
            </View>
            
            {total_spots !== "N/A" && (
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{total_spots}</Text>
                <Text style={styles.statLabel}>Total Spots</Text>
              </View>
            )}
          </View>

          {/* Status Message */}
          {message && (
            <View style={styles.messageContainer}>
              <Ionicons name="information-circle" size={20} color="#0066cc" />
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}

          {/* Timestamp */}
          {timestamp && (
            <View style={styles.timestampContainer}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.timestampText}>
                Analyzed: {new Date(timestamp).toLocaleString()}
              </Text>
            </View>
          )}

          {/* Processed Image */}
          {processed_image ? (
            <View style={styles.processedImageContainer}>
              <Text style={styles.imageLabel}>Processed Image</Text>
              <ExpoImage
                source={{
                  uri: `data:image/jpeg;base64,${processed_image}`,
                }}
                style={styles.processedImage}
                contentFit="contain"
                transition={1000}
              />
              <Text style={styles.imageFootnote}>
                Green boxes indicate available parking spots
              </Text>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={48} color="#ccc" />
              <Text style={styles.noImageText}>No processed image available</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="#0066cc" />
              <Text style={styles.actionButtonText}>Back to Lots</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleRetry}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                Refresh Analysis
              </Text>
            </TouchableOpacity>
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
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginVertical: 15,
  },
  retryButton: {
    backgroundColor: "#0066cc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
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
  availableCard: {
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb",
    borderWidth: 1,
  },
  unavailableCard: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    borderWidth: 1,
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
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  messageText: {
    marginLeft: 8,
    color: "#0066cc",
    flex: 1,
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  timestampText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#666",
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
  imageFootnote: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  noImageContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginTop: 10,
  },
  noImageText: {
    marginTop: 8,
    color: "#666",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#0066cc",
  },
  primaryButton: {
    backgroundColor: "#0066cc",
  },
  actionButtonText: {
    marginLeft: 8,
    color: "#0066cc",
  },
  primaryButtonText: {
    color: "white",
  },
});

export default LotAnalysis;