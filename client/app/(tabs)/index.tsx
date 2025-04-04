import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, StatusBar, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomePage() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.push("/sign-in");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="fruit-grapes" size={24} color="#06b6d4" />
            <Text style={styles.logoText}>NutriTrack</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Eat Better,{'\n'}Feel Better</Text>
            <Text style={styles.heroSubtitle}>
              Start your path to a healthier lifestyle with personalized nutrition guidance.
            </Text>
            <TouchableOpacity style={styles.getStartedButton}>
              <Text style={styles.getStartedText} onPress={()=>router.push("/mealPlan")}>Get Started</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.heroImageContainer}>
            <View style={styles.heroImageBackground} />
            <Image 
              source={require("../../assets/images/logo.png")} 
              style={styles.heroImage} 
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionText}>
            NutriTrack helps you maintain a balanced diet and healthy lifestyle through personalized meal planning and nutrition tracking.
          </Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="food-apple-outline" size={24} color="#06b6d4" />
            </View>
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color="#06b6d4" />
            </View>
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="scale-balance" size={24} color="#06b6d4" />
            </View>
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#06b6d4" />
            </View>
          </View>
        </View>

        {/* Why Choose Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose NutriTrack?</Text>
          
          <View style={styles.cardsContainer}>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardImageContainer}>
                <MaterialCommunityIcons name="chart-timeline-variant" size={36} color="#06b6d4" />
              </View>
              <Text style={styles.cardTitle}>Track Progress</Text>
              <Text style={styles.cardText}>Monitor your nutrition goals with easy-to-read charts and insights.</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardImageContainer}>
                <MaterialCommunityIcons name="food-variant" size={36} color="#06b6d4" />
              </View>
              <Text style={styles.cardTitle}>Meal Plans</Text>
              <Text style={styles.cardText}>Personalized meal recommendations based on your preferences.</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardImageContainer}>
                <MaterialCommunityIcons name="account-group" size={36} color="#06b6d4" />
              </View>
              <Text style={styles.cardTitle}>Community</Text>
              <Text style={styles.cardText}>Join others on their journey to better nutrition and health.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0D23',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#0f0D23',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#ff4d4d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ff4d4d',
  },
  heroSection: {
    flexDirection: 'row',
    backgroundColor: '#161934',
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 24,
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  getStartedText: {
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 8,
  },
  heroImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroImageBackground: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
  },
  heroImage: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#0f0D23',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 20,
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cardsContainer: {
    marginTop: 10,
  },
  card: {
    backgroundColor: '#161934',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
});