from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class userschema(BaseModel):
    name: str
    email: str
    password: str

class responseUserSchema(BaseModel):
    id:int
    name: str
    email: str
    password: str
    
#Meal Plan schemas
class Meal(BaseModel):
    name: str = Field(description="Name of the meal")
    foods: List[Dict[str, str]] = Field(
        description="List of foods in this meal with name, portion size, and emoji"
    )
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


class promptInput(BaseModel):
    age:float
    weight:float
    targetWeight:float
    height: float
    gender: str
    daily_physical_activity: str
    dietary_preferences: Optional[List[str]] = None
    allergies: Optional[List[str]] = None