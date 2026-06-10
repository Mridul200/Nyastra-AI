import { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, Calendar, Scale, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";

type SimilarCase = {
  title: string;
  court: string;
  date: string;
  sections: string[];
  summary: string;
  relevance: number;
  link?: string;
};

export default function UploadCase() {
  const [caseText, setCaseText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  
  const [extractedSummary, setExtractedSummary] = useState("");
  const [extractedIssues, setExtractedIssues] = useState<string[]>([]);
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);

  const handleAnalyze = async () => {
    if (!caseText.trim() && !file) {
      toast.error("Please enter case details or upload a file first.");
      return;
    }
    
    setLoading(true);
    setAnalyzed(false);
    setSimilarCases([]);
    setExtractedSummary("");
    setExtractedIssues([]);

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    } else {
      formData.append("text", caseText);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/analyze-case`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setExtractedSummary(data.summary || "No summary extracted.");
        setExtractedIssues(data.issues || []);
        setSimilarCases(data.results || []);
        setAnalyzed(true);
        toast.success("Analysis complete! Similar judgments found.");

        // Update local case history (mock/recent)
        const saved = localStorage.getItem("legal_cases_history");
        const historyCases = saved ? JSON.parse(saved) : [];
        const newCase = {
          id: crypto.randomUUID(),
          title: file?.name || (caseText.slice(0, 30) + "..."),
          date: Date.now(),
          relevance: data.results?.[0]?.relevance || 90,
          topSection: data.issues?.[0] || "Unknown"
        };
        localStorage.setItem("legal_cases_history", JSON.stringify([newCase, ...historyCases].slice(0, 20)));
      } else {
        const errorData = await res.json();
        toast.error(errorData.detail || "Failed to analyze case.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while communicating with the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setCaseText(""); // Clear pasted text if they upload a file
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl font-bold mb-3">
          Upload Case & <span className="text-gradient">Find Similar Judgments</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Upload your FIR, petition, or case facts. The system extracts key legal issues and finds similar past cases.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="card-gradient border-border">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Paste Case Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your FIR, petition text, or describe the case facts..."
              value={caseText}
              onChange={(e) => {
                setCaseText(e.target.value);
                setFile(null); // Clear file if they paste text
              }}
              className="min-h-[200px] bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
              disabled={loading}
            />
          </CardContent>
        </Card>

        <Card className="card-gradient border-border">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" /> Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              <span className="text-sm text-muted-foreground text-center px-4">
                {file ? file.name : "Click to upload PDF, DOCX, TXT"}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mb-10">
        <Button onClick={handleAnalyze} size="lg" className="gap-2 px-8" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Document...
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" /> Analyze & Find Similar Cases
            </>
          )}
        </Button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Extracting legal issues & searching similar cases...</p>
          <p className="text-xs text-muted-foreground mt-2 opacity-70">This could take up to 15-20 seconds for deep analysis</p>
        </div>
      )}

      {analyzed && !loading && (
        <div className="space-y-8 animate-fadeIn">
          {/* Analysis Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Case Extraction Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Extracted Summary</h4>
                <p className="text-sm text-foreground leading-relaxed">{extractedSummary}</p>
              </div>
              
              {extractedIssues.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Identified Legal Points / Sections</h4>
                  <div className="flex flex-wrap gap-2">
                    {extractedIssues.map((issue, idx) => (
                      <Badge key={idx} variant="outline" className="bg-background border-border text-foreground px-2.5 py-1 text-xs">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Similar Cases List */}
          <div>
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" /> Similar Past Judgments Found
            </h2>
            <div className="space-y-4">
              {similarCases.length > 0 ? (
                similarCases.map((c, i) => (
                  <Card key={i} className="card-gradient border-border hover:glow-border transition-all duration-300">
                    <CardContent className="py-5">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <p className="font-display font-semibold text-lg leading-snug">{c.title}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                            <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5" /> {c.court}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {c.date}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-2xl font-display font-extrabold text-gradient">{c.relevance}%</span>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider font-display">similarity</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.summary}</p>
                      
                      <div className="flex flex-wrap gap-2 items-center">
                        {c.sections.map(s => (
                          <Badge key={s} variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
                            {s}
                          </Badge>
                        ))}
                        {c.link && (
                          <a
                            href={c.link}
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
                ))
              ) : (
                <div className="text-center py-10 border border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground">No similar cases found in search results.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
