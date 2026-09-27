import { useState } from "react";
import { Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, ArrowLeft, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ContactUs() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "Advocate Support",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    // Simulate sending message / recording contact request
    setTimeout(() => {
      // Store in localStorage for audit trace
      const existingInquiries = JSON.parse(localStorage.getItem("nyastra_contact_inquiries") || "[]");
      existingInquiries.push({
        ...formData,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem("nyastra_contact_inquiries", JSON.stringify(existingInquiries));

      setLoading(false);
      setSubmitted(true);
      toast.success("Thank you! Your message has been received. Our team will contact you shortly.");
      setFormData({
        name: "",
        email: "",
        category: "Advocate Support",
        subject: "",
        message: ""
      });
    }, 700);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl animate-in fade-in duration-500">
      {/* Back button */}
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-4 mb-12 border-b border-border/40 pb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Support & Partnerships</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
          Contact the Nyastra Team
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Have questions about AI-assisted case search, document generation, or enterprise firm onboarding? We're here to help legal professionals excel.
        </p>
      </div>

      {/* Main Grid: Info + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md space-y-6">
            <h3 className="font-semibold text-foreground text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Direct Inquiries
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Official Email</p>
                  <a href="mailto:support@nyastra.ai" className="text-foreground hover:text-primary transition-colors font-medium">
                    support@nyastra.ai
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Headquarters</p>
                  <p className="text-foreground font-medium">
                    New Delhi, Delhi, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Support Hours</p>
                  <p className="text-foreground font-medium">
                    Monday &ndash; Saturday: 9:00 AM &ndash; 7:00 PM IST
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Lead Developer & Founder:</strong><br />
                Mridul Mani Tripathi
              </p>
            </div>
          </div>

          {/* Quick Assurance Box */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              All communications are strictly confidential. We never disclose advocate inquiry topics or firm discussions.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-3">
          <div className="p-6 sm:p-8 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md">
            {submitted ? (
              <div className="text-center py-12 space-y-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Message Sent Successfully</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Thank you for reaching out. We have logged your request and our technical advocate team will respond shortly.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-semibold">Your Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Adv. Rajesh Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="advocate@lawfirm.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs font-semibold">Inquiry Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Advocate Support">Advocate Support</option>
                      <option value="Law Firm Integration">Law Firm Integration</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Bug / Citation Report">Bug / Citation Report</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-xs font-semibold">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g. Question about BNSS judgment mapping"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs font-semibold">Message / Query *</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Describe your inquiry, case search issue, or custom drafting template requirement in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full gap-2 mt-2">
                  {loading ? (
                    "Sending Message..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto space-y-6 pt-6 border-t border-border/40">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-bold text-foreground">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Quick answers to common questions about Nyastra AI</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="faq-1" className="border-border/40">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary">
              How does Nyastra AI find judgments so quickly?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              Nyastra AI leverages real-time neural semantic indexing paired with Indian Kanoon, High Court registries, and Supreme Court precedent graphs. It translates colloquial fact patterns directly into relevant statutory sections (IPC/BNS, CrPC/BNSS) and ranks precedent relevance automatically.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="border-border/40">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary">
              Is my client's case facts or FIR text kept private?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              Yes. Nyastra AI enforces complete tenant isolation using Supabase Row Level Security (RLS) and does not train third-party public foundation models on advocate submissions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="border-border/40">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary">
              Can I customize document drafts for specific state High Courts?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              Yes. The Document Generator supports customized jurisdictional variables, prayer clauses, and swearing blocks formatted to comply with specific state rules (e.g. Delhi, Bombay, Allahabad, Madras High Courts).
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-4" className="border-border/40">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary">
              How do I report a missing precedent or bug?
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
              Use the contact form above with category "Bug / Citation Report", or email us directly at support@nyastra.ai with the relevant citation (e.g., AIR 2024 SC 1234) and our legal data team will promptly inspect the corpus.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
