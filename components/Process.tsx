"use client";

import Container from "./Container";
import SectionHeading from "./SectionHeading";
import AnimatedSection from "./AnimatedSection";
import { CheckCircle, Clock3 } from "lucide-react";

const steps = [
  {
    title: "Discovery",
    time: "Day 1–2",
    detail:
      "We align on goals, audience, competitors, and the exact scope. You'll get a clear plan and deliverables list.",
    bullets: ["Brief + goals", "Content + sitemap", "Scope + milestones"],
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    title: "Design",
    time: "Day 3–7",
    detail:
      "We create a premium UI direction, then iterate quickly with feedback loops.",
    bullets: ["Hero + sections", "Design system", "Responsive layouts"],
    gradient: "from-violet-500 to-pink-500",
  },
  {
    title: "Build",
    time: "Week 2",
    detail:
      "Clean, production-ready code. Performance, accessibility and maintainability are default.",
    bullets: ["Component library", "API + auth", "Integrations"],
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Launch",
    time: "Week 2–3",
    detail:
      "We ship, monitor, and keep improving. You'll have docs + handover so your team can move fast.",
    bullets: ["SEO + analytics", "Deploy + monitoring", "Handover"],
    gradient: "from-emerald-500 to-cyan-500",
  },
];

const guarantees = [
  "Pixel-perfect responsiveness",
  "Fast load times (Core Web Vitals focused)",
  "Clean codebase + easy handover",
  "Production-grade auth & security basics",
];

export default function Process() {
  return (
    <section id="process" className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Process"
          title="How we ship"
          subtitle="A simple, reliable workflow: fast iterations, clear communication, and a polished end result."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Steps grid with timeline */}
          <div className="lg:col-span-2 relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/40 via-violet-500/30 to-cyan-500/20 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {steps.map((s, idx) => (
                <AnimatedSection key={s.title} delay={idx * 0.12}>
                  <div className="glass-hover rounded-3xl p-6 h-full">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${s.gradient} grid place-items-center text-xs font-bold text-white shrink-0`}>
                            {idx + 1}
                          </div>
                          <span className="text-xs text-white/40 uppercase tracking-wider">
                            Step {idx + 1}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                          {s.title}
                        </h3>
                        <p className="mt-2 text-sm text-white/50 leading-relaxed">
                          {s.detail}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 whitespace-nowrap shrink-0">
                        <Clock3 className="h-3.5 w-3.5 text-white/40" />
                        {s.time}
                      </div>
                    </div>

                    <div className="mt-5 space-y-2.5">
                      {s.bullets.map((b) => (
                        <div key={b} className="flex items-center gap-2.5 text-sm text-white/60">
                          <CheckCircle className="h-4 w-4 text-emerald-400/70 shrink-0" />
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <AnimatedSection delay={0.3} direction="right">
            <aside className="gradient-border rounded-3xl p-7">
              <div className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                What you get
              </div>
              <p className="mt-3 text-sm text-white/50 leading-relaxed">
                This is a studio-style engagement: one tight team, fast feedback, and a high-quality delivery.
              </p>

              <div className="mt-6 space-y-3">
                {guarantees.map((g) => (
                  <div key={g} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 shrink-0" />
                    <span>{g}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 glass rounded-2xl p-5">
                <div className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  Need a quick estimate?
                </div>
                <p className="mt-2 text-sm text-white/50">
                  Share a short brief and links you like. We&apos;ll reply with a scope + timeline.
                </p>
                <a href="#contact" className="btn-primary mt-5 w-full">
                  Get a quote
                </a>
              </div>
            </aside>
          </AnimatedSection>
        </div>
      </Container>
    </section>
  );
}
