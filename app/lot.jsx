import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

const lot1 = require("../assets/lots/lot1.jpg");
const lot2 = require("../assets/lots/lot2.jpg");
const lot3 = require("../assets/lots/lot3.jpg");
const lot4 = require("../assets/lots/lot4.jpg");

const lotImages = [lot1, lot2, lot3, lot4];

function LotScreen() {
  const { lot } = useLocalSearchParams();
  console.log(lot);
  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <View style={styles.headerButton}>
          <Ionicons
            onPress={() => router.back()}
            name="chevron-back"
            size={24}
            color="black"
          />
        </View>
        <Text style={styles.headerText}>
          Lot <Text style={{ color: "blue" }}>{lot}</Text>
        </Text>
        <View style={styles.headerButton}></View>
      </View>
      <View style={styles.lotContainer}>
        {/* match the lot number with the image */}
        <Image source={lotImages[lot.charAt(1) - 1]} style={styles.lotView} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  header: {
    padding: 10,
    width: "100%",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  lotContainer: {
    width: "100%",
    height: "90%",
    justifyContent: "center",
    borderColor: "gray",
    padding: 10,
  },
  lotText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerButton: {
    borderRadius: 5,
  },
  headerButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  lotView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "gray",
    borderRadius: 10,
    borderWidth: 1,
    height: "50%",
    padding: 20,
  },
});

export default LotScreen;
