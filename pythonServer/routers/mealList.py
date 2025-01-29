from fastapi import Depends, APIRouter
from sqlmodel import  Session
from ..db import get_session
from typing import Annotated
from ..controllers.mealList import generateWeeklyMealPlan
from ..schemas import promptInput

router = APIRouter(
    prefix="/WeelyMealPlan",
    tags=["WeelyMealPlan"]
)

SessionDep = Annotated[Session, Depends(get_session)]

#get mcq
@router.post("/")
async def getWeeklyMealPlan(requestBody: promptInput,session: SessionDep):
    return await generateWeeklyMealPlan(requestBody,session)
