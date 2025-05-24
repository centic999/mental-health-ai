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
CITATION_MAP_EXPANDED = {
    # Anxiety and panic
    "anxiety|anxious|worry|nervous|panic|overthinking|restless|fearful|shaky|tight chest|sweaty palms|racing thoughts": {
        "title": "Anxiety Disorders",
        "url": "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
        "provider": "NIMH"
    },
    "panic attack|heart racing|hyperventilating|chest pain|suffocating|losing control": {
        "title": "Panic Disorder",
        "url": "https://www.nimh.nih.gov/health/topics/panic-disorder",
        "provider": "NIMH"
    },

    # Depression
    "depression|depressed|sadness|hopeless|empty|worthless|low mood|no energy|can't get up|crying spells|feeling numb": {
        "title": "Depression Overview",
        "url": "https://www.mayoclinic.org/diseases-conditions/depression/symptoms-causes/syc-20356007",
        "provider": "Mayo Clinic"
    },

    # PTSD
    "ptsd|trauma|flashbacks|nightmares|hypervigilance|startled|military trauma|emotional numbing": {
        "title": "PTSD Basics",
        "url": "https://www.nimh.nih.gov/health/topics/post-traumatic-stress-disorder-ptsd",
        "provider": "NIMH"
    },

    # Bipolar
    "bipolar|manic|mania|mood swings|high energy|impulsive behavior|sleep less|irritable mood": {
        "title": "Bipolar Disorder",
        "url": "https://www.nimh.nih.gov/health/topics/bipolar-disorder",
        "provider": "NIMH"
    },

    # OCD
    "ocd|obsessive|compulsions|rituals|cleaning|checking|intrusive thoughts|contamination": {
        "title": "Obsessive-Compulsive Disorder",
        "url": "https://www.nimh.nih.gov/health/topics/obsessive-compulsive-disorder-ocd",
        "provider": "NIMH"
    },

    # ADHD
    "adhd|attention|hyperactivity|impulsive|distracted|focus issues|can't sit still|zoning out": {
        "title": "ADHD",
        "url": "https://www.cdc.gov/ncbddd/adhd/index.html",
        "provider": "CDC"
    },

    # Autism
    "autism|asd|developmental disorder|social cues|nonverbal|routine behaviors": {
        "title": "Autism Spectrum Disorder",
        "url": "https://www.nimh.nih.gov/health/topics/autism-spectrum-disorders-asd",
        "provider": "NIMH"
    },

    # Eating disorders
    "eating disorder|anorexia|bulimia|binge eating|restricting food|body image issues|purging": {
        "title": "Eating Disorders",
        "url": "https://www.nimh.nih.gov/health/topics/eating-disorders",
        "provider": "NIMH"
    },

    # Sleep disorders
    "insomnia|sleep problems|can't sleep|waking up|tossing and turning|sleep schedule|overthinking at night": {
        "title": "Insomnia",
        "url": "https://www.mayoclinic.org/diseases-conditions/insomnia/symptoms-causes/syc-20355167",
        "provider": "Mayo Clinic"
    },

    # Self harm
    "self harm|cutting|hurting myself|burning|scratching|bleeding|pain as relief": {
        "title": "Understanding Self-Harm",
        "url": "https://www.nimh.nih.gov/health/publications/self-harm",
        "provider": "NIMH"
    },

    # Suicide
    "suicide|suicidal|want to die|ending it|give up|no reason to live|life is meaningless": {
        "title": "Suicide Prevention",
        "url": "https://www.nimh.nih.gov/health/topics/suicide-prevention",
        "provider": "NIMH"
    },

    # Substance use
    "addiction|addicted|craving|drug abuse|alcoholism|dependency|can't stop using": {
        "title": "Substance Use and Addiction",
        "url": "https://nida.nih.gov/publications/drugfacts/understanding-drug-use-addiction",
        "provider": "NIDA"
    },

    # Alcohol
    "alcohol|alcoholic|binge drinking|blackout|drinking problem|drinking alone": {
        "title": "Alcohol Use Disorder",
        "url": "https://www.niaaa.nih.gov/alcohols-effects-health/alcohol-use-disorder",
        "provider": "NIAAA"
    },

    # Grief
    "grief|loss|mourning|bereavement|death of loved one|passed away": {
        "title": "Coping with Grief",
        "url": "https://www.hopkinsmedicine.org/health/wellness-and-prevention/coping-with-grief-and-loss",
        "provider": "Johns Hopkins"
    },

    # Social anxiety
    "social anxiety|fear of judgment|shy|public speaking fear|avoid people": {
        "title": "Social Anxiety",
        "url": "https://www.nimh.nih.gov/health/publications/social-anxiety-disorder-more-than-just-shyness",
        "provider": "NIMH"
    },

    # General mental health
    "mental health|emotional wellbeing|psychological support|feel overwhelmed": {
        "title": "Mental Health Basics",
        "url": "https://www.cdc.gov/mentalhealth/index.htm",
        "provider": "CDC"
    },

    # Therapy
    "therapy|counseling|therapist|psychologist|talking to someone|cbt|dbt": {
        "title": "Psychotherapy Overview",
        "url": "https://www.nimh.nih.gov/health/topics/psychotherapies",
        "provider": "NIMH"
    },

    # Coping
    "coping|stress relief|managing emotions|grounding techniques|self care|relaxation": {
        "title": "Coping with Stress",
        "url": "https://www.cdc.gov/mentalhealth/stress-coping/cope-with-stress/index.html",
        "provider": "CDC"
    },

    # Burnout
    "burnout|job stress|exhaustion|overworked|emotionally drained": {
        "title": "Burnout",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8672751/",
        "provider": "BMJ"
    },

    # Mindfulness
    "meditation|mindfulness|deep breathing|relaxation|guided meditation": {
        "title": "Mindfulness for Mental Health",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3679190/",
        "provider": "Lancet Psychiatry"
    }
}


def detect_topic(user_input):
    text = user_input.lower()
    for keyword_group, source in CITATION_MAP.items():
        if any(kw.strip() in text for kw in keyword_group.split("|")):
            return source
    return None

DISCLAIMER = (
    "\n\n🩺 Please consult a licensed healthcare provider before making any decisions based on this information.\n"
    "⚠️ Disclaimer: This AI is for informational support only. It does not provide medical diagnosis or treatment. "
    "Always consult a licensed healthcare professional. We are not liable for decisions made based on this conversation."
)

def attach_disclaimer(text):
    return text.strip() + DISCLAIMER


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
            source = detect_topic(user_input)
            # Inject trusted source into prompt
            context = source["title"] + ":\n" + source["url"] if source else ""
            preamble = (
                "You are a mental health assistant. Only use trusted information from the provided source:\n\n"
                f"{context}\n\n"
                "Only give factual, supportive, emotionally safe answers. Do not speculate or make unsupported claims."
            )

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
                    "preamble": preamble
                }
            )

            result = response.json()
            ai_response = attach_disclaimer(result.get("text", "Sorry, something went wrong."))
            return {"response": ai_response, "source": source}


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
            fallback_response = attach_disclaimer(result["choices"][0]["message"]["content"])
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
