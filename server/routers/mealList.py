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
@router.post("/{email}")
async def getDailyMealPlan( email: str, requestBody: promptInput,session: SessionDep):
    return await generateDailyMealPlan(email,requestBody,session)
