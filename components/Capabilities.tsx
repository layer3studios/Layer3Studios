"use client";

import Container from "./Container";
import SectionHeading from "./SectionHeading";
import AnimatedSection from "./AnimatedSection";
import {
  LayoutTemplate,
  ShieldCheck,
  Rocket,
  Workflow,
  CreditCard,
  Search,
} from "lucide-react";

const services = [
  {
    title: "Landing pages that convert",
    description:
      "Messaging, layout and motion that feel premium — built to load fast and rank well.",
    icon: LayoutTemplate,
    bullets: ["Information architecture", "Performance + SEO", "Analytics-ready"],
    color: "from-indigo-500 to-violet-500",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]",
  },
  {
    title: "SaaS UI & dashboards",
    description:
      "Design systems, responsive tables, charts, and flows that scale as your product grows.",
    icon: Workflow,
    bullets: ["Design system", "Role-based UI", "Admin panels"],
    color: "from-violet-500 to-pink-500",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]",
  },
  {
    title: "Full‑stack builds",
    description:
      "Production-grade APIs, auth, payments, and integrations — clean architecture, maintainable code.",
    icon: ShieldCheck,
    bullets: ["Next.js / MERN", "Auth + RBAC", "APIs + integrations"],
    color: "from-cyan-500 to-blue-500",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.3)]",
  },
  {
    title: "Stripe & billing",
    description:
      "Subscriptions, invoices, webhooks, and customer portals with proper edge‑case handling.",
    icon: CreditCard,
    bullets: ["Subscriptions", "Webhook safety", "Customer portal"],
    color: "from-emerald-500 to-cyan-500",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
  },
  {
    title: "Launch & iteration",
    description:
      "Deploy, monitor, and ship improvements quickly — without breaking the experience.",
    icon: Rocket,
    bullets: ["Deploy pipelines", "Monitoring", "A/B experiments"],
    color: "from-amber-500 to-orange-500",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
  },
  {
    title: "Technical SEO",
    description:
      "Clean metadata, structured content, and performance budgets that keep your site discoverable.",
    icon: Search,
    bullets: ["Schema + metadata", "Core Web Vitals", "Content structure"],
    color: "from-pink-500 to-rose-500",
    glow: "group-hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)]",
  },
];

const stack = [
  "Next.js", "React", "TypeScript", "Node.js", "Express",
  "MongoDB", "Postgres", "Stripe", "Docker", "AWS / Vercel",
];

export default function Capabilities() {
  return (
    <section id="services" className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Capabilities"
          title="What we do"
          subtitle="From premium marketing pages to full‑stack SaaS — we design, build, and launch products that feel polished from day one."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <AnimatedSection key={s.title} delay={i * 0.1}>
              <div className={`group glass-hover rounded-3xl p-6 h-full ${s.glow}`}>
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${s.color} p-[1px] shrink-0`}>
                    <div className="h-full w-full rounded-2xl bg-[#0a0a1a] grid place-items-center">
                      <s.icon className="h-5 w-5 text-white/80" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/50 leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {s.bullets.map((b) => (
                    <span key={b} className="pill">{b}</span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Build stack */}
        <AnimatedSection delay={0.3}>
          <div className="mt-8 gradient-border rounded-3xl p-7 sm:p-9">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  Build stack
                </div>
                <p className="mt-2 text-sm text-white/50 max-w-2xl">
                  We pick pragmatic tech that stays maintainable. If you already have a stack, we&apos;ll match it.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {stack.map((t) => (
                  <span key={t} className="pill">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}
