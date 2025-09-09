import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ParkingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParkingHistory();
  }, []);

  const loadParkingHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem("parkingHistory");
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        // Sort by timestamp descending (newest first)
        parsedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error("Error loading parking history:", error);
      Alert.alert("Error", "Failed to load parking history");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all parking history? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("parkingHistory");
              setHistory([]);
              Alert.alert("Success", "Parking history cleared");
            } catch (error) {
              console.error("Error clearing history:", error);
              Alert.alert("Error", "Failed to clear parking history");
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyItemHeader}>
        <Text style={styles.lotName}>Lot {item.lotNumber}</Text>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
      </View>
      <View style={styles.historyItemDetails}>
        <Text style={styles.detailText}>
          Free spots: <Text style={styles.detailValue}>{item.freeSpots}</Text>
        </Text>
        {item.totalSpots && item.totalSpots !== "N/A" && (
          <Text style={styles.detailText}>
            Total spots: <Text style={styles.detailValue}>{item.totalSpots}</Text>
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parking History</Text>
        {history.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearHistory}
          >
            <Ionicons name="trash-outline" size={22} color="#f44336" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No parking history yet</Text>
            <Text style={styles.emptyStateSubText}>
              Your parking lot selections will appear here
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Recent Parking Lot Selections ({history.length})
            </Text>
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          </>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  clearButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  historyItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  lotName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0066cc",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  historyItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontWeight: "500",
    color: "#333",
  },
});

export default ParkingHistory;