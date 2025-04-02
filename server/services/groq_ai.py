import os
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from ..schemas import DailyPlan

load_dotenv()



google_llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    temperature=0.2,
    max_tokens=4096,
    timeout=60,
    max_retries=2,
)

groq_llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.2,
    max_tokens=4096,
    timeout=60,
    max_retries=2,
)

parser = JsonOutputParser(pydantic_object=DailyPlan)

prompt = PromptTemplate(
    template="""You are a professional nutritionist AI assistant. Based on the user details below, generate a daily meal plan that is balanced, nutritious, and tailored to their specific needs.

{format_instructions}

{query}

Remember to:
1. Calculate BMR and TDEE based on the provided information
2. Adjust calories appropriately for the user's weight goals
3. Balance macronutrients properly for the user's activity level
4. Provide realistic portion sizes in grams
5. Make meals practical and easy to prepare
""",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# chain = prompt | google_llm | parser
chain = prompt | groq_llm | parser

async def meal_plan_generator(
    age: float,
    weight: float,
    target_weight: float,
    height: float,
    gender: str,
    daily_physical_activity: str,
    dietary_preferences: Optional[List[str]] = None,
    allergies: Optional[List[str]] = None
):

    # Calculate weight difference to determine goal
    weight_difference = target_weight - weight
    weight_goal = "maintenance"
    if weight_difference < -1:
        weight_goal = "weight loss"
    elif weight_difference > 1:
        weight_goal = "weight gain"
    
    # Build the query
    query = f"""
### User Details
- Age: {age} years
- Current Weight: {weight} kg
- Target Weight: {target_weight} kg (Goal: {weight_goal})
- Height: {height} cm
- Gender: {gender}
- Daily Physical Activity Level: {daily_physical_activity}
"""

    if dietary_preferences:
        query += f"- Dietary Preferences: {', '.join(dietary_preferences)}\n"
    
    if allergies:
        query += f"- Food Allergies: {', '.join(allergies)}\n"

    query += f"""
### Requirements
- Generate a complete daily meal plan with 3 main meals and 2 snacks
- For each meal and snack, include specific foods with portion sizes in grams
- Include calorie and macronutrient breakdown for each meal
- Calculate appropriate daily caloric intake based on user's stats and goals:
  - For weight loss: 300-500 calorie deficit
  - For weight gain: 300-500 calorie surplus
  - For maintenance: balanced calories
- Ensure adequate protein (1.6-2.2g per kg of body weight for active individuals)
- Focus on whole, unprocessed foods with appropriate variety
- Include daily hydration recommendations
"""

    try:
        result = chain.invoke({"query": query})
        return result
    except Exception as e:
        print(f"Error generating meal plan: {e}")
        # Fallback to Groq if Google fails
        fallback_chain = prompt | google_llm | parser
        return fallback_chain.invoke({"query": query})