from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
from datetime import datetime

# === LOGGING ===
def log_decision(user_input, model_used, system_prompt, ai_response):
    log = {
        "timestamp": datetime.utcnow().isoformat(),
        "input": user_input,
        "model": model_used,
        "prompt": system_prompt,
        "response": ai_response
    }
    with open("logs/ai_decision_logs.jsonl", "a") as f:
        f.write(json.dumps(log) + "\n")

# === CRISIS DETECTION ===
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die",
    "self-harm", "cut myself", "jump off", "can't go on"
]

def is_crisis(text):
    return any(kw in text.lower() for kw in CRISIS_KEYWORDS)

# === APP SETUP ===
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
    user_input = messages[-1]["content"] if messages else ""

    # Limit message size
    if len(user_input) > 500:
        return {"response": "Please keep messages under 500 characters."}

    # 🚨 Crisis detection
    if is_crisis(user_input):
        crisis_message = (
            "⚠️ It sounds like you're going through something very difficult.\n\n"
            "**If you are in immediate danger or thinking about self-harm, please contact someone right away.**\n\n"
            "**US:** 988 Suicide & Crisis Lifeline\n"
            "**UK:** Samaritans 116 123\n"
            "**India:** iCall +91 9152987821\n\n"
            "You're not alone. You matter. Please reach out to someone who can help."
        )
        log_decision(user_input, "crisis-check", "Crisis keyword detected", crisis_message)
        return {"response": crisis_message, "crisis": True}

    # Format for Cohere API
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
            ai_response = result["text"]
            log_decision(user_input, "cohere/command-light", "strict mental health assistant", ai_response)
            return {"response": ai_response}
        else:
            raise Exception("Missing 'text' in Cohere response")

    except Exception as e:
        print("Cohere failed:", e)
        return await fallback_openrouter(messages, user_input)

# === FALLBACK: OpenRouter ===
async def fallback_openrouter(messages, user_input):
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
            fallback_response = result["choices"][0]["message"]["content"]
            log_decision(user_input, "openrouter/mistral-7b", "fallback model", fallback_response)
            return {"response": fallback_response}
        else:
            raise Exception("Invalid fallback response format")
    except Exception as e:
        print("OpenRouter failed:", e)
        return {"response": "Sorry, something went wrong while generating a response."}
