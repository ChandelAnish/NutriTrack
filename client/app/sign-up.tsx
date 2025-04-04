import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
// import { twMerge } from "tailwind-merge";

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

  const [newAllergy, setNewAllergy] = useState("");

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
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Z])(?=.*\d).{8,}$/; 
    
    if (!password) { 
      setErrors(prev => ({ ...prev, password: "Password is required" })); 
      return false; 
    } else if (!passwordRegex.test(password)) { 
      setErrors(prev => ({  
        ...prev,  
        password: "Password must be at least 8 characters and include at least 1 special character, 1 uppercase letter, and 1 number"  
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

  // Add custom allergy
  const addCustomAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      updateFormData("allergies", [...formData.allergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const removeAllergy = (allergy: string) => {
    updateFormData(
      "allergies",
      formData.allergies.filter(item => item !== allergy)
    );
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

  // Helper function to apply Tailwind classes
  const tailwind = (className: string) => className;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0f0D23" }}>
      <View style={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ width: "100%" }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "white", marginBottom: 8 }}>Create Account</Text>
          <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginBottom: 24 }}>Tell us about yourself</Text>

          {/* Account Information */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginBottom: 16 }}>Account</Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: "white", marginBottom: 8, fontSize: 14 }}>Email</Text>
              <TextInput
                style={{ 
                  backgroundColor: "rgba(255,255,255,0.1)", 
                  borderRadius: 8, 
                  borderWidth: 1, 
                  borderColor: errors.email ? "#ff6b6b" : "rgba(6, 182, 212, 0.3)", 
                  color: "white", 
                  padding: 12, 
                  fontSize: 16 
                }}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => updateFormData("email", text)}
              />
              {errors.email ? <Text style={{ color: "#ff6b6b", fontSize: 12, marginTop: 5 }}>{errors.email}</Text> : null}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: "white", marginBottom: 8, fontSize: 14 }}>Password</Text>
              <TextInput
                style={{ 
                  backgroundColor: "rgba(255,255,255,0.1)", 
                  borderRadius: 8, 
                  borderWidth: 1, 
                  borderColor: errors.password ? "#ff6b6b" : "rgba(6, 182, 212, 0.3)", 
                  color: "white", 
                  padding: 12, 
                  fontSize: 16 
                }}
                placeholder="Create a password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => updateFormData("password", text)}
              />
              {errors.password ? <Text style={{ color: "#ff6b6b", fontSize: 12, marginTop: 5 }}>{errors.password}</Text> : null}
            </View>
          </View>

          {/* Physical Information */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <FontAwesome5 name="user-alt" size={18} color="white" />
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginLeft: 8 }}>Physical Information</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ width: "48%", marginBottom: 16 }}>
                <Text style={{ color: "white", marginBottom: 8, fontSize: 14 }}>Age</Text>
                <TextInput
                  style={{ 
                    backgroundColor: "rgba(255,255,255,0.1)", 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: "rgba(6, 182, 212, 0.3)", 
                    color: "white", 
                    padding: 12, 
                    fontSize: 16 
                  }}
                  placeholder="Years"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="numeric"
                  value={formData.age}
                  onChangeText={(text) => updateFormData("age", text)}
                />
              </View>

              <View style={{ width: "48%", marginBottom: 16 }}>
                <Text style={{ color: "white", marginBottom: 8, fontSize: 14 }}>Height (cm)</Text>
                <TextInput
                  style={{ 
                    backgroundColor: "rgba(255,255,255,0.1)", 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: "rgba(6, 182, 212, 0.3)", 
                    color: "white", 
                    padding: 12, 
                    fontSize: 16 
                  }}
                  placeholder="cm"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="numeric"
                  value={formData.height}
                  onChangeText={(text) => updateFormData("height", text)}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ width: "48%", marginBottom: 16 }}>
                <Text style={{ color: "white", marginBottom: 8, fontSize: 14 }}>Current Weight (kg)</Text>
                <TextInput
                  style={{ 
                    backgroundColor: "rgba(255,255,255,0.1)", 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: "rgba(6, 182, 212, 0.3)", 
                    color: "white", 
                    padding: 12, 
                    fontSize: 16 
                  }}
                  placeholder="kg"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="numeric"
                  value={formData.weight}
                  onChangeText={(text) => updateFormData("weight", text)}
                />
              </View>

              <View style={{ width: "48%", marginBottom: 16 }}>
                <Text style={{ color: "white", marginBottom: 8, fontSize: 14 }}>Target Weight (kg)</Text>
                <TextInput
                  style={{ 
                    backgroundColor: "rgba(255,255,255,0.1)", 
                    borderRadius: 8, 
                    borderWidth: 1, 
                    borderColor: "rgba(6, 182, 212, 0.3)", 
                    color: "white", 
                    padding: 12, 
                    fontSize: 16 
                  }}
                  placeholder="kg"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="numeric"
                  value={formData.targetWeight}
                  onChangeText={(text) => updateFormData("targetWeight", text)}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: "white", marginBottom: 8, fontSize: 14 }}>Gender</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <TouchableOpacity
                  style={{ 
                    backgroundColor: formData.gender === "male" ? "rgba(6, 182, 212, 0.2)" : "rgba(255,255,255,0.1)", 
                    borderRadius: 8, 
                    padding: 12, 
                    flex: 1, 
                    marginHorizontal: 4,
                    borderWidth: 1,
                    borderColor: formData.gender === "male" ? "rgb(6, 182, 212)" : "transparent"
                  }}
                  onPress={() => updateFormData("gender", "male")}
                >
                  <Text 
                    style={{ 
                      color: formData.gender === "male" ? "rgb(6, 182, 212)" : "white", 
                      textAlign: "center",
                      fontWeight: formData.gender === "male" ? "bold" : "normal"
                    }}
                  >
                    Male
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ 
                    backgroundColor: formData.gender === "female" ? "rgba(6, 182, 212, 0.2)" : "rgba(255,255,255,0.1)", 
                    borderRadius: 8, 
                    padding: 12, 
                    flex: 1, 
                    marginHorizontal: 4,
                    borderWidth: 1,
                    borderColor: formData.gender === "female" ? "rgb(6, 182, 212)" : "transparent"
                  }}
                  onPress={() => updateFormData("gender", "female")}
                >
                  <Text 
                    style={{ 
                      color: formData.gender === "female" ? "rgb(6, 182, 212)" : "white", 
                      textAlign: "center",
                      fontWeight: formData.gender === "female" ? "bold" : "normal"
                    }}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Activity Level */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <MaterialIcons name="fitness-center" size={20} color="white" />
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginLeft: 8 }}>Activity Level</Text>
            </View>
            <View style={{ flexDirection: "column" }}>
              {activityOptions.map((activity) => (
                <TouchableOpacity
                  key={activity}
                  style={{ 
                    backgroundColor: formData.daily_physical_activity === activity ? "rgba(6, 182, 212, 0.2)" : "rgba(255,255,255,0.1)", 
                    borderRadius: 8, 
                    padding: 12, 
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: formData.daily_physical_activity === activity ? "rgb(6, 182, 212)" : "transparent"
                  }}
                  onPress={() => updateFormData("daily_physical_activity", activity)}
                >
                  <Text 
                    style={{ 
                      color: formData.daily_physical_activity === activity ? "rgb(6, 182, 212)" : "white", 
                      textAlign: "center",
                      fontWeight: formData.daily_physical_activity === activity ? "bold" : "normal"
                    }}
                  >
                    {activity.charAt(0).toUpperCase() + activity.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dietary Preferences */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <MaterialIcons name="restaurant" size={20} color="white" />
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginLeft: 8 }}>Dietary Preferences</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 }}>
              {dietaryOptions.map((diet) => (
                <TouchableOpacity
                  key={diet}
                  style={{ 
                    backgroundColor: formData.dietary_preferences.includes(diet) ? "rgba(6, 182, 212, 0.2)" : "rgba(255,255,255,0.1)", 
                    borderRadius: 16, 
                    paddingVertical: 8, 
                    paddingHorizontal: 12, 
                    margin: 4,
                    borderWidth: 1,
                    borderColor: formData.dietary_preferences.includes(diet) ? "rgb(6, 182, 212)" : "transparent"
                  }}
                  onPress={() => toggleSelection("dietary_preferences", diet)}
                >
                  <Text 
                    style={{ 
                      color: formData.dietary_preferences.includes(diet) ? "rgb(6, 182, 212)" : "white",
                      fontWeight: formData.dietary_preferences.includes(diet) ? "bold" : "normal"
                    }}
                  >
                    {diet}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Allergies - Updated to match the image */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Ionicons name="warning-outline" size={20} color="#3B82F6" />
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginLeft: 8 }}>Allergies</Text>
            </View>
            
            {/* Selected allergies display */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4, marginBottom: 16 }}>
              {formData.allergies.map((allergy) => (
                <View
                  key={allergy}
                  style={{ 
                    backgroundColor: "rgba(153, 27, 27, 0.8)",  // Dark red with opacity
                    borderRadius: 20, 
                    paddingVertical: 8, 
                    paddingHorizontal: 16, 
                    margin: 4,
                    flexDirection: "row",
                    alignItems: "center" 
                  }}
                >
                  <Text style={{ color: "white", marginRight: 8 }}>{allergy}</Text>
                  <TouchableOpacity onPress={() => removeAllergy(allergy)}>
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            {/* Add new allergy input */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1, backgroundColor: "rgba(51, 65, 85, 0.5)", borderRadius: 8 }}>
                <TextInput
                  style={{ color: "white", padding: 12 }}
                  placeholder="Add new allergy"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={newAllergy}
                  onChangeText={setNewAllergy}
                  onSubmitEditing={addCustomAllergy}
                />
              </View>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: "rgb(6, 182, 212)", 
                  borderRadius: 999, 
                  marginLeft: 16,
                  width: 56,
                  height: 56,
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onPress={addCustomAllergy}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={{ 
              backgroundColor: "rgb(6, 182, 212)", 
              borderRadius: 8, 
              padding: 16, 
              alignItems: "center", 
              marginTop: 16, 
              marginBottom: 40
            }}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24,marginBottom:100,paddingBottom:150 }}>
            <Text style={{ color: "rgba(255,255,255,0.7)" }}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/sign-in')}>
              <Text style={{ color: "rgb(6, 182, 212)", fontWeight: "bold", marginLeft: 4 }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUpScreen;