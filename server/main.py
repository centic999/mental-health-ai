from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

COHERE_API_KEY = "T1nj0ddEblCtAaWlbsvlOrimidAKfiWCZH4l0ZCd"

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    messages = data.get("messages", [])
    if len(messages[-1]["content"]) > 500:
        return {"response": "Please keep messages under 500 characters."}
    # Format messages for Cohere
    formatted = [
        {"role": "USER" if m["role"] == "user" else "CHATBOT", "message": m["content"]}
        for m in messages
    ]

    try:
        response = requests.post(
            "https://api.cohere.ai/v1/chat",
            headers={
                "Authorization": f"Bearer {COHERE_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "chat_history": formatted[:-1],
                "message": formatted[-1]["message"],
                "model": "command-light",
                "temperature": 0.7,
                "max_tokens": 300,
                "preamble": (
                    "You are a strict mental health assistant. "
                    "Your purpose is to support users with emotional and mental well-being. "
                    "If a user asks about anything unrelated — like facts, jokes, news, or trivia — respond with: "
                    "'I'm here to support your mental and emotional well-being. I can't help with that topic.' "
                    "Do not answer questions unrelated to mental health."
                )
            }
        )
        result = response.json()
        if "text" in result:
            return {"response": result["text"]}
        else:
            raise Exception("Missing 'text'")
    except Exception as e:
        print("Cohere failed:", e)
        # fallback to OpenRouter (see below)
        return await fallback_openrouter(messages)

async def fallback_openrouter(messages):
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer YOUR_OPENROUTER_API_KEY",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://yourwebsite.com",
                "X-Title": "MentalHealthHelper"
            },
            json={
                "model": "mistralai/mistral-7b-instruct:free",
                "messages": messages,
                "max_tokens": 300
            }
        )
        result = response.json()
        if "choices" in result:
            return {"response": result["choices"][0]["message"]["content"]}
        else:
            raise Exception("OpenRouter response invalid")
    except Exception as e:
        print("OpenRouter failed:", e)
        return {"response": "Sorry, something went wrong."}
