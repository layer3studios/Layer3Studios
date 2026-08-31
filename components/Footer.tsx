"use client";

import Container from "./Container";
import AnimatedSection from "./AnimatedSection";

const footerLinks = [
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#projects", label: "Work" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="pt-4 pb-12">
      <Container>
        <AnimatedSection>
          {/* Gradient separator */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mb-10" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-xl overflow-hidden grid place-items-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/80 to-violet-600/80" />
                <span className="relative text-xs font-bold text-white">L3</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-white/80" style={{ fontFamily: 'var(--font-heading)' }}>
                  layer3studio
                </div>
                <div className="text-[11px] text-white/30">
                  Design × Engineering
                </div>
              </div>
            </div>

            {/* Links */}
            <nav className="flex items-center gap-6">
              {footerLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm text-white/40 hover:text-white/70 transition-colors duration-300"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            {/* Copyright */}
            <div className="text-sm text-white/30">
              © {new Date().getFullYear()} layer3studio
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </footer>
  );
}