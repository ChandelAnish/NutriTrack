from pydantic import BaseModel
from typing import Optional, List

class userschema(BaseModel):
    name: str
    email: str
    password: str

class responseUserSchema(BaseModel):
    id:int
    name: str
    email: str
    password: str
    
#MCQs schemas
class Meals(BaseModel):
    breakfast:str
    snack:str
    lunch:str
    snack:str
    dinner:str

class DailyPlan(BaseModel):
    day: str
    meals: List[Meals]

class MealPlan(BaseModel):
    meal_plan: List[DailyPlan]

class promptInput(BaseModel):
    age:float
    weight:float
    targetWeight:float
    height: float
    gender: str
    DailyPhysicalActivity: str