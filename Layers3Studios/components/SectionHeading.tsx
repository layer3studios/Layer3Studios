"use client";

import AnimatedSection from "./AnimatedSection";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <AnimatedSection className="mb-12">
      <div>
        {eyebrow && (
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <span className="text-xs font-semibold tracking-[0.2em] text-indigo-400/80 uppercase">
              {eyebrow}
            </span>
          </div>
        )}
        <h2
          className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-white/50 max-w-2xl text-lg leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </AnimatedSection>
  );
}