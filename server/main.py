from fastapi import FastAPI, HTTPException, Request, File, UploadFile, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Nyastra AI Legal Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Safe startup: import and init everything with graceful error handling ───────
try:
    from ai_orchestrator import LlmOrchestrator
    orchestrator = LlmOrchestrator()
except Exception as e:
    print(f"WARN: AI Orchestrator failed to init: {e}")
    orchestrator = None

try:
    from rag_engine import RagEngine
    rag_engine = RagEngine()
except Exception as e:
    print(f"WARN: RAG Engine failed to init: {e}")
    rag_engine = None

try:
    from document_gen import DocumentGenerator
    doc_gen = DocumentGenerator()
except Exception as e:
    print(f"WARN: Document Generator failed to init: {e}")
    doc_gen = None

try:
    from legal_data import IndianKanoonFetcher
    kanoon = IndianKanoonFetcher(api_token=os.getenv("INDIAN_KANOON_API_KEY"))
except Exception as e:
    print(f"WARN: Indian Kanoon fetcher failed to init: {e}")
    kanoon = None


# ── Request / Response Models ──────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    provider: Optional[str] = "groq"
    use_rag: Optional[bool] = True
    use_search: Optional[bool] = False
    attachment_base64: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    provider: str
    context_used: bool
    search_used: bool

class SearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 5

class DocRequest(BaseModel):
    doc_type: str
    content: str
    title: str = "Legal Document"
    format: str = "docx"


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Nyastra AI Backend is running.",
    }

@app.get("/health")
async def health():
    """Returns the live status of each AI provider."""
    providers = orchestrator.get_available_providers() if orchestrator else []
    return {
        "status": "online",
        "providers": {
            "groq": "groq" in providers,
            "gemini": "gemini" in providers,
            "openai": "openai" in providers,
            "claude": "anthropic" in providers,
        },
        "rag": rag_engine is not None,
        "doc_gen": doc_gen is not None,
        "indian_kanoon": bool(os.getenv("INDIAN_KANOON_API_KEY")),
    }

@app.post("/web-search")
async def web_search(request: SearchRequest):
    if not orchestrator:
        raise HTTPException(status_code=503, detail="AI Orchestrator not initialized.")
    try:
        results = orchestrator.web_search(request.query, request.max_results)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not orchestrator:
        raise HTTPException(status_code=503, detail="AI Orchestrator not initialized. Please set an API key in .env and restart.")
    try:
        context = ""
        context_used = False
        search_used = False

        if request.use_rag and rag_engine:
            context = rag_engine.get_context_text(request.message)
            if context:
                context_used = True

        if request.use_search:
            search_context = orchestrator.web_search(request.message)
            context = (context + "\n\n" + search_context) if context else search_context
            search_used = True

        full_prompt = (
            f"Legal Context (from database & web):\n{context}\n\nAdvocate's Question: {request.message}"
            if context else request.message
        )

        response = await orchestrator.ask_legal_question(
            question=full_prompt,
            provider=request.provider,
            attachment_base64=request.attachment_base64
        )

        # Determine which provider was actually used
        used_provider = request.provider
        available = orchestrator.get_available_providers()
        if request.provider not in available and available:
            used_provider = available[0]

        return ChatResponse(
            response=response,
            provider=used_provider,
            context_used=context_used,
            search_used=search_used
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-document")
async def generate_document(request: DocRequest):
    if not doc_gen:
        raise HTTPException(status_code=503, detail="Document Generator not initialized.")
    try:
        filename = f"nyastra_doc_{os.urandom(4).hex()}"
        if request.format == "docx":
            path = doc_gen.generate_docx(filename, request.content, request.title)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        else:
            path = doc_gen.generate_pdf(filename, request.content, request.title)
            media_type = "application/pdf"
            
        return FileResponse(
            path,
            filename=f"{request.title.replace(' ', '_')}.{request.format}",
            media_type=media_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/draft-legal-document")
async def draft_legal_document(request: Request, doc_type: str, format: str = "docx"):
    if not orchestrator or not doc_gen:
        raise HTTPException(status_code=503, detail="AI Orchestrator or Document Generator not initialized.")
    try:
        data = await request.json()
        content = await orchestrator.draft_legal_document(doc_type, data)

        filename = f"nyastra_ai_draft_{os.urandom(4).hex()}"
        if format == "docx":
            path = doc_gen.generate_docx(filename, content, f"{doc_type}")
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        else:
            path = doc_gen.generate_pdf(filename, content, f"{doc_type}")
            media_type = "application/pdf"

        return FileResponse(
            path,
            filename=f"{doc_type.replace(' ', '_')}.{format}",
            media_type=media_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search-cases")
async def search_cases(query: str):
    """Search Indian Kanoon or DuckDuckGo, and parse into structured cases using LLM."""
    search_results = ""
    source = "none"

    # Try Indian Kanoon first if token exists
    if kanoon and os.getenv("INDIAN_KANOON_API_KEY"):
        try:
            raw_results = await kanoon.search_cases(query)
            if raw_results:
                import json
                search_results = json.dumps(raw_results, indent=2)
                source = "indiankanoon"
        except Exception as e:
            print(f"Indian Kanoon search failed: {e}")

    # Fallback to DuckDuckGo search if Indian Kanoon isn't configured or failed
    if not search_results and orchestrator:
        try:
            search_results = orchestrator.web_search(f"{query} judgment", max_results=20)
            source = "web"
        except Exception as e:
            print(f"DuckDuckGo search failed: {e}")

    # If we have orchestrator, use it to structure search results or generate real cases
    if orchestrator:
        prompt = f"""You are Nyastra AI, an expert Indian legal research engine.
Find the most relevant and accurate Indian court judgments for the following query: "{query}"

Search Results/Context:
{search_results if search_results else "No search results available."}

RULES:
- Return ONLY real, verifiable Indian court judgments. Do NOT hallucinate or invent any case.
- Extract and prioritize the cases mentioned in the Search Results above. Use your internal knowledge to supplement details or provide well-known cases only if the search results do not contain relevant cases.
- Return at least 15 cases (or as many as available, aiming for 15 to 20 cases), ranked by relevance (most relevant first).

Respond ONLY with a valid JSON object matching this exact schema (no markdown formatting, no code fences, no other text):
{{
  "cases": [
    {{
      "title": "Full case name with year (e.g. Shreya Singhal v. Union of India (2015))",
      "court": "Court name (e.g. Supreme Court of India, Delhi High Court)",
      "date": "YYYY-MM-DD",
      "sections": ["Relevant Acts/Sections/Articles"],
      "summary": "2-3 sentence factual summary of what the case decided and why it matters.",
      "link": "URL of the case source if found in the search results, or a real indiankanoon.org URL, or empty string"
    }}
  ]
}}"""
        try:
            import json
            import re
            response_text = await orchestrator.ask_legal_question(
                question=prompt,
                provider="groq"
            )
            # Extract JSON
            json_match = re.search(r"\{[\s\S]*\}", response_text)
            if json_match:
                parsed = json.loads(json_match.group(0))
                if "cases" in parsed and isinstance(parsed["cases"], list):
                    return {"results": parsed["cases"], "source": source}
        except Exception as e:
            print(f"Error parsing AI response in search_cases: {e}")

    return {"results": [], "source": "none"}


def extract_text_from_bytes(file_content: bytes, filename: str) -> str:
    import io
    if filename.endswith(".pdf"):
        try:
            from pypdf import PdfReader
            pdf_file = io.BytesIO(file_content)
            reader = PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text.strip()
        except Exception as e:
            print(f"Error parsing PDF: {e}")
            return ""
    elif filename.endswith((".docx", ".doc")):
        try:
            import docx
            docx_file = io.BytesIO(file_content)
            doc = docx.Document(docx_file)
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error parsing Word document: {e}")
            return ""
    else:
        # Default to raw text decode
        try:
            return file_content.decode("utf-8").strip()
        except Exception:
            try:
                return file_content.decode("latin-1").strip()
            except Exception:
                return ""


@app.post("/analyze-case")
async def analyze_case(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    if not orchestrator:
        raise HTTPException(status_code=503, detail="AI Orchestrator not initialized.")

    case_text = ""
    if file:
        file_content = await file.read()
        case_text = extract_text_from_bytes(file_content, file.filename)
    elif text:
        case_text = text

    if not case_text or not case_text.strip():
        raise HTTPException(status_code=400, detail="No case text or file uploaded, or file content is unreadable.")

    # Step 1: Extract key facts, issues, and suggested search query
    extraction_prompt = f"""You are Nyastra AI, an expert Indian legal assistant.
Analyze the following case facts/document text and extract the key information needed to perform a legal case search.

Case Text:
{case_text[:8000]}

Respond ONLY with a valid JSON object matching this exact schema (no markdown formatting, no code fences, no other text):
{{
  "summary": "A concise 2-3 sentence summary of the core facts and legal dispute of this case.",
  "issues": ["List of key legal issues, Acts, Sections, or constitutional Articles (e.g. IPC Section 420, Cheating, Contract Breach)"],
  "search_query": "A highly effective, concise search query (5-8 words) to find similar judgments/cases in India (e.g. 'dishonour of cheque section 138 ni act')"
}}"""

    import json
    import re
    analysis = {"summary": "Unknown case", "issues": [], "search_query": case_text[:100]}
    
    try:
        response_text = await orchestrator.ask_legal_question(
            question=extraction_prompt,
            provider="groq"
        )
        json_match = re.search(r"\{[\s\S]*\}", response_text)
        if json_match:
            analysis = json.loads(json_match.group(0))
    except Exception as e:
        print(f"Error during case extraction step: {e}")

    # Step 2: Perform web search for similar cases
    search_query = analysis.get("search_query", "")
    search_results = ""
    if search_query:
        try:
            search_results = orchestrator.web_search(f"{search_query} judgment", max_results=15)
        except Exception as e:
            print(f"Web search failed in analyze_case: {e}")

    # Step 3: Rank and structure the similar cases
    mapping_prompt = f"""You are Nyastra AI, an expert Indian legal research engine.
We are searching for similar past court judgments for a target case with the following details:
Summary: {analysis.get("summary")}
Key Issues: {", ".join(analysis.get("issues", []))}

Search Results/Context containing potential similar judgments:
{search_results if search_results else "No search results available."}

RULES:
- Return ONLY real, verifiable Indian court judgments. Do NOT hallucinate or invent any case.
- Review the search results and rank the most similar cases. Compare each case's legal facts and issues to our target case, and assign a similarity/relevance percentage (between 0% and 100%).
- Return between 4 and 8 cases, ranked by similarity (highest similarity first).

Respond ONLY with a valid JSON object matching this exact schema (no markdown formatting, no code fences, no other text):
{{
  "cases": [
    {{
      "title": "Full case name with year (e.g. Shreya Singhal v. Union of India (2015))",
      "court": "Court name (e.g. Supreme Court of India, Delhi High Court)",
      "date": "YYYY-MM-DD",
      "sections": ["Relevant Acts/Sections/Articles"],
      "summary": "2-3 sentence factual summary of what the case decided, why it matters, and why it is similar to the target case.",
      "relevance": 85,
      "link": "URL of the case source if found in the search results, or a real indiankanoon.org URL, or empty string"
    }}
  ]
}}"""

    similar_cases = []
    try:
        response_text = await orchestrator.ask_legal_question(
            question=mapping_prompt,
            provider="groq"
        )
        json_match = re.search(r"\{[\s\S]*\}", response_text)
        if json_match:
            parsed = json.loads(json_match.group(0))
            if "cases" in parsed and isinstance(parsed["cases"], list):
                similar_cases = parsed["cases"]
    except Exception as e:
        print(f"Error during similar cases mapping step: {e}")

    return {
        "summary": analysis.get("summary"),
        "issues": analysis.get("issues"),
        "results": similar_cases
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
