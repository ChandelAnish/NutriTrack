import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    age: "",
    weight: "",
    targetWeight: "",
    height: "",
    gender: "male",
    daily_physical_activity: "",
    dietary_preferences: [] as string[],
    allergies: [] as string[],
  });

  const activityOptions = [
    "sedentary",
    "lightly active",
    "moderately active",
    "very active",
    "goes to gym",
  ];

  const dietaryOptions = ["veg", "non-veg", "vegan", "keto", "paleo"];
  const allergyOptions = ["milk", "eggs", "nuts", "soy", "gluten", "banana"];

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear errors when user types
    if (field === "email" || field === "password") {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Validate as user types
    if (field === "email") {
      validateEmail(value);
    } else if (field === "password") {
      validatePassword(value);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!email) {
      setErrors(prev => ({ ...prev, email: "Email is required" }));
      return false;
    } else if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: "Email must end with @gmail.com" }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: "" }));
    return true;
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.[!@#$%^&(),.?":{}|<>]).{8,}$/;
    if (!password) {
      setErrors(prev => ({ ...prev, password: "Password is required" }));
      return false;
    } else if (!passwordRegex.test(password)) {
      setErrors(prev => ({ 
        ...prev, 
        password: "Password must be at least 8 characters and include a special character" 
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: "" }));
    return true;
  };

  // Toggle selection for multi-select options
  const toggleSelection = (
    field: "dietary_preferences" | "allergies",
    item: string
  ) => {
    const currentItems = [...formData[field]];
    if (currentItems.includes(item)) {
      updateFormData(
        field,
        currentItems.filter((i) => i !== item)
      );
    } else {
      updateFormData(field, [...currentItems, item]);
    }
  };

  const handleSignUp = async () => {
    // Validate both fields
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);

    // If either validation fails, return early
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/user/addUser`,
        {
          email: formData.email,
          password: formData.password,
          age: parseInt(formData.age) || 0,
          weight: parseFloat(formData.weight) || 0,
          targetWeight: parseFloat(formData.targetWeight) || 0,
          height: parseFloat(formData.height) || 0,
          gender: formData.gender,
          daily_physical_activity: formData.daily_physical_activity,
          dietary_preferences: formData.dietary_preferences,
          allergies: formData.allergies,
        }
      );

      if (response.data) {
        router.push('/sign-in');
      }
    } catch (error: any) {
      // Display backend validation errors if any
      if (error.response && error.response.data && error.response.data.detail) {
        Alert.alert("Error", error.response.data.detail);
      } else {
        Alert.alert("Error", "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Tell us about yourself</Text>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="Enter your email"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => updateFormData("email", text)}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="Create a password"
              placeholderTextColor="rgba(255,255,255,0.5)"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => updateFormData("password", text)}
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>
        </View>

        {/* Physical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Information</Text>

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Years"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(text) => updateFormData("age", text)}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="cm"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="numeric"
                value={formData.height}
                onChangeText={(text) => updateFormData("height", text)}
              />
            </View>
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Current Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="kg"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="numeric"
                value={formData.weight}
                onChangeText={(text) => updateFormData("weight", text)}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Target Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="kg"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="numeric"
                value={formData.targetWeight}
                onChangeText={(text) => updateFormData("targetWeight", text)}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.gender === "male" && styles.selectedOption,
                ]}
                onPress={() => updateFormData("gender", "male")}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.gender === "male" && styles.selectedOptionText,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.gender === "female" && styles.selectedOption,
                ]}
                onPress={() => updateFormData("gender", "female")}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.gender === "female" && styles.selectedOptionText,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Activity Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Level</Text>
          <View style={styles.optionsContainer}>
            {activityOptions.map((activity) => (
              <TouchableOpacity
                key={activity}
                style={[
                  styles.optionButton,
                  formData.daily_physical_activity === activity &&
                    styles.selectedOption,
                ]}
                onPress={() =>
                  updateFormData("daily_physical_activity", activity)
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.daily_physical_activity === activity &&
                      styles.selectedOptionText,
                  ]}
                >
                  {activity.charAt(0).toUpperCase() + activity.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dietary Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <View style={styles.tagsContainer}>
            {dietaryOptions.map((diet) => (
              <TouchableOpacity
                key={diet}
                style={[
                  styles.tagButton,
                  formData.dietary_preferences.includes(diet) &&
                    styles.selectedTag,
                ]}
                onPress={() => toggleSelection("dietary_preferences", diet)}
              >
                <Text
                  style={[
                    styles.tagText,
                    formData.dietary_preferences.includes(diet) &&
                      styles.selectedTagText,
                  ]}
                >
                  {diet}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          <View style={styles.tagsContainer}>
            {allergyOptions.map((allergy) => (
              <TouchableOpacity
                key={allergy}
                style={[
                  styles.tagButton,
                  formData.allergies.includes(allergy) && styles.selectedTag,
                ]}
                onPress={() => toggleSelection("allergies", allergy)}
              >
                <Text
                  style={[
                    styles.tagText,
                    formData.allergies.includes(allergy) &&
                      styles.selectedTagText,
                  ]}
                >
                  {allergy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.signUpButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/sign-in')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};


 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0D23",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  inputLabel: {
    color: "white",
    marginBottom: 8,
    fontSize: 14,
  },
   inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 5,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.3)", // cyan-500 with opacity
    color: "white",
    padding: 12,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionsContainer: {
    flexDirection: "column",
  },
  optionButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
    flex: 1,
    marginHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: "rgba(6, 182, 212, 0.2)",
    borderColor: "rgb(6, 182, 212)",
  },
  optionText: {
    color: "white",
    textAlign: "center",
  },
  selectedOptionText: {
    fontWeight: "bold",
    color: "rgb(6, 182, 212)",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  tagButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedTag: {
    backgroundColor: "rgba(6, 182, 212, 0.2)",
    borderColor: "rgb(6, 182, 212)",
  },
  tagText: {
    color: "white",
  },
  selectedTagText: {
    fontWeight: "bold",
    color: "rgb(6, 182, 212)",
  },
  signUpButton: {
    backgroundColor: "rgb(6, 182, 212)", // cyan-500
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  signUpButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "rgba(255,255,255,0.7)",
  },
  signInLink: {
    color: "rgb(6, 182, 212)", // cyan-500
    fontWeight: "bold",
    marginLeft: 4,
  },
});

export default SignUpScreen;

