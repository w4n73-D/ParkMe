import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const Freelots = () => {
  // Sample data for available lots
  const availableLots = [
    { id: "A1", available: true },
    { id: "A2", available: true },
    { id: "A3", available: false },
    { id: "A4", available: false },
    { id: "B1", available: true },
    { id: "B2", available: false },
    { id: "B3", available: true },
    { id: "B4", available: true },
    { id: "C1", available: false },
    { id: "C2", available: true },
    { id: "C3", available: true },
    { id: "C4", available: false },
    { id: "D1", available: true },
    { id: "D2", available: true },
    { id: "D3", available: true },
    { id: "D4", available: false },
  ];

  // Function to render lot item
  const renderLot = (lot) => (
    <TouchableOpacity
      key={lot.id}
      onPress={() => {
        console.log(lot.id);
        router.navigate(`/lot?lot=${lot.id}`);
      }}
      style={[
        styles.lotItem,
        lot.available ? styles.availableLot : styles.unavailableLot,
      ]}
      disabled={!lot.available}
    >
      <Text style={styles.lotId}>{lot.id}</Text>
      {lot.available ? (
        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
      ) : (
        <Ionicons name="close-circle" size={18} color="#F44336" />
      )}
    </TouchableOpacity>
  );

  // Group lots into rows for the grid
  const renderGrid = () => {
    const rows = [];
    const itemsPerRow = 4;

    for (let i = 0; i < availableLots.length; i += itemsPerRow) {
      const rowItems = availableLots.slice(i, i + itemsPerRow);
      rows.push(
        <View key={i} style={styles.row}>
          {rowItems.map((lot) => renderLot(lot))}
        </View>
      );
    }

    return rows;
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#0066cc", flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>AVAILABLE LOTS</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {availableLots.filter((lot) => lot.available).length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {availableLots.filter((lot) => !lot.available).length}
            </Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{availableLots.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.availableLot]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.unavailableLot]} />
            <Text style={styles.legendText}>Occupied</Text>
          </View>
        </View>

        <ScrollView style={styles.gridContainer}>{renderGrid()}</ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    paddingBottom: 200,
  },
  header: {
    backgroundColor: "#0066cc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 30,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    height: "70%",
    width: 1,
    backgroundColor: "#ddd",
    alignSelf: "center",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: "#666",
  },
  gridContainer: {
    padding: 20,
    height: "100%",
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  lotItem: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  availableLot: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  unavailableLot: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#F44336",
    opacity: 0.7,
  },
  lotId: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default Freelots;
