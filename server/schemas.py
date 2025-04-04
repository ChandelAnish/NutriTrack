from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class userschema(BaseModel):
    email: str
    password: str
    age: int
    weight: int
    targetWeight: int
    height: int
    gender: str
    daily_physical_activity: str
    dietary_preferences: List[str]
    allergies: List[str]

class responseUserSchema(BaseModel):
    id:int
    email: str
    password: str
    age: int
    weight: int
    targetWeight: int
    height: int
    gender: str
    daily_physical_activity: str
    dietary_preferences: List[str]
    allergies: List[str]

#Meal Plan schemas

class FoodItem(BaseModel):
    name: str = Field(description="Name of the food item")
    portion: str = Field(description="Portion size of the food item")
    emoji: str = Field(description="Emoji representing the food item")
class Meal(BaseModel):
    name: str = Field(description="Name of the meal")
    foods: List[FoodItem] = Field(description="List of foods in this meal")
    calories: int = Field(description="Total calories for this meal")
    protein: int = Field(description="Protein content in grams")
    carbs: int = Field(description="Carbohydrate content in grams")
    fats: int = Field(description="Fat content in grams")

class DailyPlan(BaseModel):
    total_calories: int = Field(description="Total daily calorie intake")
    breakfast: Meal = Field(description="Breakfast meal details")
    morning_snack: Meal = Field(description="Morning snack details")
    lunch: Meal = Field(description="Lunch meal details")
    afternoon_snack: Meal = Field(description="Afternoon snack details")
    dinner: Meal = Field(description="Dinner meal details")
    hydration: str = Field(description="Daily hydration recommendation")
    notes: Optional[str] = Field(description="Additional nutritional notes")

class UserMealPlanSchema(BaseModel):
    email: str
    meal_plan: DailyPlan

class promptInput(BaseModel):
    age:float
    weight:float
    targetWeight:float
    height: float
    gender: str
    daily_physical_activity: str
    dietary_preferences: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    