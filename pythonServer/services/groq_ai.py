import os
from dotenv import load_dotenv
from groq import Groq
import json
from ..schemas import MealPlan

load_dotenv()


class GroqService:
    client: None

    def __init__(self):
        self.client = Groq(
            api_key=os.environ.get("GROQ_API_KEY"),
        )

    def generateText(self, content):
        stream = self.client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": content,
                }
            ],
            model="mixtral-8x7b-32768",
            stream=True,
            temperature=0.7,
        )

        return stream

        for chunk in stream:
            print(
                chunk.choices[0].delta.content, end=""
            )  # The end="" in the print function specifies what should be appended at the end of the printed output. By default, Python's print() function appends a newline (\n) after each call, so each print statement outputs on a new line.
            # Here It tells Python not to append a newline at the end of the printed output. Instead, nothing is appended (or you can specify a custom string to append).

    def generateJson(self, system_content: str, user_content: str):
        chat_completion = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_content,
                },
                {
                    "role": "user",
                    "content": user_content,
                },
            ],
            model="mixtral-8x7b-32768",
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        return chat_completion

        mcqList = MealPlan.model_validate_json(
            chat_completion.choices[0].message.content
        )
        print(
            json.dumps(MealPlan.dict(), indent=4)
        )


        #   OR

        # mcqList = chat_completion.choices[0].message.content
        # print(mcqList)


# for json response
async def aiService(
    age:float,
    weight:float,
    targetWeight:float,
    height: float,
    gender: str,
    DailyPhysicalActivity: str):
    client = GroqService()
    chat_completion = client.generateJson(
        system_content=f"""
        You are a professional nutritionist AI assistant. Based on the following user details, generate a **7-day meal plan** that is **balanced, nutritious, and tailored to their needs**.

### **User Details:**
- **Age:** {age}  
- **Current Weight:** {weight}  
- **Target Weight:** {targetWeight}  
- **Height:** {height} centimeters
- **Gender:** {gender}  
- **Daily Physical Activity Level:** {DailyPhysicalActivity}

### **Meal Plan Guidelines:**
- Provide **three main meals (breakfast, lunch, dinner)** and **two healthy snacks** per day.
- Ensure **adequate protein, complex carbohydrates, and healthy fats** for balanced nutrition.
- **Adjust calorie intake** to align with weight goals.
  - If the user is **losing weight**, suggest a caloric deficit (~300-500 kcal/day).
  - If the user is **gaining weight**, suggest a caloric surplus (~300-500 kcal/day).
- Include **hydration recommendations** where necessary.
- Prefer **whole, unprocessed foods** and avoid excessive sugar or unhealthy fats.
- Mention portion sizes in **grams or servings** where applicable.
- Keep **cultural and dietary preferences in mind** (e.g., vegetarian, keto, gluten-free if specified).
- The final output should be structured in **JSON format**. 
        The json format should be as follows:
        {json.dumps(MealPlan.model_json_schema(), indent=4)}
        """,
        user_content="""
I need a personalized **7-day meal plan** based on my details:

- **Age:** {age}  
- **Current Weight:** {weight}  
- **Target Weight:** {targetWeight}  
- **Height:** {height} centimeters
- **Gender:** {gender}  
- **Daily Physical Activity Level:** {DailyPhysicalActivity}  

📌 **Requirements:**  
- The meal plan should include **breakfast, two snacks, lunch, and dinner** for each day.  
- Ensure **balanced macronutrients (protein, carbs, fats)** to support my goal.  
- Provide **portion sizes** and **daily caloric intake** for each day.  
- Keep food **diverse and healthy** throughout the week.  
- Mention **hydration recommendations**.  
- Return the output in **JSON format** for easy parsing.
        """,
    )

    # mcqList = chat_completion.choices[0].message.content
    # print(mcqList)
    return chat_completion
    
# aiService()