export interface FoodItem {
    name: string;
    portion_size: string;
    emoji: string;
  }
  
  export interface MealData {
    name: string;
    foods: FoodItem[];
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }
  
  export interface DailyMealPlan {
    total_calories: number;
    breakfast: MealData;
    morning_snack: MealData;
    lunch: MealData;
    afternoon_snack: MealData;
    dinner: MealData;
    hydration: string;
    notes: string;
  }