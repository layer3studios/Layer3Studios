"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RedactedProps {
  children: ReactNode;
  /**
   * Controlled reveal. When omitted the component reveals itself once it
   * scrolls into view.
   */
  revealed?: boolean;
  /** Delay before a self-revealing instance wipes, in ms. */
  delay?: number;
  className?: string;
}

/**
 * The signature element.
 *
 * A block of vellum sits over the text like a marker redaction. When it
 * reveals, the bar wipes off to the right and the text underneath resolves
 * out of blur.
 *
 * It is the whole brand promise in one interaction: we show you what's hidden.
 * Because of that it is used sparingly — one line per bento card. Everywhere else would turn a statement into a mannerism.
 *
 * Accessibility: the text is always in the DOM and always readable by a screen
 * reader. The bar is purely visual, so nothing is gated behind the animation.
 */
export default function Redacted({
  children,
  revealed,
  delay = 0,
  className = "",
}: RedactedProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [selfRevealed, setSelfRevealed] = useState(false);

  const isControlled = revealed !== undefined;

  useEffect(() => {
    if (isControlled) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const timer = window.setTimeout(() => setSelfRevealed(true), delay);
        io.disconnect();
        return () => window.clearTimeout(timer);
      },
      { threshold: 0.6 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay, isControlled]);

  const isRevealed = isControlled ? revealed : selfRevealed;

  return (
    <span
      ref={ref}
      className={`redaction ${className}`}
      data-revealed={isRevealed ? "true" : "false"}
    >
      <span className="redaction-content">{children}</span>
      <span className="redaction-bar" aria-hidden="true" />
    </span>
  );
}
