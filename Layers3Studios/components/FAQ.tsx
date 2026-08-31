"use client";

import Container from "./Container";
import SectionHeading from "./SectionHeading";
import AnimatedSection from "./AnimatedSection";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "What kind of projects do you take?",
    a: "Landing pages, studio sites, SaaS dashboards, and full‑stack MVPs. We also help teams improve existing UI/UX and performance.",
  },
  {
    q: "How fast can you ship?",
    a: "For a landing page: typically 7–14 days. For a small SaaS/MVP: 2–4 weeks depending on scope and integrations.",
  },
  {
    q: "Can you work with our existing codebase?",
    a: "Yes. We can redesign UI, refactor components, improve performance, and add missing flows — without rewriting everything.",
  },
  {
    q: "Do you provide design only or build only?",
    a: "Both. We often do end‑to‑end, but we can also plug in as design support or as engineering support.",
  },
  {
    q: "What do you need from us to start?",
    a: "A short brief (goals + audience), examples of sites you like, and any existing brand assets. If you don't have these, we can help define them.",
  },
  {
    q: "How does pricing work?",
    a: "Fixed scope or weekly/monthly retainer. After a quick call, we share a scope and a clear price range before any work starts.",
  },
];

function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(false);

  return (
    <AnimatedSection delay={idx * 0.08}>
      <div
        className={`glass-hover rounded-3xl p-6 cursor-pointer transition-all duration-300 ${open ? "!bg-white/[0.06] !border-white/[0.12]" : ""
          }`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {open && (
                <div className="h-5 w-0.5 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500 shrink-0" />
              )}
              <h3 className="text-sm font-semibold text-white">{q}</h3>
            </div>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 text-sm text-white/50 leading-relaxed pl-0">
                    {a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            className={`h-9 w-9 shrink-0 rounded-2xl border border-white/10 grid place-items-center transition-all duration-300 ${open
                ? "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border-indigo-500/30"
                : "bg-white/5"
              }`}
          >
            <ChevronDown
              className={`h-4 w-4 text-white/70 transition-transform duration-300 ${open ? "rotate-180" : ""
                }`}
            />
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="py-24">
      <Container>
        <SectionHeading
          eyebrow="FAQ"
          title="Common questions"
          subtitle="If you don't see your question here, send a note — we're quick to respond."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {faqs.map((f, i) => (
            <FAQItem key={f.q} q={f.q} a={f.a} idx={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
