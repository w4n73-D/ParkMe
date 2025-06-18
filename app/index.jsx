import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import Logo from "../assets/img/parkme_logo.png";

const Home = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={styles.subtitle}>The number 1 Parking app</Text>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.loginButton}>
          <Link href="/login" style={styles.loginLink}>
            <Text style={styles.buttonText}>Log In</Text>
          </Link>
        </TouchableOpacity>

        <Text style={styles.promptText}>Don't have an account?</Text>

        <TouchableOpacity style={styles.signupButton}>
          <Link href="/signup" style={styles.signupLink}>
            <Text style={styles.signupText}>Sign Up</Text>
          </Link>
        </TouchableOpacity>

        <Link href="/about" style={styles.aboutLink}>
          <Text style={styles.aboutText}>About Park Me</Text>
        </Link>
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontWeight: "bold",
    fontSize: 35,
    color: "#2c3e50",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 40,
  },
  actionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#3498db",
    width: "100%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginLink: {
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  promptText: {
    color: "#7f8c8d",
    marginBottom: 15,
  },
  signupButton: {
    width: "100%",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3498db",
    marginBottom: 25,
  },
  signupLink: {
    width: "100%",
    alignItems: "center",
  },
  signupText: {
    color: "#3498db",
    fontSize: 18,
    fontWeight: "600",
  },
  aboutLink: {
    marginTop: 10,
  },
  aboutText: {
    color: "#3498db",
    fontSize: 14,
  },
});
