import os
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
# from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from ..schemas import DailyPlan

load_dotenv()

# Initialize all LLM models
# google_llm = ChatGoogleGenerativeAI(
#     model="gemini-1.5-pro",
#     temperature=0.2,
#     max_tokens=4096,
#     timeout=60,
#     max_retries=2,
# )

llama70_llm = ChatGroq(
    model="llama-3.3-70b-versatile", # 6000 token
    temperature=0.2,
    max_tokens=4096,
    timeout=60,
    max_retries=2,
)
gemma2_llm = ChatGroq(
    model="gemma2-9b-it",# 15000 token
    temperature=0.2,
    max_tokens=4096,
    timeout=60,
    max_retries=2,
)
llamaSpecdec_llm = ChatGroq(
    model="llama-3.3-70b-specdec",# 15000 token
    temperature=0.2,
    max_tokens=4096,
    timeout=60,
    max_retries=2,
)
llamaVision_llm = ChatGroq(
    model="llama-3.2-90b-vision-preview", # 7000 token
    temperature=0.2,
    max_tokens=4096,
    timeout=60,
    max_retries=2,
)
deepseek_llm = ChatGroq(
    model="deepseek-r1-distill-qwen-32b", # 6000 token
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
    **important**
        - Generate a complete daily meal plan with 3 main meals and 2 snacks strictly considering the User Details.
        - Strictly follow the user's dietary preferences (e.g., vegetarian, vegan, keto).
        - Exclude any foods the user is allergic to.
        
    - For each meal and snack, include specific foods with portion sizes in grams.
    - Include calorie and macronutrient breakdown for each meal
    - Calculate appropriate daily caloric intake based on user's stats and goals:
    - For weight loss: 300-500 calorie deficit
    - For weight gain: 300-500 calorie surplus
    - For maintenance: balanced calories
    - Ensure adequate protein (1.6-2.2g per kg of body weight for active individuals)
    - Focus on whole, unprocessed foods with appropriate variety
    - Include daily hydration recommendations
    - Include a short Personalized user-specific note at the end of the meal plan.
"""

    # Define a list of LLMs to try in order of preference
    llm_models = [
        ("llama70_llm", llama70_llm),
        ("gemma2_llm", gemma2_llm),
        ("llamaSpecdec_llm", llamaSpecdec_llm),
        ("llamaVision_llm", llamaVision_llm),
        ("deepseek_llm", deepseek_llm),
        # ("google_llm", google_llm)
    ]
    
    last_exception = None
    
    # Try each LLM in sequence until one succeeds
    for model_name, model in llm_models:
        try:
            print(f"Trying {model_name}...")
            chain = prompt | model | parser
            result = chain.invoke({"query": query})
            print(f"Successfully generated meal plan using {model_name}")
            return result
        except Exception as e:
            print(f"Error with {model_name}: {e}")
            last_exception = e
            continue
    
    # If all models fail, raise the last exception
    if last_exception:
        print("All LLM models failed")
        raise last_exception
    
    return None