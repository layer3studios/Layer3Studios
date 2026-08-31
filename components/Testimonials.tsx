"use client";

import Container from "./Container";
import SectionHeading from "./SectionHeading";
import AnimatedSection from "./AnimatedSection";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "The landing page instantly felt premium. Messaging became clearer, and the site finally matched the product quality.",
    name: "Founder",
    role: "B2B SaaS",
    gradient: "from-indigo-500/30 to-violet-500/30",
  },
  {
    quote:
      "Fast turnaround and clean implementation. The codebase was easy for our team to pick up and extend.",
    name: "Engineering Lead",
    role: "Startup team",
    gradient: "from-violet-500/30 to-pink-500/30",
  },
  {
    quote:
      "Great taste in UI and strong engineering. The dashboard flows are smooth, responsive, and production-ready.",
    name: "Product Manager",
    role: "Growth stage",
    gradient: "from-cyan-500/30 to-emerald-500/30",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Proof"
          title="What clients value"
          subtitle="Use this section for real testimonials once you have them — it's one of the highest-converting blocks on a studio site."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 0.12}>
              <div className="group glass-hover rounded-3xl p-7 h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, si) => (
                    <Star
                      key={si}
                      className="h-4 w-4 fill-amber-400/80 text-amber-400/80"
                    />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative flex-1">
                  <div className="absolute -top-2 -left-1 text-5xl text-white/[0.06] font-serif leading-none">
                    &ldquo;
                  </div>
                  <p className="relative text-sm text-white/60 leading-relaxed italic pl-4">
                    {t.quote}
                  </p>
                </div>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.gradient} grid place-items-center text-xs font-bold text-white`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-white/40">{t.role}</div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA banner */}
        <AnimatedSection delay={0.3}>
          <div className="mt-8 gradient-border rounded-3xl p-7 sm:p-9 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Want the same outcome?
              </div>
              <p className="mt-2 text-sm text-white/50">
                Send your current site + a couple of references you like. We&apos;ll propose an approach.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a className="btn-primary" href="#projects">
                See projects
              </a>
              <a className="btn-ghost" href="#contact">
                Start a project
              </a>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}
