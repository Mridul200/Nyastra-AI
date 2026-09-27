import { Shield, Lock, Eye, FileText, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  const lastUpdated = "September 28, 2026";

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in duration-500">
      {/* Back button */}
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-4 mb-12 border-b border-border/40 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
          <Shield className="w-3.5 h-3.5" />
          <span>Legal & Data Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          At Nyastra AI, we recognize the critical importance of attorney-client privilege, litigation confidentiality, and data integrity. This Privacy Policy outlines how your information is safeguarded in compliance with the Digital Personal Data Protection (DPDP) Act of India and international standards.
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          Last Updated: {lastUpdated}
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="p-5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm space-y-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-foreground text-sm">Privilege First</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your uploaded petitions, FIRs, and notes are never used to train public foundation models.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm space-y-2">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-foreground text-sm">Bank-Grade Encryption</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All data in transit is encrypted using TLS 1.3, and resting files utilize AES-256 encrypted storage.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm space-y-2">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-foreground text-sm">Total User Control</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You can export, redact, or permanently delete your chat history, documents, and case files anytime.
          </p>
        </div>
      </div>

      {/* Policy Details */}
      <div className="space-y-10 text-foreground/90 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-xs px-2 py-0.5 rounded bg-primary/10">01</span>
            Information We Collect
          </h3>
          <p className="text-muted-foreground">
            We collect only the minimum required information to deliver high-accuracy legal research and drafting services:
          </p>
          <ul className="space-y-2 list-none pl-1">
            <li className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Account Credentials:</strong> Full name, verified email, advocate registration / Bar Council enrollment ID (optional), and designated court affiliation.</span>
            </li>
            <li className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Case Search & Queries:</strong> Keywords, statutory sections (IPC, BNS, CrPC, BNSS, CPC), and constitutional articles searched through the research engine.</span>
            </li>
            <li className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span><strong>Document Generation Inputs:</strong> Fact summaries, party names, jurisdictional details, and drafting variables submitted to generate legal notices, plaints, and petitions.</span>
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-xs px-2 py-0.5 rounded bg-primary/10">02</span>
            How We Process Legal Data
          </h3>
          <p className="text-muted-foreground">
            Nyastra AI utilizes retrieval-augmented generation (RAG) and specialized neural search to match case queries with verified judgments from the Supreme Court of India, High Courts, and Indian Kanoon:
          </p>
          <div className="p-4 rounded-lg bg-muted/40 border border-border text-xs space-y-1.5 text-muted-foreground">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Confidentiality Commitment
            </p>
            <p>
              Your document inputs and confidential client communications are processed ephemerally in secure sessions. We strictly do not sell, trade, or repurpose your proprietary casework to third-party commercial entities.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-xs px-2 py-0.5 rounded bg-primary/10">03</span>
            Data Storage & Supabase Security
          </h3>
          <p className="text-muted-foreground">
            Our database infrastructure is powered by Supabase with Row Level Security (RLS) strictly enforced. Each advocate's records, profile details, and generated legal briefs are accessible exclusively by their authenticated credentials.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-xs px-2 py-0.5 rounded bg-primary/10">04</span>
            Compliance with Indian IT Act & DPDP Act
          </h3>
          <p className="text-muted-foreground">
            Nyastra AI is architected in conformity with the Information Technology Act, 2000 (and amendments) and the Digital Personal Data Protection Act, 2023. You hold the right to seek data rectification, erasure, and revocation of consent at any point in time.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary font-mono text-xs px-2 py-0.5 rounded bg-primary/10">05</span>
            Grievance Redressal & Contact
          </h3>
          <p className="text-muted-foreground">
            In compliance with Indian law, for any privacy concerns, data deletion requests, or compliance inquiries, please contact our designated Grievance Officer:
          </p>
          <div className="p-4 rounded-lg bg-card border border-border/70 text-xs space-y-1">
            <p className="font-semibold text-foreground">Mridul Mani Tripathi</p>
            <p className="text-muted-foreground">Founder & Lead Developer, Nyastra AI</p>
            <p className="text-muted-foreground">Email: <a href="mailto:support@nyastra.ai" className="text-primary underline">support@nyastra.ai</a></p>
            <p className="text-muted-foreground">Jurisdiction: New Delhi, India</p>
          </div>
        </section>
      </div>
    </div>
  );
}
