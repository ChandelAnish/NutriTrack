import axios from 'axios';
import { DailyMealPlan } from '@/types';
import { UserProfile } from '@/app/(tabs)/profile';

export const getMealPlanData = async(email: string, userData: UserProfile, update: boolean = false): Promise<DailyMealPlan | null> => {
  try {
    if(update){
        // Updating Meal
        const { data } = await axios.post(`${process.env.EXPO_PUBLIC_SERVER_URL}/DailyMealPlan/${email}`, {
          age: userData.age,
          weight: userData.weight,
          targetWeight: userData.targetWeight,
          height: userData.height,
          gender: userData.gender,
          daily_physical_activity: userData.daily_physical_activity,
          dietary_preferences: userData.dietary_preferences,
          allergies: userData.allergies
        });
        console.log("updated meal plan: ", data.meal_plan);
        return data.meal_plan;
    }
    // First try to get existing meal plan
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_SERVER_URL}/user-meal-plan/get-meal-plan/${email}`);
      console.log("fetched stored meal plan: ", response.data.meal_plan);
      return response.data.meal_plan;
    } catch (getError) {
      // If GET fails (404 not found), proceed to create a new meal plan
      console.log("Existing meal plan not found, creating new one");
      
      const { data } = await axios.post(`${process.env.EXPO_PUBLIC_SERVER_URL}/DailyMealPlan/${email}`, {
        age: userData.age,
        weight: userData.weight,
        targetWeight: userData.targetWeight,
        height: userData.height,
        gender: userData.gender,
        daily_physical_activity: userData.daily_physical_activity,
        dietary_preferences: userData.dietary_preferences,
        allergies: userData.allergies
      });

      console.log("created meal plan: ", data.meal_plan);
      return data.meal_plan;
    }
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
};