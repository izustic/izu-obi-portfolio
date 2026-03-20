"""
Enhanced Personal AI Assistant for Izuchukwu Obi
Features:
- RAG knowledge base with ChromaDB (seeded from real resume data)
- SQLite Q&A database (read/write)
- Evaluator + Rerun agentic pattern
- Pushover notifications for lead capture
- Multi-LLM routing (Gemini for chat, Groq for evaluation)
"""

import os
import json
import sqlite3
import requests
from dotenv import load_dotenv
from openai import OpenAI
from pypdf import PdfReader
import gradio as gr
from pydantic import BaseModel
import chromadb
from chromadb.utils import embedding_functions

load_dotenv(override=True)

# ─────────────────────────────────────────────
# LLM Clients
# ─────────────────────────────────────────────
google_api_key = os.getenv("GOOGLE_API_KEY")
gemini = OpenAI(
    api_key=google_api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)
groq = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

CHAT_MODEL = "gemini-2.5-flash"
EVAL_MODEL = "llama-3.3-70b-versatile"


# ─────────────────────────────────────────────
# Pushover notification helper
# ─────────────────────────────────────────────
def push(text: str):
    token = os.getenv("PUSHOVER_TOKEN")
    user = os.getenv("PUSHOVER_USER")
    if token and user:
        requests.post(
            "https://api.pushover.net/1/messages.json",
            data={"token": token, "user": user, "message": text},
        )
    else:
        print(f"[PUSH SKIPPED — set PUSHOVER_TOKEN/USER to enable] {text}")


# ─────────────────────────────────────────────
# SQLite Q&A Database
# ─────────────────────────────────────────────
DB_PATH = "me/qa_database.db"

def init_db():
    os.makedirs("me", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS qa_pairs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            category TEXT DEFAULT 'general',
            frequency INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_asked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    seed_data = [
        ("What is your name?",
         "My name is Izuchukwu Obi — most people call me Izu. I'm a Frontend Developer based in Lekki, Lagos, Nigeria.",
         "personal", 10),
        ("Where are you based?",
         "I'm based in Lekki, Lagos, Nigeria.",
         "personal", 8),
        ("What do you specialize in?",
         "I specialize in frontend, mobile, and blockchain development. My core stack includes React, Angular, React Native, Kotlin, Flutter, and Solidity.",
         "career", 15),
        ("Where do you currently work?",
         "I'm currently a Software Engineer at Ecobank Transnational Incorporated in Lagos, where I've been since December 2023.",
         "career", 12),
        ("What have you built at Ecobank?",
         "At Ecobank I shipped the Business App (formerly MySME) — a Kotlin/Jetpack Compose marketplace that hit 10,000+ active users in its first month. I also built a staff onboarding portal with Angular, a document upload web portal for customer onboarding, and customized the API Management Portal on Azure, boosting client satisfaction by 25%.",
         "career", 11),
        ("What technologies do you use?",
         "Core stack: JavaScript/TypeScript, React, Angular, React Native, Kotlin (XML, Jetpack Compose, KMP), Flutter, Solidity. Cloud: AWS, Azure. DevOps: Docker, GitHub Actions, Jenkins. APIs: REST & GraphQL. Testing: Jest, TDD.",
         "technical", 10),
        ("Do you do mobile development?",
         "Yes — mobile is a big part of my work. I build with React Native, Flutter, and native Kotlin including Jetpack Compose and Kotlin Multiplatform. I built the Ecobank Business App natively in Kotlin/KMP.",
         "technical", 9),
        ("Do you work with blockchain?",
         "Yes, I have blockchain experience — Solidity for smart contracts and dApp integration.",
         "technical", 7),
        ("What are your hobbies?",
         "Outside of code I enjoy chess, basketball, and swimming. I prefer activities that don't rely on long conversations!",
         "personal", 7),
        ("Are you open to new opportunities?",
         "Yes, I'm open to interesting roles — senior frontend/mobile engineering, tech lead, or product-focused positions. Drop your email and I'll follow up.",
         "career", 9),
        ("What is your educational background?",
         "I have a B.Tech from Ladoke Akintola University of Technology in Ogbomoso, Nigeria.",
         "education", 6),
        ("What certifications do you have?",
         "AWS Cloud Essentials, Google UX Foundations, Responsive Web Design (freeCodeCamp), EF SET English C2 (75/100), Meta React Basics, Meta Mobile Development, JavaScript Algorithms (freeCodeCamp), Kotlin for Java Developers (Udemy), Flutter Masterclass (Udemy), Scrum Fundamentals (SCRUMstudy).",
         "education", 8),
        ("How can I contact you?",
         "Email: izuchukwuobi997@gmail.com. Portfolio: izuportfolio.netlify.app. LinkedIn: linkedin.com/in/izustic. Or just leave your email here and I'll reach out!",
         "contact", 11),
        ("What is your portfolio website?",
         "My portfolio is at izuportfolio.netlify.app.",
         "contact", 6),
        ("Have you worked in healthcare?",
         "Yes — in addition to banking/fintech I have experience building mission-critical solutions for healthcare applications.",
         "career", 4),
        ("What was your role at Centbit?",
         "At Centbit (Jul–Nov 2023, San Francisco) I was a Frontend Developer. I built mobile-responsive web apps with Material UI and React, deployed on AWS, and created reusable component libraries in an agile environment.",
         "career", 5),
        ("What did you do at Decagon?",
         "At Decagon Institute (Jan–Jul 2023) I was a Full Stack Engineer. I led a team of 7 engineers building a facility management app with ReactJS and Node.js — 80%+ customer satisfaction and 35% reduction in mobile load times.",
         "career", 5),
    ]
    c.executemany(
        "INSERT OR IGNORE INTO qa_pairs (question, answer, category, frequency) VALUES (?, ?, ?, ?)",
        seed_data,
    )
    conn.commit()
    conn.close()

init_db()


# ─────────────────────────────────────────────
# RAG Knowledge Base (ChromaDB)
# ─────────────────────────────────────────────
KNOWLEDGE_DOCS = [
    {
        "id": "bio_core",
        "content": (
            "Izuchukwu Obi is a Frontend Developer based in Lekki, Lagos, Nigeria. "
            "He specializes in frontend, mobile, and blockchain development. "
            "Currently a Software Engineer at Ecobank Transnational Incorporated (Dec 2023–present). "
            "Email: izuchukwuobi997@gmail.com. Portfolio: izuportfolio.netlify.app. "
            "LinkedIn: linkedin.com/in/izustic. GitHub: github.com/izustic."
        ),
        "metadata": {"category": "biography"}
    },
    {
        "id": "skills_frontend_mobile",
        "content": (
            "Frontend: JavaScript ES6+, TypeScript, React, Angular, Material UI, Tailwind CSS. "
            "Mobile: React Native, Flutter, Kotlin (XML, Jetpack Compose, Kotlin Multiplatform/KMP). "
            "Blockchain: Solidity for smart contracts and dApp integration. "
            "Testing: Jest, integration testing, E2E, TDD. "
            "UI/UX: Figma, responsive design, cross-platform mobile-first interfaces."
        ),
        "metadata": {"category": "technical"}
    },
    {
        "id": "skills_cloud_devops",
        "content": (
            "Cloud & DevOps: AWS (hosting/deployment), Azure (API Management Gateway), Docker. "
            "APIs: REST, GraphQL. Version control: Git, GitHub, GitLab. "
            "CI/CD: Jenkins, GitHub Actions. Also experienced with Generative AI integrations."
        ),
        "metadata": {"category": "technical"}
    },
    {
        "id": "experience_ecobank",
        "content": (
            "Software Engineer at Ecobank Transnational Incorporated, Lagos (Dec 2023–present). "
            "Built responsive enterprise banking solutions with Angular and React Native. "
            "Shipped Ecobank Business App (formerly MySME) — 10,000+ active users in first month. "
            "Built the app natively in Kotlin with Jetpack Compose; used KMP for iOS/Android code reuse. "
            "Built staff onboarding portal with Angular for HR integration. "
            "Built Ecobank Web Portal for document upload and customer onboarding. "
            "Customized Azure API Management Portal — boosted client satisfaction 25%."
        ),
        "metadata": {"category": "experience"}
    },
    {
        "id": "experience_centbit_decagon",
        "content": (
            "Frontend Developer at Centbit (Jul–Nov 2023, San Francisco, USA): "
            "Built mobile-responsive apps with Material UI and React. Deployed on AWS. "
            "Reusable React components in agile sprints. "
            "Full Stack Engineer at Decagon Institute (Jan–Jul 2023, Lagos): "
            "Led 7-engineer team on facility management app — ReactJS + Node.js. "
            "80%+ customer satisfaction; 35% mobile load time reduction via refactoring."
        ),
        "metadata": {"category": "experience"}
    },
    {
        "id": "education_certs",
        "content": (
            "B.Tech — Ladoke Akintola University of Technology, Ogbomoso, Nigeria. "
            "Certs: AWS Cloud Essentials, Google UX Foundations, Responsive Web Design (freeCodeCamp), "
            "EF SET English C2 Proficient 75/100, Meta React Basics, Meta Mobile Dev Intro, "
            "JavaScript Algorithms (freeCodeCamp), Kotlin for Java Devs (Udemy), "
            "Flutter Masterclass (Udemy), Scrum Fundamentals (SCRUMstudy)."
        ),
        "metadata": {"category": "education"}
    },
    {
        "id": "personal_goals",
        "content": (
            "Hobbies: chess, basketball, swimming. Prefers directness and hands-on building over meetings. "
            "Long-term goals in tech and product development. "
            "Open to senior engineering, tech lead, and founding engineer roles."
        ),
        "metadata": {"category": "personal"}
    },
]

def build_rag_index():
    client = chromadb.Client()
    try:
        ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    except Exception:
        ef = embedding_functions.DefaultEmbeddingFunction()
    try:
        collection = client.get_collection("izuchukwu_kb", embedding_function=ef)
    except Exception:
        collection = client.create_collection("izuchukwu_kb", embedding_function=ef)
        collection.add(
            ids=[d["id"] for d in KNOWLEDGE_DOCS],
            documents=[d["content"] for d in KNOWLEDGE_DOCS],
            metadatas=[d["metadata"] for d in KNOWLEDGE_DOCS],
        )
    return collection

rag_collection = build_rag_index()


def rag_search(query: str, n_results: int = 3) -> str:
    results = rag_collection.query(query_texts=[query], n_results=n_results)
    docs = results.get("documents", [[]])[0]
    return "\n\n".join(docs) if docs else ""


# ─────────────────────────────────────────────
# Tool Functions
# ─────────────────────────────────────────────
def record_user_details(email: str, name: str = "Name not provided", notes: str = "not provided"):
    push(f"🎯 New Lead: {name} | {email} | Notes: {notes}")
    return {"recorded": "ok"}


def record_unknown_question(question: str):
    push(f"❓ Unknown: {question}")
    return {"recorded": "ok"}


def search_qa_database(query: str) -> dict:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT question, answer, category FROM qa_pairs
        WHERE question LIKE ? OR answer LIKE ?
        ORDER BY frequency DESC LIMIT 3
    """, (f"%{query}%", f"%{query}%"))
    rows = c.fetchall()
    if rows:
        c.execute("UPDATE qa_pairs SET frequency = frequency + 1, last_asked = CURRENT_TIMESTAMP WHERE question LIKE ?",
                  (f"%{query}%",))
        conn.commit()
    conn.close()
    if rows:
        return {"found": True, "results": [{"question": r[0], "answer": r[1], "category": r[2]} for r in rows]}
    return {"found": False, "results": []}


def save_new_qa(question: str, answer: str, category: str = "general") -> dict:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO qa_pairs (question, answer, category) VALUES (?, ?, ?)", (question, answer, category))
    conn.commit()
    conn.close()
    push(f"📝 New Q&A: {question[:60]}")
    return {"saved": "ok"}


def get_portfolio_projects() -> dict:
    return {"projects": [
        {"name": "Ecobank Business App (formerly MySME)", "period": "Jun 2024–present",
         "description": "Native marketplace app connecting vendors and customers. Kotlin + Jetpack Compose. KMP for iOS/Android code reuse.",
         "tech": ["Kotlin", "Jetpack Compose", "KMP"], "impact": "10,000+ active users in month one."},
        {"name": "Ecobank Web Portal", "period": "Oct 2024–present",
         "description": "Document upload portal for web-based customer onboarding.",
         "tech": ["Angular", "TypeScript"], "impact": "Streamlined onboarding flow."},
        {"name": "API Management Portal", "period": "Dec 2023–present",
         "description": "Customized Azure APIM portal with WordPress themes and React Widgets.",
         "tech": ["Azure APIM", "React", "WordPress"], "impact": "+25% client satisfaction."},
        {"name": "Facility Management App (Decagon)", "period": "Jan–Jul 2023",
         "description": "Full-stack mobile-first app, led 7-engineer team.",
         "tech": ["ReactJS", "Node.js"], "impact": "80%+ satisfaction; 35% faster mobile load."},
        {"name": "E-Shoppe", "period": "Dec 2022–Jan 2023",
         "description": "Mobile-responsive e-commerce store with item pagination.",
         "tech": ["React"], "impact": "Personal project."},
    ]}


def get_certifications() -> dict:
    return {"certifications": [
        {"name": "AWS Cloud Essentials", "issuer": "AWS"},
        {"name": "Foundations of User Experience", "issuer": "Google"},
        {"name": "Responsive Web Design", "issuer": "freeCodeCamp"},
        {"name": "EF SET English C2 Proficient (75/100)", "issuer": "EF SET"},
        {"name": "Introduction to Mobile Development", "issuer": "Meta"},
        {"name": "JavaScript Algorithms and Data Structures", "issuer": "freeCodeCamp"},
        {"name": "React Basics", "issuer": "Meta"},
        {"name": "Kotlin for Java Developers", "issuer": "Udemy"},
        {"name": "Flutter Masterclass", "issuer": "Udemy"},
        {"name": "Scrum Fundamentals Certified", "issuer": "SCRUMstudy"},
    ]}


# ─────────────────────────────────────────────
# Tool Schemas
# ─────────────────────────────────────────────
tools = [
    {"type": "function", "function": {
        "name": "record_user_details",
        "description": "Record a user's email and details when they want to stay in touch",
        "parameters": {"type": "object", "properties": {
            "email": {"type": "string"},
            "name": {"type": "string"},
            "notes": {"type": "string"},
        }, "required": ["email"], "additionalProperties": False},
    }},
    {"type": "function", "function": {
        "name": "record_unknown_question",
        "description": "Log any question that couldn't be answered",
        "parameters": {"type": "object", "properties": {
            "question": {"type": "string"},
        }, "required": ["question"], "additionalProperties": False},
    }},
    {"type": "function", "function": {
        "name": "search_qa_database",
        "description": "Search the Q&A knowledge database. ALWAYS call this first before answering factual questions about Izuchukwu.",
        "parameters": {"type": "object", "properties": {
            "query": {"type": "string"},
        }, "required": ["query"], "additionalProperties": False},
    }},
    {"type": "function", "function": {
        "name": "save_new_qa",
        "description": "Save a new Q&A pair to the database",
        "parameters": {"type": "object", "properties": {
            "question": {"type": "string"},
            "answer": {"type": "string"},
            "category": {"type": "string"},
        }, "required": ["question", "answer"], "additionalProperties": False},
    }},
    {"type": "function", "function": {
        "name": "get_portfolio_projects",
        "description": "Get detailed info on Izuchukwu's projects and work history",
        "parameters": {"type": "object", "properties": {}, "additionalProperties": False},
    }},
    {"type": "function", "function": {
        "name": "get_certifications",
        "description": "Get Izuchukwu's professional certifications list",
        "parameters": {"type": "object", "properties": {}, "additionalProperties": False},
    }},
]

TOOL_MAP = {
    "record_user_details": record_user_details,
    "record_unknown_question": record_unknown_question,
    "search_qa_database": search_qa_database,
    "save_new_qa": save_new_qa,
    "get_portfolio_projects": get_portfolio_projects,
    "get_certifications": get_certifications,
}


# ─────────────────────────────────────────────
# Me Class — Main Agent
# ─────────────────────────────────────────────
class Me:
    def __init__(self):
        self.name = "Izuchukwu Obi"
        self.linkedin = self._load_linkedin()
        self.summary = self._load_summary()

    def _load_linkedin(self) -> str:
        path = "me/linkedin.pdf"
        if not os.path.exists(path):
            return "(Resume PDF not found — relying on knowledge base and Q&A database)"
        try:
            reader = PdfReader(path)
            return "".join(p.extract_text() or "" for p in reader.pages)
        except Exception as e:
            return f"(Could not read resume: {e})"

    def _load_summary(self) -> str:
        path = "me/summary.txt"
        os.makedirs("me", exist_ok=True)
        default = (
            "Izuchukwu Obi is a software engineer specializing in frontend, mobile, and blockchain development. "
            "He is currently a Software Engineer at Ecobank Transnational Incorporated in Lagos, Nigeria. "
            "He built the Ecobank Business App (10,000+ users), works with Kotlin, React, Angular, React Native, "
            "Flutter, and Solidity. He's based in Lekki, Lagos, and enjoys chess, basketball, and swimming."
        )
        if not os.path.exists(path):
            with open(path, "w") as f:
                f.write(default)
            return default
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def system_prompt(self, rag_context: str = "") -> str:
        p = (
            f"You are acting as {self.name}. You answer questions on his personal website about his career, "
            f"skills, background, and experience. Represent him faithfully — professional, warm, direct.\n\n"
            f"Rules:\n"
            f"- ALWAYS call search_qa_database first for any factual question about Izuchukwu.\n"
            f"- For project/work questions, call get_portfolio_projects.\n"
            f"- For certification/qualification questions, call get_certifications.\n"
            f"- For unknown questions, call record_unknown_question.\n"
            f"- Naturally ask for the user's email; record it with record_user_details.\n"
            f"- Never invent facts. Stick to provided context and tool results.\n"
            f"- Be concise and direct — Izu values efficiency.\n\n"
        )
        p += f"## Summary:\n{self.summary}\n\n"
        p += f"## Resume:\n{self.linkedin}\n\n"
        if rag_context:
            p += f"## Knowledge Base Context:\n{rag_context}\n\n"
        p += f"Now chat with the user as {self.name}."
        return p

    def handle_tool_calls(self, tool_calls, messages: list) -> list:
        messages.append({
            "role": "assistant", "content": None,
            "tool_calls": [{"id": tc.id, "type": "function",
                            "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                           for tc in tool_calls],
        })
        for tc in tool_calls:
            fn_name = tc.function.name
            args = json.loads(tc.function.arguments)
            print(f"[TOOL] {fn_name}({args})")
            fn = TOOL_MAP.get(fn_name)
            result = fn(**args) if fn else {"error": "unknown tool"}
            messages.append({"role": "tool", "content": json.dumps(result), "tool_call_id": tc.id})
        return messages

    def generate_reply(self, message: str, history: list) -> tuple[str, list]:
        rag_ctx = rag_search(message)
        messages = [{"role": "system", "content": self.system_prompt(rag_context=rag_ctx)}] + history + [{"role": "user", "content": message}]
        for _ in range(6):
            response = gemini.chat.completions.create(model=CHAT_MODEL, messages=messages, tools=tools)
            choice = response.choices[0]
            if choice.finish_reason == "tool_calls":
                messages = self.handle_tool_calls(choice.message.tool_calls, messages)
            else:
                return choice.message.content, messages
        return "Something went wrong — please try again.", messages

    def chat(self, message: str, history: list) -> str:
        reply, _ = self.generate_reply(message, history)
        evaluation = evaluate(reply, message, history)
        if evaluation.is_acceptable:
            print("[EVAL] ✅ Passed")
            return reply
        print(f"[EVAL] ❌ Rejected — {evaluation.feedback}")
        return rerun(reply, message, history, evaluation.feedback, self)


# ─────────────────────────────────────────────
# Evaluator
# ─────────────────────────────────────────────
class Evaluation(BaseModel):
    is_acceptable: bool
    feedback: str


EVAL_SYSTEM = (
    "You evaluate replies from an AI representing Izuchukwu Obi (Frontend/Mobile/Blockchain Engineer at Ecobank, Lagos). "
    "Criteria: (1) factually accurate — no hallucinated jobs/projects/skills, "
    "(2) professional and warm tone, (3) stays in character, (4) steers toward contact when natural. "
    "Reply with is_acceptable and concise feedback."
)


def evaluate(reply: str, message: str, history: list) -> Evaluation:
    try:
        response = groq.beta.chat.completions.parse(
            model=EVAL_MODEL,
            messages=[
                {"role": "system", "content": EVAL_SYSTEM},
                {"role": "user", "content": f"History: {json.dumps(history[-4:])}\nUser: {message}\nAgent: {reply}\nEvaluate:"},
            ],
            response_format=Evaluation,
        )
        return response.choices[0].message.parsed
    except Exception as e:
        print(f"[EVAL ERROR] {e}")
        return Evaluation(is_acceptable=True, feedback="Skipped")


def rerun(reply: str, message: str, history: list, feedback: str, me: "Me") -> str:
    rag_ctx = rag_search(message)
    sys = (
        me.system_prompt(rag_context=rag_ctx)
        + f"\n\n## ⚠️ Previous reply was rejected\nAttempted reply:\n{reply}\nReason: {feedback}\nPlease improve."
    )
    messages = [{"role": "system", "content": sys}] + history + [{"role": "user", "content": message}]
    return gemini.chat.completions.create(model=CHAT_MODEL, messages=messages).choices[0].message.content


# ─────────────────────────────────────────────
# Launch
# ─────────────────────────────────────────────
if __name__ == "__main__":
    me = Me()
    gr.ChatInterface(
        me.chat,
        type="messages",
        title="Chat with Izuchukwu Obi",
        description="Ask me about my work, skills, or background. Happy to connect!",
    ).launch()
