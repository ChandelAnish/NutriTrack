import axios from 'axios';
import { DailyMealPlan } from '@/types';
import { UserProfile } from '@/app/(tabs)/profile';

export const getMealPlanData = async(email: string, userData:UserProfile): Promise<DailyMealPlan | null> => {
  try {
    console.log(userData)
    const { data } = await axios.post(`${process.env.EXPO_PUBLIC_SERVER_URL}/DailyMealPlan/${email}`, {
      age: userData.age,
      weight:userData.weight,
      targetWeight:userData.targetWeight,
      height:userData.height,
      gender:userData.gender,
      daily_physical_activity:userData.daily_physical_activity,
      dietary_preferences:userData.dietary_preferences,
      allergies: userData.allergies
    });
    // console.log("api: ", data);
    return data.meal_plan;
  } catch (error) {
    console.log(error);
    return null;
  }
};