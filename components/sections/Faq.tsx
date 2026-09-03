"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ease, faq, faqItems } from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * Questions.
 *
 * Not an accordion. An index and a card.
 *
 * Left, the index: every question as a numbered line, with a marker that
 * slides between them. It sticks while the section scrolls, so the list is
 * always in reach. Right, the card: one answer at a time on a sheet of paper,
 * set large. Choosing another question flips the sheet over in 3D, the way
 * you turn an index card, and the new answer arrives word by word.
 *
 * Arrow keys and J/K move through the questions when the section has focus.
 * The last line on every card is a way to ask us something the list does not
 * cover; it opens the hire sheet, which is an email.
 */
export default function Faq() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();
  const { openHire } = useBooking();
  const item = faqItems[active];
  const cardRef = useRef<HTMLDivElement>(null);

  // The card follows the finger. Horizontal travel tilts it a little and
  // lifts the sheet beneath, the way a card lifts off a stack.
  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-240, 0, 240], [-6, 0, 6]);
  const deckLift = useTransform(dragX, [-240, 0, 240], [1, 0, 1]);
  const deckScale = useTransform(deckLift, [0, 1], [1, 1.015]);
  const deckY = useTransform(deckLift, [0, 1], [0, -6]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    // A decisive flick or a long enough pull turns the card; anything less
    // springs back.
    if (offset.x < -70 || velocity.x < -450) go(active + 1);
    else if (offset.x > 70 || velocity.x > 450) go(active - 1);
  };

  const go = useCallback(
    (to: number) => {
      const n = faqItems.length;
      const next = ((to % n) + n) % n;
      setDir(next > active || (active === n - 1 && next === 0) ? 1 : -1);
      setActive(next);
      // Below lg the card sits above the list, so a tap further down the
      // list would otherwise change a card the reader cannot see.
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [active],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const root = document.getElementById("faq");
      if (!root || !root.contains(document.activeElement)) return;
      if (e.key === "ArrowDown" || e.key === "j") go(active + 1);
      if (e.key === "ArrowUp" || e.key === "k") go(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  const words = item.a.split(" ");

  return (
    <section id="faq" className="overflow-hidden px-[var(--gutter)] py-28 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={faq.eyebrow} heading={faq.heading} centred />

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* The index. */}
          <motion.ol
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, amount: 0.3 }}
            className="relative order-2 self-start lg:order-1 lg:sticky lg:col-span-5"
            style={{ top: "calc(var(--island-clear) + 1rem)" }}
            aria-label="Questions"
          >
            {faqItems.map((q, i) => {
              const on = i === active;
              return (
                <motion.li
                  key={q.q}
                  variants={{
                    hidden: { opacity: 0, x: -24 },
                    shown: { opacity: 1, x: 0, transition: { delay: i * 0.06, duration: 0.6, ease: ease.settle } },
                  }}
                  className="relative"
                >
                  {on && (
                    <motion.span
                      layoutId="faq-marker"
                      aria-hidden="true"
                      className="absolute -left-4 top-0 bottom-0 w-px bg-vellum lg:-left-6"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={on ? "true" : undefined}
                    className={`group flex w-full items-baseline gap-4 border-b border-ink-500 py-4 text-left transition-colors ${
                      on ? "text-vellum" : "text-muted hover:text-vellum"
                    }`}
                  >
                    <span
                      className={`font-mono text-[0.7rem] tabular-nums transition-colors ${
                        on ? "text-vellum" : "text-faint group-hover:text-muted"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-[1rem] leading-snug sm:text-[1.0625rem]">{q.q}</span>
                    <motion.span
                      aria-hidden="true"
                      className="font-mono text-[0.8rem]"
                      animate={{ x: on ? 0 : -6, opacity: on ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: ease.settle }}
                    >
                      →
                    </motion.span>
                  </button>
                </motion.li>
              );
            })}
            <li className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
              <span className="hidden lg:inline">↑ ↓ to move · </span>
              {String(active + 1).padStart(2, "0")} / {String(faqItems.length).padStart(2, "0")}
            </li>
          </motion.ol>

          {/* The card. */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 12 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: ease.settle }}
            className="order-1 lg:order-2 lg:col-span-7"
            style={{ perspective: "1600px" }}
          >
            <div ref={cardRef} className="relative min-h-[26rem] scroll-mt-[calc(var(--island-clear)+1rem)] sm:min-h-[30rem]" style={{ transformStyle: "preserve-3d" }}>
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.article
                  key={active}
                  custom={dir}
                  variants={{
                    enter: (d: number) =>
                      reduce ? { opacity: 0 } : { x: d * 140, rotateY: d * 28, rotateZ: d * 3, scale: 0.96, opacity: 0 },
                    centre: { x: 0, rotateY: 0, rotateZ: 0, scale: 1, opacity: 1 },
                    exit: (d: number) =>
                      reduce ? { opacity: 0 } : { x: d * -160, rotateY: d * -24, rotateZ: d * -4, scale: 0.96, opacity: 0 },
                  }}
                  initial="enter"
                  animate="centre"
                  exit="exit"
                  transition={
                    reduce
                      ? { duration: 0.15 }
                      : { type: "spring", stiffness: 300, damping: 30, mass: 0.9, opacity: { duration: 0.22 } }
                  }
                  drag={reduce ? false : "x"}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.55}
                  dragMomentum={false}
                  onDragEnd={onDragEnd}
                  className="paper absolute inset-0 flex cursor-grab touch-pan-y select-none flex-col rounded-3xl bg-vellum p-7 text-ink-900 shadow-[0_40px_100px_rgba(0,0,0,0.6)] active:cursor-grabbing sm:p-10"
                  style={{
                    x: dragX,
                    rotateZ: dragRotate,
                    transformOrigin: "50% 120%",
                    backfaceVisibility: "hidden",
                  }}
                >
                  {/* Card head. */}
                  <div className="flex items-center justify-between border-b border-ink-900 pb-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-900/55">
                    <span>Question {String(active + 1).padStart(2, "0")}</span>
                    <span>{faq.eyebrow}</span>
                  </div>

                  <h3 className="font-display mt-8 text-ink-900" style={{ fontSize: "clamp(1.8rem, 1.2rem + 2.2vw, 3rem)", lineHeight: 1.02 }}>
                    {item.q}
                  </h3>

                  <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-ink-900/75" aria-label={item.a}>
                    {words.map((w, i) => (
                      <motion.span
                        key={`${active}-${i}`}
                        aria-hidden="true"
                        className="inline-block"
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.015, duration: 0.4, ease: ease.enter }}
                      >
                        {w}&nbsp;
                      </motion.span>
                    ))}
                  </p>

                  {/* Card foot. */}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-ink-900/15 pt-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => go(active - 1)}
                        aria-label="Previous question"
                        className="grid size-10 place-items-center rounded-full border border-ink-900/20 transition-colors hover:bg-ink-900 hover:text-vellum"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => go(active + 1)}
                        aria-label="Next question"
                        className="grid size-10 place-items-center rounded-full border border-ink-900/20 transition-colors hover:bg-ink-900 hover:text-vellum"
                      >
                        →
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="touch-only font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-900/40">
                        Swipe
                      </span>
                      <button
                        type="button"
                        onClick={() => openHire()}
                        className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-900/60 underline decoration-ink-900/30 underline-offset-[6px] transition-colors hover:text-ink-900 hover:decoration-ink-900"
                      >
                        Not here? Ask us directly
                      </button>
                    </div>
                  </div>
                </motion.article>
              </AnimatePresence>

              {/* The rest of the deck, peeking out beneath. */}
              <motion.div
                aria-hidden="true"
                className="absolute inset-x-3 -bottom-2 top-3 -z-10 rounded-3xl bg-vellum/40"
                style={{ scale: deckScale, y: deckY }}
              />
              <div aria-hidden="true" className="absolute inset-x-6 -bottom-4 top-6 -z-20 rounded-3xl bg-vellum/20" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
