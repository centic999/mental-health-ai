from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
from datetime import datetime
import os

os.makedirs("logs", exist_ok=True)

OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")
COHERE_API_KEY = "T1nj0ddEblCtAaWlbsvlOrimidAKfiWCZH4l0ZCd"

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

# === MEDICAL SOURCE MAP ===
CITATION_MAP = {
    "anxiety": {
        "title": "Anxiety Disorders",
        "url": "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
        "provider": "NIMH"
    },
    "depression": {
        "title": "Depression Overview",
        "url": "https://www.mayoclinic.org/diseases-conditions/depression/symptoms-causes/syc-20356007",
        "provider": "Mayo Clinic"
    },
    "ptsd": {
        "title": "PTSD Basics",
        "url": "https://www.nimh.nih.gov/health/topics/post-traumatic-stress-disorder-ptsd",
        "provider": "NIMH"
    },
    "bipolar": {
        "title": "Bipolar Disorder",
        "url": "https://www.nimh.nih.gov/health/topics/bipolar-disorder",
        "provider": "NIMH"
    },
    "ocd": {
        "title": "Obsessive-Compulsive Disorder",
        "url": "https://www.nimh.nih.gov/health/topics/obsessive-compulsive-disorder-ocd",
        "provider": "NIMH"
    },
    "adhd": {
        "title": "ADHD in Teens and Adults",
        "url": "https://www.cdc.gov/ncbddd/adhd/index.html",
        "provider": "CDC"
    },
    "grief": {
        "title": "Coping with Grief and Loss",
        "url": "https://www.hopkinsmedicine.org/health/wellness-and-prevention/coping-with-grief-and-loss",
        "provider": "Johns Hopkins"
    },
    "insomnia": {
        "title": "Insomnia – Symptoms and Causes",
        "url": "https://www.mayoclinic.org/diseases-conditions/insomnia/symptoms-causes/syc-20355167",
        "provider": "Mayo Clinic"
    },
    "self harm": {
        "title": "Understanding Self-Harm",
        "url": "https://www.nimh.nih.gov/health/publications/self-harm",
        "provider": "NIMH"
    },
    "eating disorder": {
        "title": "Eating Disorders Overview",
        "url": "https://www.nimh.nih.gov/health/topics/eating-disorders",
        "provider": "NIMH"
    },
    "panic attacks": {
        "title": "Panic Disorder",
        "url": "https://www.nimh.nih.gov/health/topics/panic-disorder",
        "provider": "NIMH"
    },
    "substance abuse": {
        "title": "Substance Use Treatment",
        "url": "https://www.samhsa.gov/find-help/national-helpline",
        "provider": "SAMHSA"
    },
    "alcohol": {
        "title": "Alcohol Use Disorder",
        "url": "https://www.niaaa.nih.gov/alcohols-effects-health/alcohol-use-disorder",
        "provider": "NIAAA"
    },
    "addiction": {
        "title": "Understanding Drug Use and Addiction",
        "url": "https://nida.nih.gov/publications/drugfacts/understanding-drug-use-addiction",
        "provider": "NIDA"
    },
    "autism": {
        "title": "Autism Spectrum Disorder",
        "url": "https://www.nimh.nih.gov/health/topics/autism-spectrum-disorders-asd",
        "provider": "NIMH"
    },
    "schizophrenia": {
        "title": "Schizophrenia",
        "url": "https://www.nimh.nih.gov/health/topics/schizophrenia",
        "provider": "NIMH"
    },
    "social anxiety": {
        "title": "Social Anxiety Disorder",
        "url": "https://www.nimh.nih.gov/health/publications/social-anxiety-disorder-more-than-just-shyness",
        "provider": "NIMH"
    },
    "suicidal thoughts": {
        "title": "Suicide Prevention",
        "url": "https://www.nimh.nih.gov/health/topics/suicide-prevention",
        "provider": "NIMH"
    },
    "mental health": {
        "title": "Mental Health Overview",
        "url": "https://www.cdc.gov/mentalhealth/index.htm",
        "provider": "CDC"
    },
    "therapy": {
        "title": "Psychotherapy Basics",
        "url": "https://www.nimh.nih.gov/health/topics/psychotherapies",
        "provider": "NIMH"
    },
    "coping": {
        "title": "Coping with Stress",
        "url": "https://www.cdc.gov/mentalhealth/stress-coping/cope-with-stress/index.html",
        "provider": "CDC"
    },
    "burnout": {
        "title": "Burnout: The Modern Epidemic",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8672751/",
        "provider": "BMJ"
    },
    "child trauma": {
        "title": "Understanding Child Trauma",
        "url": "https://www.nctsn.org/what-is-child-trauma",
        "provider": "NCTSN"
    },
    "loneliness": {
        "title": "Loneliness and Health",
        "url": "https://www.nia.nih.gov/news/loneliness-and-social-isolation-are-serious-public-health-risks",
        "provider": "NIH"
    },
    "anger": {
        "title": "Managing Anger",
        "url": "https://www.apa.org/topics/anger/control",
        "provider": "APA"
    },
    "meditation": {
        "title": "Mindfulness Meditation for Mental Health",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3679190/",
        "provider": "Lancet Psychiatry"
    }
}


def detect_topic(user_input):
    for keyword in CITATION_MAP:
        if keyword in user_input.lower():
            return CITATION_MAP[keyword]
    return None

# === APP SETUP ===
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    messages = data.get("messages", [])
    user_id = data.get("user_id") 
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
            source = detect_topic(user_input)
            log_decision(user_input, "cohere/command-light", "strict mental health assistant", ai_response)
            return {
                "response": ai_response,
                "source": source
            }
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
                "Authorization": f"Bearer {OPENROUTER_KEY}",
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
            source = detect_topic(user_input)
            log_decision(user_input, "openrouter/mistral-7b", "fallback model", fallback_response)
            return {
                "response": fallback_response,
                "source": source
            }
        else:
            raise Exception("Invalid fallback response format")
    except Exception as e:
        print("OpenRouter failed:", e)
        return {"response": "Sorry, something went wrong while generating a response."}
