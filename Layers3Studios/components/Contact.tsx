"use client";

import Container from "./Container";
import SectionHeading from "./SectionHeading";
import AnimatedSection from "./AnimatedSection";
import { useState } from "react";
import { Send, Mail, Clock, Code } from "lucide-react";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setMsg("");

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (res.ok) {
      setOk(true);
      setMsg("Thanks! We'll get back to you within 24–48 hours.");
      e.currentTarget.reset();
    } else {
      setOk(false);
      setMsg(data?.error || "Something went wrong. Please try again.");
    }
  }

  const infoItems = [
    { icon: Mail, label: "Email", value: "hello@layer3studio.com" },
    { icon: Clock, label: "Turnaround", value: "7–21 days" },
    { icon: Code, label: "Stack", value: "Next.js / MERN / Node APIs" },
  ];

  const nextSteps = [
    "We review your brief and references.",
    "We send a scope + timeline options.",
    "Kickoff call + we start building.",
  ];

  return (
    <section id="contact" className="py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-0 left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-500/8 blur-[120px]" />
        <div className="absolute bottom-20 right-[15%] w-[400px] h-[400px] rounded-full bg-violet-500/6 blur-[100px]" />
      </div>

      <Container>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Info */}
          <AnimatedSection direction="left">
            <div className="gradient-border rounded-3xl p-8 sm:p-10">
              <SectionHeading
                eyebrow="Contact"
                title="Let's build something premium"
                subtitle="Tell us what you're building. We'll reply with a clear scope, timeline options, and a pricing range."
              />

              <div className="space-y-4">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/5 grid place-items-center shrink-0">
                      <item.icon className="h-4 w-4 text-indigo-300/70" />
                    </div>
                    <div>
                      <div className="text-xs text-white/40">{item.label}</div>
                      <div className="text-sm text-white/80">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 glass rounded-2xl p-6">
                <div className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  What happens next
                </div>
                <div className="mt-4 space-y-3">
                  {nextSteps.map((step, i) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 grid place-items-center text-[10px] font-bold text-white/70 shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-sm text-white/50">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right: Form */}
          <AnimatedSection direction="right" delay={0.15}>
            <div className="glass-hover rounded-3xl p-8 sm:p-10">
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/40 mb-2 ml-1">Name</label>
                    <input name="name" className="input" placeholder="Your name" required />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-2 ml-1">Email</label>
                    <input name="email" type="email" className="input" placeholder="you@company.com" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-2 ml-1">Company</label>
                  <input name="company" className="input" placeholder="Company (optional)" />
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-2 ml-1">Subject</label>
                  <input name="subject" className="input" placeholder="What do you need?" required />
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-2 ml-1">Message</label>
                  <textarea
                    name="message"
                    className="input min-h-[140px] resize-none"
                    placeholder="Tell us what you want to build..."
                    required
                  />
                </div>

                <button
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send message
                    </>
                  )}
                </button>

                {ok !== null && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${ok
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                        : "border-rose-500/20 bg-rose-500/10 text-rose-200"
                      }`}
                  >
                    {msg}
                  </div>
                )}

                <p className="text-[11px] text-white/30 text-center">
                  Protected with server-side validation + rate limits.
                </p>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </Container>
    </section>
  );
}