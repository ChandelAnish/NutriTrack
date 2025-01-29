from sqlmodel import Session, select
from fastapi import HTTPException
from ..services.groq_ai import aiService
import json


async def generateWeeklyMealPlan(requestBody, session):
    chat_completion = await aiService(
        requestBody.age,
        requestBody.weight,
        requestBody.targetWeight,
        requestBody.height,
        requestBody.gender,
        requestBody.DailyPhysicalActivity,
    )
    mcqList = chat_completion.choices[0].message.content
    obj = json.loads(mcqList)
    return obj
