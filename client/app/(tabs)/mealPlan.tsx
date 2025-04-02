import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { DailyMealPlan } from '@/types';
import { getMealPlanData } from '@/api/api';
import MealCard from '@/components/MealCard';
import ProgressBar from '@/components/ProgressBar';
import LoadingSpinner from '@/components/LoadingSpinner';

const MealPlanScreen = () => {
  const [mealPlanData, setMealPlanData] = useState<DailyMealPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const data = await getMealPlanData();
        setMealPlanData(data);
      } catch (error) {
        console.error("Error fetching meal plan:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMealPlan();
  }, []);

  // Track completed meals
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({
    breakfast: false,
    morning_snack: false,
    lunch: false,
    afternoon_snack: false,
    dinner: false,
  });

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalMeals = Object.keys(completedMeals).length;
    const completedCount = Object.values(completedMeals).filter(Boolean).length;
    return (completedCount / totalMeals) * 100;
  };

  // Toggle meal completion
  const toggleMealCompletion = (mealKey: string) => {
    setCompletedMeals(prev => ({
      ...prev,
      [mealKey]: !prev[mealKey]
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
          onPress={() => {
            setLoading(true);
            getMealPlanData().then(data => {
              setMealPlanData(data);
              setLoading(false);
            });
          }}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0f0D23]">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white text-2xl font-bold">Today's Meal Plan</Text>
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
            <Text className="text-cyan-500 font-bold">{calculateProgress().toFixed(0)}%</Text>
          </View>
          <ProgressBar progress={calculateProgress()} />
          <View className="flex-row justify-between items-center mt-2">
            <View className="flex-row items-center">
              <Feather name="target" size={16} color="#06b6d4" />
              <Text className="text-white ml-1">Goal: {mealPlanData.total_calories} calories</Text>
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
          .filter(([key]) => ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'].includes(key))
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
        <View className="bg-[#1a1933] rounded-xl p-4 mb-8">
          <View className="flex-row items-center mb-2">
            <Feather name="info" size={16} color="#06b6d4" />
            <Text className="text-white font-bold ml-2">Notes</Text>
          </View>
          <Text className="text-gray-400">{mealPlanData.notes}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MealPlanScreen;