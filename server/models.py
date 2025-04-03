from typing import Optional, List
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSON

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)  
    password: str
    age: int
    weight: int
    targetWeight: int
    height: int
    gender: str
    daily_physical_activity: str
    dietary_preferences: List[str] = Field(sa_column=Column(JSON)) 
    allergies: List[str] = Field(sa_column=Column(JSON)) 
    

class FoodItem(SQLModel):
    name: str
    portion: str
    emoji: str

class Meal(SQLModel):
    name: str
    foods: List[FoodItem]  # List of food items (will be stored as JSON)
    calories: int
    protein: int
    carbs: int
    fats: int

class MealPlan(SQLModel):
    total_calories: int
    breakfast: Meal
    morning_snack: Meal
    lunch: Meal
    afternoon_snack: Meal
    dinner: Meal
    hydration: str
    notes: Optional[str]

class UserMealPlan(SQLModel, table=True):
    email: str = Field(primary_key=True)
    meal_plan: dict = Field(sa_column=Column(JSON))