import os
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
# from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from ..schemas import DailyPlan
import json


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


async def updated_meal_plan_generator(
    user_prompt: str,
    previous_meal_plan: DailyPlan,
    user_data: dict
):
    """
    Updates a previous meal plan based on user's prompt and personal data.
    
    Args:
        user_prompt (str): The user's request for changes to the meal plan
        previous_meal_plan (DailyPlan): The existing meal plan to modify
        user_data (dict): Dictionary containing user's health and dietary information
        
    Returns:
        DailyPlan: Updated meal plan based on user's prompt and data
    """
    # Extract user data with safety checks
    weight = user_data.get("weight")
    target_weight = user_data.get("targetWeight", user_data.get("target_weight"))  # Try both key formats
    height = user_data.get("height")
    gender = user_data.get("gender")
    daily_physical_activity = user_data.get("daily_physical_activity")
    dietary_preferences = user_data.get("dietary_preferences", [])
    allergies = user_data.get("allergies", [])
    
    # Calculate weight goal with safety checks
    weight_goal = "maintenance"
    if weight is not None and target_weight is not None:
        try:
            weight_difference = float(target_weight) - float(weight)
            if weight_difference < -1:
                weight_goal = "weight loss"
            elif weight_difference > 1:
                weight_goal = "weight gain"
        except (TypeError, ValueError):
            # If conversion fails, default to maintenance
            print("Warning: Could not calculate weight difference, defaulting to maintenance")
    
    # Convert empty values to appropriate defaults for the prompt
    weight = weight or "Not specified"
    target_weight = target_weight or "Not specified"
    height = height or "Not specified"
    gender = gender or "Not specified"
    daily_physical_activity = daily_physical_activity or "Not specified"
    
    # Define the prompt template for updating meal plans
    update_prompt = PromptTemplate(
        template="""You are a professional nutritionist AI assistant. A user already has a meal plan and wants to make changes to it based on their prompt. Update the existing meal plan according to their request while considering their personal data.

{format_instructions}

### User Data
- Current Weight: {weight}
- Target Weight: {target_weight} (Goal: {weight_goal})
- Height: {height}
- Gender: {gender}
- Daily Physical Activity Level: {daily_physical_activity}
{dietary_preferences_str}
{allergies_str}

### Previous Meal Plan
```json
{previous_meal_plan}
```

### User Update Request
{user_prompt}

### Update Instructions:
1. Analyze the user prompt and make only the requested changes to the meal plan.
2. IMPORTANT: Consider the user's personal data when making changes, especially:
   - Their dietary preferences (must be strictly followed)
   - Their allergies (must be strictly avoided)
   - Their weight goals (adjust calories appropriately)
   - Their activity level (ensure adequate nutrition)
3. If the user asks for "veg only" or "vegetarian only", ensure EVERY meal contains ONLY vegetarian foods while maintaining appropriate calorie and nutrient levels.
4. If the user asks for "non-veg only", ensure EVERY meal includes non-vegetarian protein sources while maintaining appropriate calorie and nutrient levels.
5. If adding new foods, each must have name, portion size, and emoji.
6. Maintain the exact JSON structure - do not add/remove keys from objects.
7. For array elements like 'foods', you may add or remove items while keeping the structure.
8. If the user prompt is not meaningful or clear, return the previous meal plan unchanged.
9. Ensure all calories and macronutrient numbers remain realistic for the user's profile.
10. Update the notes field if appropriate based on the changes made.
11. Make sure the total calorie count and macronutrient distribution aligns with the user's physical requirements.
""",
        input_variables=["previous_meal_plan", "user_prompt", "weight", "target_weight", 
                        "weight_goal", "height", "gender", "daily_physical_activity", 
                        "dietary_preferences_str", "allergies_str"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    previous_meal_plan_json = previous_meal_plan.model_dump_json()
    
    # Format dietary preferences and allergies for prompt
    dietary_preferences_str = f"- Dietary Preferences: {', '.join(dietary_preferences)}" if dietary_preferences else "- Dietary Preferences: None specified"
    allergies_str = f"- Food Allergies: {', '.join(allergies)}" if allergies else "- Food Allergies: None specified"
    
    # Define a list of LLMs to try in order of preference
    llm_models = [
        ("llama70_llm", llama70_llm),
        ("gemma2_llm", gemma2_llm),
        ("llamaSpecdec_llm", llamaSpecdec_llm),
        ("llamaVision_llm", llamaVision_llm),
        ("deepseek_llm", deepseek_llm),
    ]
    
    last_exception = None
    
    # Try each LLM in sequence until one succeeds
    for model_name, model in llm_models:
        try:
            print(f"Trying {model_name} for meal plan update...")
            chain = update_prompt | model | parser
            result = chain.invoke({
                "previous_meal_plan": previous_meal_plan_json,
                "user_prompt": user_prompt,
                "weight": weight,
                "target_weight": target_weight,
                "weight_goal": weight_goal,
                "height": height,
                "gender": gender,
                "daily_physical_activity": daily_physical_activity,
                "dietary_preferences_str": dietary_preferences_str,
                "allergies_str": allergies_str
            })
            print(f"Successfully updated meal plan using {model_name}")
            return result
        except Exception as e:
            print(f"Error with {model_name}: {e}")
            last_exception = e
            continue
    
    # If all models fail, raise the last exception
    if last_exception:
        print("All LLM models failed to update meal plan")
        raise last_exception
    
    # Return original meal plan as fallback
    return previous_meal_plan