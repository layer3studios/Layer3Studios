"use client";

import Container from "./Container";
import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";

const techStack = ["Next.js", "React", "Node", "Stripe", "Docker", "SEO"];

const features = [
  {
    title: "Design",
    desc: "Premium UI, clear messaging, responsive layout",
    gradient: "from-indigo-500/20 to-violet-500/20",
  },
  {
    title: "Build",
    desc: "Next.js/MERN, APIs, auth, payments, Docker",
    gradient: "from-violet-500/20 to-pink-500/20",
  },
  {
    title: "Launch",
    desc: "SEO basics, analytics, deploy + handover",
    gradient: "from-cyan-500/20 to-emerald-500/20",
  },
];

export default function Hero() {
  return (
    <section className="relative pt-20 pb-10 sm:pt-32 sm:pb-16 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[120px] animate-orb-1" />
        <div className="absolute top-40 right-[10%] w-[400px] h-[400px] rounded-full bg-violet-500/12 blur-[100px] animate-orb-2" />
        <div className="absolute bottom-0 left-[40%] w-[600px] h-[400px] rounded-full bg-cyan-500/8 blur-[120px] animate-orb-3" />
      </div>

      <Container>
        <div className="relative gradient-border rounded-3xl p-8 sm:p-14">
          <div className="relative z-10">
            {/* Availability badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Available for new projects
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
              className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-balance tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Design & build{" "}
              <span className="text-gradient-vivid">premium web products</span>{" "}
              <span className="text-white/50 font-medium">—</span>{" "}
              <span className="text-white/50 font-normal">
                landing pages, dashboards, and full‑stack apps.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-6 max-w-2xl text-white/50 text-lg leading-relaxed"
            >
              layer3studio helps founders and teams ship polished interfaces with solid
              engineering. Premium visuals, fast performance, and SEO fundamentals — built
              into the code, not added later.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <a className="btn-primary text-base px-8 py-3" href="#projects">
                See case studies
              </a>
              <a className="btn-ghost text-base px-8 py-3" href="#contact">
                Get a quote
              </a>
            </motion.div>

            {/* Tech stack */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="mt-10 flex flex-wrap gap-2"
            >
              {techStack.map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 + i * 0.08, duration: 0.4 }}
                  className="pill"
                >
                  {t}
                </motion.span>
              ))}
            </motion.div>

            {/* Feature cards */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <AnimatedSection key={f.title} delay={0.2 + i * 0.15}>
                  <div className="glass-hover rounded-2xl p-5 group cursor-default">
                    <div
                      className={`h-1 w-12 rounded-full bg-gradient-to-r ${f.gradient} mb-4 group-hover:w-20 transition-all duration-500`}
                    />
                    <div className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      {f.title}
                    </div>
                    <div className="mt-1.5 text-sm text-white/50">{f.desc}</div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}