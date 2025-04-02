from sqlmodel import Session, select
from fastapi import HTTPException
from ..services.groq_ai import meal_plan_generator
import json


async def generateDailyMealPlan(requestBody, session):
    dailyMealPlan = await meal_plan_generator(
        requestBody.age,
        requestBody.weight,
        requestBody.targetWeight,
        requestBody.height,
        requestBody.gender,
        requestBody.daily_physical_activity,
        requestBody.dietary_preferences,
        requestBody.allergies
    )

    return dailyMealPlan
