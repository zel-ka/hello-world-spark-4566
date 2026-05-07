import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useToast } from "@/hooks/use-toast";

const faqItems = [
  {
    question: "How quickly can I expect a response?",
    answer: "Our team typically replies within 1-2 business days for standard inquiries.",
  },
  {
    question: "Can I request a custom demo?",
    answer: "Yes — we can schedule a walkthrough tailored to your workflow.",
  },
  {
    question: "Is support available for implementation?",
    answer: "We offer onboarding guidance, secure setup help, and clinical implementation support.",
  },
];

const defaultForm = {
  name: "",
  email: "",
  message: "",
};

export default function Contact() {
  const [heroOpen, setHeroOpen] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [formState, setFormState] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const observe = useScrollAnimation();
  const { toast } = useToast();

  useEffect(() => {
    const heroTimer = window.setTimeout(() => setHeroOpen(true), 220);
    const readyTimer = window.setTimeout(() => setPageReady(true), 360);
    return () => {
      window.clearTimeout(heroTimer);
      window.clearTimeout(readyTimer);
    };
  }, []);

  useEffect(() => {
    observe(mainRef.current);
  }, [observe]);

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!formState.name.trim()) nextErrors.name = "Please enter your name.";
    if (!formState.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      nextErrors.email = "Please provide a valid email.";
    }
    if (!formState.message.trim()) nextErrors.message = "Please share your message.";
    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast({
        title: "Review your details",
        description: "We need a few corrections before sending your message.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setSubmitting(false);
    setFormState(defaultForm);
    setErrors({});
    toast({
      title: "Message received",
      description: "Our team will contact you within 1-2 business days.",
      variant: "default",
    });
  };

  const formField = (name: string, label: string, type = "text", value?: string, error?: string) => (
    <div className="relative">
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(event) => handleChange(name, event.target.value)}
        className={
          `peer h-14 bg-card/90 border border-input shadow-sm transition-all duration-200 rounded-2xl ` +
          (error ? "border-destructive/30 focus-visible:ring-destructive/50" : "focus-visible:ring-primary/50")
        }
        placeholder=" "
      />
      <Label
        htmlFor={name}
        className="absolute left-4 top-4 pointer-events-none text-sm transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground peer-focus:top-3 peer-focus:text-xs peer-focus:text-primary"
      >
        {label}
      </Label>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );

  return (
    <div className="bg-background text-foreground min-h-screen overflow-hidden">
      <div ref={mainRef} className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link to="/" className="text-sm font-semibold text-primary hover:text-primary/80 transition">
            Back to landing
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-primary/10 via-background to-slate-50 shadow-soft p-8 sm:p-12 animate-fade-in">
          <div className={`contact-curtain absolute inset-0 z-20 flex ${heroOpen ? "contact-open" : ""}`}>
            <div className="contact-curtain-panel contact-curtain-left" />
            <div className="contact-curtain-panel contact-curtain-right" />
          </div>
          <div className={`relative z-30 space-y-6 ${heroOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-700 delay-200`}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Comfortable support for health teams
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">Contact Us</h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Send a message and our support team will reply quickly with the help you need.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-[2rem] border border-border bg-card p-8 shadow-soft animate-fade-in">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">Contact form</p>
              <h2 className="text-3xl font-bold text-foreground">Send us a message</h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Share a brief note, your goals, or your question and we’ll be in touch soon.
              </p>
            </div>
            {pageReady ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {formField("name", "Name", "text", formState.name, errors.name)}
                  {formField("email", "Email", "email", formState.email, errors.email)}
                </div>
                <div className="relative">
                  <Textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={(event) => handleChange("message", event.target.value)}
                    className={
                      `peer min-h-[160px] bg-card/90 border border-input shadow-sm transition-all duration-200 rounded-2xl px-4 pt-6 pb-3 ` +
                      (errors.message ? "border-destructive/30 focus-visible:ring-destructive/50" : "focus-visible:ring-primary/50")
                    }
                    placeholder=" "
                  />
                  <Label
                    htmlFor="message"
                    className="absolute left-4 top-4 pointer-events-none text-sm transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground peer-focus:top-3 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Message
                  </Label>
                  {errors.message && <p className="mt-2 text-sm text-destructive">{errors.message}</p>}
                </div>
                <Button type="submit" size="lg" className="w-full justify-center" disabled={submitting}>
                  {submitting ? "Sending..." : "Send message"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-14 rounded-2xl" />
                  <Skeleton className="h-14 rounded-2xl" />
                </div>
                <Skeleton className="h-52 rounded-2xl" />
                <Skeleton className="h-14 w-40 rounded-2xl" />
              </div>
            )}
          </div>

          <div className="space-y-6 rounded-[2rem] border border-border bg-card p-8 shadow-soft animate-fade-in">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">Support topics</p>
              <h2 className="text-3xl font-bold text-foreground">Need help fast?</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item) => (
                <AccordionItem key={item.question} value={item.question} className="rounded-3xl border border-border bg-background/80">
                  <AccordionTrigger className="px-5 py-4 text-left text-sm font-semibold text-foreground">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 text-sm leading-7 text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
}
