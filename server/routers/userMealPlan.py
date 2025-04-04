from fastapi import Depends, APIRouter, HTTPException
from sqlmodel import  Session
from ..db import get_session
from typing import Annotated
from ..schemas import DailyPlan, UserMealPlanSchema
from ..models import UserMealPlan

router = APIRouter(
    prefix="/user-meal-plan",
    tags=["ADD or GET User Meal Plan"]
)

SessionDep = Annotated[Session, Depends(get_session)]

@router.get("/get-meal-plan/{email}", response_model=UserMealPlanSchema)
def getUserMealPlan(email: str, session: SessionDep):
    user_meal_plan = session.get(UserMealPlan, email)
    if not user_meal_plan:
        raise HTTPException(status_code=404, detail="User meal plan not found")
    return user_meal_plan

@router.post("/add-meal-plan/{email}", response_model=UserMealPlanSchema)
def addUserMealPlan(email: str, meal_plan: DailyPlan, session: SessionDep):
    # Check if meal plan already exists
    existing_plan = session.get(UserMealPlan, email)

    if existing_plan:
        # Update existing meal plan
        existing_plan.meal_plan = meal_plan.model_dump()
    else:
        # Create new meal plan
        existing_plan = UserMealPlan(email=email, meal_plan=meal_plan.model_dump())
        session.add(existing_plan)

    session.commit()
    session.refresh(existing_plan)
    return existing_plan