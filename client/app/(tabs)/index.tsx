import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function HomePage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.button, styles.signOutButton]}
          onPress={() => router.push("/sign-in")}
        >
          <Text style={[styles.buttonText, { color: "#ff4d4d" }]}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Image 
          source={require("../../assets/images/logo.png")} 
          style={{ width: "100%", height: "50%", resizeMode: "contain" }} 
        />
        <Text style={styles.title}>Welcome to NutriApp!</Text>
        <Text style={styles.subtitle}>
          Your personal nutrition assistant to help you stay healthy and fit.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0D23',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 60,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#06b6d4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  signOutButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ff4d4d',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});