import { useState } from "react";
import { Search, BookOpen, Calendar, Scale, Loader2, ExternalLink, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";


type CaseResult = {
  title: string;
  court: string;
  date: string;
  sections: string[];
  summary: string;
  link?: string;
};

type FilterType = "All" | "Supreme Court" | "High Court" | "Tribunal";

const FILTERS: FilterType[] = ["All", "Supreme Court", "High Court", "Tribunal"];




export default function CaseSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CaseResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [source, setSource] = useState<string>("");

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setSearched(true);
    setResults([]);
    setActiveFilter("All");
    setSource("");

    const CASE_JSON_PROMPT = `You are Nyastra AI, an expert Indian legal research engine. Find the most relevant and accurate Indian court judgments for the following query: "${query}"

RULES:
- Return ONLY real, verifiable Indian court judgments. Do NOT hallucinate or invent any case.
- Each case MUST be directly and specifically related to the search query.
- Return between 4 and 6 cases, ranked by relevance (most relevant first).
- The "link" field should be a real indiankanoon.org URL if you know it, or omit it.

Respond ONLY with a valid JSON object matching this exact schema (no markdown, no explanation):
{
  "cases": [
    {
      "title": "Full case name with year",
      "court": "Court name (e.g., Supreme Court of India, Delhi High Court)",
      "date": "YYYY-MM-DD",
      "sections": ["Relevant Acts/Sections/Articles"],
      "summary": "2-3 sentence factual summary of what the case decided and why it matters.",
      "link": "https://indiankanoon.org/doc/..."
    }
  ]
}`;

    // ── Strategy 1: Use backend AI Search ──────────
    try {
      const res = await fetch(`${API_BASE_URL}/search-cases?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          setResults(data.results);
          const displaySource = data.source === "indiankanoon"
            ? "Indian Kanoon"
            : `Nyastra AI (Search & Groq)`;
          setSource(displaySource);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Backend offline or error, try next strategy
    }

    // ── Strategy 2: Direct Gemini API (if VITE_GEMINI_API_KEY is set) ──────
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (GEMINI_API_KEY) {
      try {
        const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        const resp = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: CASE_JSON_PROMPT }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  cases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        court: { type: "string" },
                        date: { type: "string" },
                        sections: { type: "array", items: { type: "string" } },
                        summary: { type: "string" },
                        link: { type: "string" },
                      },
                      required: ["title", "court", "date", "sections", "summary"],
                    },
                  },
                },
                required: ["cases"],
              },
            },
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (parsed.cases && parsed.cases.length > 0) {
              setResults(parsed.cases);
              setSource("Gemini AI");
              setLoading(false);
              return;
            }
          }
        }
      } catch {
        // Gemini failed, show error below
      }
    }

    // ── No results ─────────────────────────────────────────────────────────
    toast.error(
      "Could not retrieve results. Make sure the backend server is running and an AI API key (GROQ_API_KEY or VITE_GEMINI_API_KEY) is configured in your .env file.",
      { duration: 6000 }
    );
    setResults([]);
    setSource("");
    setLoading(false);
  };


  const filteredResults = activeFilter === "All"
    ? results
    : results.filter(r => r.court.toLowerCase().includes(activeFilter.toLowerCase().split(" ")[0]));

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl font-bold mb-3">
          Smart Case <span className="text-gradient">Search</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Search by keyword, act, or section. Get relevant past judgments with AI-generated summaries.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <Input
          placeholder="e.g. Article 21 right to life, IPC 302, dowry harassment..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12"
          disabled={loading}
        />
        <Button onClick={handleSearch} className="h-12 px-6 gap-2" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </Button>
      </div>

      {/* Filter tabs */}
      {searched && !loading && results.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
          {source && (
            <span className="ml-auto text-xs text-muted-foreground">
              Source: <span className="text-primary font-medium">{source}</span>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div className="space-y-4">
          {filteredResults.length > 0 && (
            <p className="text-sm text-muted-foreground">{filteredResults.length} judgment{filteredResults.length !== 1 ? "s" : ""} found</p>
          )}
          {filteredResults.map((r, idx) => (
            <Card key={idx} className="card-gradient border-border hover:glow-border transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="font-display text-lg leading-snug">{r.title}</CardTitle>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Calendar className="w-3 h-3" />
                    {r.date}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Scale className="w-3.5 h-3.5" />
                  {r.court}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{r.summary}</p>
                <div className="flex flex-wrap gap-2 items-center">
                  {r.sections.map(s => (
                    <Badge key={s} variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                      {s}
                    </Badge>
                  ))}
                  {r.link && (
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View Judgment <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredResults.length === 0 && results.length > 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No results for the selected filter. Try "All".</p>
            </div>
          )}
          {filteredResults.length === 0 && results.length === 0 && (
            <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/30">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-foreground mb-1">No results found for "{query}"</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Make sure the backend server is running and a Groq or Gemini API key is configured in the <code className="bg-muted px-1 rounded text-xs">.env</code> file.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-20">
          <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Searching Indian legal database for <span className="text-foreground font-medium">"{query}"</span>...</p>
          <p className="text-xs text-muted-foreground mt-2 opacity-60">Querying Nyastra AI — this may take a few seconds</p>
        </div>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Enter a keyword, IPC section, or act name to search</p>
        </div>
      )}
    </div>
  );
}
