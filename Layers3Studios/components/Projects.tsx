"use client";

import Container from "./Container";
import SectionHeading from "./SectionHeading";
import AnimatedSection from "./AnimatedSection";
import { projects } from "@/data/projects";
import { ArrowUpRight, Github } from "lucide-react";

const gradients = [
  "from-indigo-500/20 via-violet-500/10 to-transparent",
  "from-pink-500/20 via-violet-500/10 to-transparent",
  "from-cyan-500/20 via-blue-500/10 to-transparent",
  "from-emerald-500/20 via-cyan-500/10 to-transparent",
];

export default function Projects() {
  return (
    <section id="projects" className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Work"
          title="Selected case studies"
          subtitle="A few builds that highlight our approach: premium UI, clean architecture, and practical execution."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <AnimatedSection key={p.title} delay={i * 0.12}>
              <div className="group glass-hover rounded-3xl p-6 h-full">
                {/* Project header with gradient */}
                <div className={`relative rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} border border-white/5 p-6 overflow-hidden`}>
                  {/* Decorative circle */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/[0.03] group-hover:scale-150 transition-transform duration-700" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-white/40 font-medium tracking-wider uppercase">
                        {p.year}
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                        {p.title}
                      </h3>
                      <p className="mt-3 text-white/50 leading-relaxed text-sm">
                        {p.description}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {p.href && (
                        <a
                          className="btn-ghost !px-3 !py-2 group-hover:border-white/20"
                          href={p.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Open project"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      )}
                      {p.source && (
                        <a
                          className="btn-ghost !px-3 !py-2 group-hover:border-white/20"
                          href={p.source}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Open source"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {!!p.outcomes?.length && (
                    <div className="relative mt-5 flex flex-wrap gap-2">
                      {p.outcomes.map((o) => (
                        <span key={o.label} className="pill">
                          <span className="text-white/40">{o.label}: </span>
                          <span className="text-white/70">{o.value}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Highlights */}
                {!!p.highlights?.length && (
                  <div className="mt-5 space-y-2.5">
                    {p.highlights.slice(0, 3).map((h) => (
                      <div
                        key={h}
                        className="flex items-start gap-2.5 text-sm text-white/55"
                      >
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="pill">{t}</span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
}