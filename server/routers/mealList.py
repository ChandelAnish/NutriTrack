from fastapi import Depends, APIRouter
from sqlmodel import  Session
from ..db import get_session
from typing import Annotated
from ..controllers.mealList import generateDailyMealPlan
from ..schemas import promptInput

router = APIRouter(
    prefix="/DailyMealPlan",
    tags=["DailyMealPlan"]
)

SessionDep = Annotated[Session, Depends(get_session)]

#get mcq
@router.post("/")
async def getDailyMealPlan(requestBody: promptInput,session: SessionDep):
    return await generateDailyMealPlan(requestBody,session)
