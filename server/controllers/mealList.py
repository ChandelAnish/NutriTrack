from sqlmodel import Session, select
from fastapi import HTTPException
from ..services.groq_ai import meal_plan_generator, updated_meal_plan_generator
import json
from ..models import UserMealPlan, User


async def generateDailyMealPlan(email, requestBody, session):
    dailyMealPlan = await meal_plan_generator(
        requestBody.age,
        requestBody.weight,
        requestBody.targetWeight,
        requestBody.height,
        requestBody.gender,
        requestBody.daily_physical_activity,
        requestBody.dietary_preferences,
        requestBody.allergies,
    )
    print(requestBody)
    # Check if meal plan already exists
    existing_plan = session.get(UserMealPlan, email)

    if existing_plan:
        # Update existing meal plan
        existing_plan.meal_plan = dailyMealPlan
    else:
        # Create new meal plan
        existing_plan = UserMealPlan(email=email, meal_plan=dailyMealPlan)
        session.add(existing_plan)

    session.commit()
    session.refresh(existing_plan)
    return existing_plan


async def generateUpdatedDailyMealPlan(email, requestBody, session):
    
    user = session.exec(select(User).where(User.email == email)).first()  
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    userData = {
        "targetWeight": user.targetWeight,
        "gender": user.gender,
        "dietary_preferences": user.dietary_preferences,
        "weight": user.weight,
        "height": user.height,
        "daily_physical_activity": user.daily_physical_activity,
        "allergies": user.allergies,
    }
    
    dailyMealPlan = await updated_meal_plan_generator(
        requestBody.prompt,
        requestBody.previousMealPlan,
        userData
    )
    
    # Check if meal plan already exists
    existing_plan = session.get(UserMealPlan, email)

    if existing_plan:
        # Update existing meal plan
        existing_plan.meal_plan = dailyMealPlan
    else:
        # Create new meal plan
        existing_plan = UserMealPlan(email=email, meal_plan=dailyMealPlan)
        session.add(existing_plan)

    session.commit()
    session.refresh(existing_plan)
    return dailyMealPlan
