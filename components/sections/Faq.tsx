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

  const onDragEnd = (_: unknown, info: PanInfo) => {
    dragX.set(0);
    const { offset, velocity } = info;
    // A decisive flick or a long enough pull turns the card; anything less
    // springs back.
    if (offset.x < -70 || velocity.x < -450) go(1, true);
    else if (offset.x > 70 || velocity.x > 450) go(-1, true);
  };

  const activeRef = useRef(0);
  activeRef.current = active;

  /** Move by a delta, or jump to an index. Reads the live index from a ref. */
  const go = useCallback(
    (to: number, relative = false) => {
      const n = faqItems.length;
      const cur = activeRef.current;
      const next = (((relative ? cur + to : to) % n) + n) % n;
      if (next === cur) return;
      setDir(next > cur || (cur === n - 1 && next === 0) ? 1 : -1);
      setActive(next);
      // Below lg the card sits above the list, so a tap further down the
      // list would otherwise change a card the reader cannot see.
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const root = document.getElementById("faq");
      if (!root || !root.contains(document.activeElement)) return;
      if (e.key === "ArrowDown" || e.key === "j") go(1, true);
      if (e.key === "ArrowUp" || e.key === "k") go(-1, true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

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
              {/*
                The deck. The next two questions are real cards sitting under
                the top one, so turning a card reveals the card beneath it
                rather than an empty placeholder. Each card animates to the
                pose of its depth; the leaving card slides off the top while
                the one beneath rises into its place.
              */}
              <AnimatePresence custom={dir} initial={false}>
                {[0, 1, 2].map((depth) => {
                  const idx = (active + depth) % faqItems.length;
                  const q = faqItems[idx];
                  const top = depth === 0;
                  return (
                    <motion.article
                      key={idx}
                      custom={dir}
                      // A card arriving on top (stepping back) comes in from the
                      // side. A card arriving at the back of the stack fades up
                      // into its slot; it should never fly across the screen.
                      initial={
                        reduce
                          ? { opacity: 0 }
                          : top
                            ? { x: dir * 140, rotateZ: dir * 4, scale: 0.96, opacity: 0, y: 0 }
                            : { x: 0, rotateZ: 0, scale: 0.9, opacity: 0, y: depth * 14 + 24 }
                      }
                      animate={{
                        x: 0,
                        rotateZ: 0,
                        y: depth * 14,
                        scale: 1 - depth * 0.04,
                        opacity: depth === 2 ? 0.85 : 1,
                      }}
                      // Stepping forward, the leaving card is the top one: it
                      // slides off. Stepping back, the leaving card is the deepest
                      // one: it just sinks away behind the stack.
                      exit={
                        reduce
                          ? { opacity: 0 }
                          : dir > 0
                            ? { x: -180, rotateZ: -6, opacity: 0 }
                            : { y: 60, scale: 0.86, opacity: 0 }
                      }
                      transition={
                        reduce
                          ? { duration: 0.15 }
                          : {
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                              mass: 0.9,
                              opacity: { duration: 0.22 },
                            }
                      }
                      drag={top && !reduce ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.55}
                      dragMomentum={false}
                      onDrag={top ? (_, info) => dragX.set(info.offset.x) : undefined}
                      onDragEnd={top ? onDragEnd : undefined}
                      aria-hidden={top ? undefined : true}
                      className={`paper absolute inset-0 select-none rounded-3xl bg-vellum p-7 text-ink-900 shadow-[0_40px_100px_rgba(0,0,0,0.6)] sm:p-10 ${
                        top ? "cursor-grab touch-pan-y active:cursor-grabbing" : "pointer-events-none"
                      }`}
                      style={{ transformOrigin: "50% 120%", zIndex: 30 - depth * 10 }}
                    >
                      <motion.div
                        className="flex h-full flex-col"
                        style={top ? { rotateZ: dragRotate, transformOrigin: "50% 120%" } : undefined}
                      >
                      {/* Card head. */}
                      <div className="flex items-center justify-between border-b border-ink-900 pb-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-900/55">
                        <span>Question {String(idx + 1).padStart(2, "0")}</span>
                        <span>{faq.eyebrow}</span>
                      </div>

                      <h3 className="font-display mt-8 text-ink-900" style={{ fontSize: "clamp(1.8rem, 1.2rem + 2.2vw, 3rem)", lineHeight: 1.02 }}>
                        {q.q}
                      </h3>

                      <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-ink-900/75" aria-label={q.a}>
                        {top
                          ? words.map((w, i) => (
                              <motion.span
                                key={`${idx}-${i}`}
                                aria-hidden="true"
                                className="inline-block"
                                initial={reduce ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 + i * 0.015, duration: 0.4, ease: ease.enter }}
                              >
                                {w}&nbsp;
                              </motion.span>
                            ))
                          : q.a}
                      </p>

                      {/* Card foot. */}
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-ink-900/15 pt-5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => go(-1, true)}
                            tabIndex={top ? 0 : -1}
                            aria-label="Previous question"
                            className="grid size-10 place-items-center rounded-full border border-ink-900/20 transition-colors hover:bg-ink-900 hover:text-vellum"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => go(1, true)}
                            tabIndex={top ? 0 : -1}
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
                            tabIndex={top ? 0 : -1}
                            className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-900/60 underline decoration-ink-900/30 underline-offset-[6px] transition-colors hover:text-ink-900 hover:decoration-ink-900"
                          >
                            Not here? Ask us directly
                          </button>
                        </div>
                      </div>
                      </motion.div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
