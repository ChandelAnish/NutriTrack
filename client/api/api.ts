import axios from 'axios';
import { DailyMealPlan } from '@/types';

export const getMealPlanData = async(): Promise<DailyMealPlan | null> => {
  try {
    const { data } = await axios.post(`http://192.168.29.11:8000/DailyMealPlan`, {
      age: 20,
      weight: 50,
      targetWeight: 70,
      height: 170,
      gender: "male",
      daily_physical_activity: "goes to gym",
      dietary_preferences: [
        "veg"
      ],
      allergies: [
        "banana"
      ]
    });
    console.log("wow: ", data);
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};