from fastapi import Depends, APIRouter
from sqlmodel import  Session
from ..db import get_session
from typing import Annotated
from ..controllers.mealList import generateDailyMealPlan, generateUpdatedDailyMealPlan
from ..schemas import promptInput, DailyPlan
from pydantic import BaseModel

router = APIRouter(
    prefix="/DailyMealPlan",
    tags=["DailyMealPlan"]
)

SessionDep = Annotated[Session, Depends(get_session)]

#generate daily meal plan
@router.post("/{email}")
async def getDailyMealPlan( email: str, requestBody: promptInput,session: SessionDep):
    return await generateDailyMealPlan(email,requestBody,session)

class UpdateMealPlan(BaseModel):
    prompt: str
    previousMealPlan:DailyPlan

@router.post("/UpdateMealPlan/{email}")
async def upadateDailyMealPlan( email: str, requestBody: UpdateMealPlan,session: SessionDep):
    return await generateUpdatedDailyMealPlan(email,requestBody,session)
