import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { DailyMealPlan } from "@/types";
import { getMealPlanData } from "@/api/api";
import MealCard from "@/components/MealCard";
import ProgressBar from "@/components/ProgressBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";

const MEAL_PLAN_STORAGE_KEY = "meal_plan_data";
const USER_DATA_KEY = "userData"; // Storage key for user profile data

const MealPlanScreen = () => {
  const [mealPlanData, setMealPlanData] = useState<DailyMealPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initial data loading
  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const storedData = await AsyncStorage.getItem(MEAL_PLAN_STORAGE_KEY);
        const parsedData = JSON.parse(storedData ?? "{}");

        const userEmail = await AsyncStorage.getItem("email");

        const savedProfile = await AsyncStorage.getItem(USER_DATA_KEY);
        const parsedSavedProfile = JSON.parse(savedProfile ?? "{}");

        if (storedData && Object.keys(parsedData).length != 0) {
          // If data exists in AsyncStorage, use it
          console.log("\nstoredData inside: \n", parsedData);
          setMealPlanData(parsedData);
        } else {
          if (userEmail && Object.keys(parsedSavedProfile).length != 0) {
            console.log("email: ", userEmail);
            console.log("saved User profile : ", parsedSavedProfile);
            setEmail(userEmail);
            // Pass both userEmail and savedProfile to getMealPlanData
            const data = await getMealPlanData(userEmail, parsedSavedProfile);
            setMealPlanData(data);
            await AsyncStorage.setItem(
              MEAL_PLAN_STORAGE_KEY,
              JSON.stringify(data)
            );
          } else {
            router.push("/sign-in");
          }
        }
      } catch (error) {
        console.error("Error fetching meal plan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, []);

  // Check for data changes when tab is focused
  useFocusEffect(
    useCallback(() => {
      const checkStorageChanges = async () => {
        try {
          const storedData = await AsyncStorage.getItem(MEAL_PLAN_STORAGE_KEY);
          const userEmail = await AsyncStorage.getItem("email");
          setEmail(userEmail);

          const parsedData = JSON.parse(storedData ?? "{}");
          if (storedData && Object.keys(parsedData).length != 0) {
            console.log(parsedData);
            console.log("Found updated data in AsyncStorage, refreshing view");
            setMealPlanData(parsedData);
          } else {
            console.log("No data found in AsyncStorage on tab focus");

            // If no data but we have email, try to fetch new data
            const savedProfile = await AsyncStorage.getItem(USER_DATA_KEY);
            const parsedSavedProfile = JSON.parse(savedProfile ?? "{}");
            if (
              userEmail &&
              savedProfile &&
              Object.keys(parsedSavedProfile).length != 0
            ) {
              try {
                const data = await getMealPlanData(
                  userEmail,
                  parsedSavedProfile
                );
                setMealPlanData(data);
                await AsyncStorage.setItem(
                  MEAL_PLAN_STORAGE_KEY,
                  JSON.stringify(data)
                );
              } catch (fetchError) {
                console.error(
                  "Error fetching meal plan on tab focus:",
                  fetchError
                );
              }
            }
          }
        } catch (error) {
          console.error("Error checking AsyncStorage on tab focus:", error);
        }
      };

      // Skip the check during initial load to avoid duplicate processing
      if (!loading) {
        checkStorageChanges();
      }

      return () => {
        // Any cleanup if needed
      };
    }, [email, loading])
  );

  // Submit user prompt to the API
  const submitPrompt = async () => {
    console.log(userPrompt);
    console.log(email);
    if (!userPrompt.trim() || !email) return;

    console.log("old plan: ",mealPlanData);
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/DailyMealPlan/UpdateMealPlan/${email}`,
        { prompt: userPrompt, previousMealPlan: mealPlanData }
      );

      // Refresh meal plan data after submission
      if (response.status === 200) {
        console.log(response.data)
        setMealPlanData(response.data);
        await AsyncStorage.setItem(MEAL_PLAN_STORAGE_KEY, JSON.stringify(response.data));
      }

      // Clear input and close modal
      setUserPrompt("");
      setModalVisible(false);
    } catch (error) {
      console.error("Error submitting prompt:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track completed meals
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>(
    {
      breakfast: false,
      morning_snack: false,
      lunch: false,
      afternoon_snack: false,
      dinner: false,
    }
  );

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalMeals = Object.keys(completedMeals).length;
    const completedCount = Object.values(completedMeals).filter(Boolean).length;
    return (completedCount / totalMeals) * 100;
  };

  // Toggle meal completion
  const toggleMealCompletion = (mealKey: string) => {
    setCompletedMeals((prev) => ({
      ...prev,
      [mealKey]: !prev[mealKey],
    }));
  };

  // Show loading spinner when data is being fetched
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show error message if data is null
  if (!mealPlanData) {
    return (
      <SafeAreaView className="flex-1 bg-[#0f0D23] justify-center items-center">
        <Feather name="alert-circle" size={50} color="#06b6d4" />
        <Text className="text-white text-lg mt-4">
          Failed to load meal plan
        </Text>
        <TouchableOpacity
          className="mt-4 bg-cyan-500 px-6 py-2 rounded-lg"
          onPress={async () => {
            setLoading(true);
            if (email) {
              try {
                const savedProfile = await AsyncStorage.getItem(USER_DATA_KEY);
                const data = await getMealPlanData(
                  email,
                  savedProfile ? JSON.parse(savedProfile) : null
                );
                setMealPlanData(data);
                // Make sure to update AsyncStorage when refreshing
                await AsyncStorage.setItem(
                  MEAL_PLAN_STORAGE_KEY,
                  JSON.stringify(data)
                );
              } catch (error) {
                console.error("Error refreshing meal plan:", error);
              } finally {
                setLoading(false);
              }
            } else {
              router.push("/sign-in");
            }
          }}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0f0D23]">
      <ScrollView className="flex-1 px-4 pt-4 pb-32">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white text-2xl font-bold">
              Today's Meal Plan
            </Text>
            <Text className="text-gray-400">Let's achieve your goal</Text>
          </View>
          <TouchableOpacity className="bg-cyan-500 w-10 h-10 rounded-full items-center justify-center">
            <Feather name="calendar" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Progress section */}
        <View className="bg-[#1a1933] rounded-xl p-4 mb-6">
          <View className="flex-row justify-between items-center">
            <Text className="text-white font-semibold">Daily Progress</Text>
            <Text className="text-cyan-500 font-bold">
              {calculateProgress().toFixed(0)}%
            </Text>
          </View>
          <ProgressBar progress={calculateProgress()} />
          <View className="flex-row justify-between items-center mt-2">
            <View className="flex-row items-center">
              <Feather name="target" size={16} color="#06b6d4" />
              <Text className="text-white ml-1">
                Goal: {mealPlanData.total_calories} calories
              </Text>
            </View>
            <TouchableOpacity>
              <Text className="text-cyan-500">Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hydration reminder */}
        <View className="bg-[#1a1933] rounded-xl p-4 mb-6 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-cyan-500/20 items-center justify-center mr-3">
            <Feather name="droplet" size={20} color="#06b6d4" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold">Hydration</Text>
            <Text className="text-gray-400">{mealPlanData.hydration}</Text>
          </View>
        </View>

        {/* Meal sections */}
        {Object.entries(mealPlanData)
          .filter(([key]) =>
            [
              "breakfast",
              "morning_snack",
              "lunch",
              "afternoon_snack",
              "dinner",
            ].includes(key)
          )
          .map(([key, meal]) => (
            <MealCard
              key={key}
              mealKey={key}
              meal={meal as any}
              isCompleted={completedMeals[key]}
              onToggleCompletion={toggleMealCompletion}
            />
          ))}

        {/* Notes section */}
        <View className="bg-[#1a1933] rounded-xl p-4 mb-36">
          <View className="flex-row items-center mb-2">
            <Feather name="info" size={16} color="#06b6d4" />
            <Text className="text-white font-bold ml-2">Notes</Text>
          </View>
          <Text className="text-gray-400">{mealPlanData.notes}</Text>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-40 right-6 bg-cyan-500/80 w-[40px] h-[40px] rounded-full items-center justify-center shadow-lg"
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name="fruit-grapes" size={28} color="white" />
      </TouchableOpacity>

      {/* Modal for user prompt */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            setModalVisible(false);
          }}
        >
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View className="bg-[#1a1933] rounded-t-xl p-4 w-full">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-white text-lg font-bold">
                    Ask JayDEV
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Feather name="x" size={24} color="#06b6d4" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  className="bg-[#0f0D23] text-white p-4 rounded-lg mb-4 min-h-24"
                  placeholder="Describe your meal plan request..."
                  placeholderTextColor="#6b7280"
                  multiline
                  value={userPrompt}
                  onChangeText={setUserPrompt}
                />

                <TouchableOpacity
                  className="bg-cyan-500 p-3 rounded-lg items-center"
                  onPress={submitPrompt}
                  disabled={isSubmitting || !userPrompt.trim()}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold">Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default MealPlanScreen;
