"use client";

import Link from "next/link";
import { animate, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { company, ease, report, severityLabel, severityWeight, type ReportFinding, type SeverityLevel } from "@/brand";
import Mark from "@/components/ui/Mark";

/**
 * The sample report, as a deck.
 *
 * One screen per part. The page snaps from sheet to sheet; each sheet is a
 * piece of paper on the dark ground with one idea on it, and it animates in
 * every time it arrives: the title rises, counters count, the summary lands
 * line by line, the three fixes stamp in, each finding's evidence is
 * redacted until the sheet is in front of you and then wipes clean.
 *
 * A rail at the bottom names the sheet you are on and lets you jump. Arrow
 * keys, space and page keys move through the deck.
 */

interface Slide {
  id: string;
  label: string;
}

const SLIDES: Slide[] = [
  { id: "cover", label: "Cover" },
  { id: "summary", label: "Summary" },
  { id: "first", label: "Fix first" },
  ...report.findings.map((f, i) => ({ id: `f-${i}`, label: `Finding ${String.fromCharCode(65 + i)}` })),
  { id: "scope", label: "What we read" },
  { id: "custody", label: "Custody" },
];

function Counter({ to, on, format }: { to: number; on: boolean; format: (n: number) => string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!on) {
      setV(0);
      return;
    }
    const c = animate(0, to, { duration: 1.4, ease: ease.settle, onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [on, to]);
  return <span>{format(v)}</span>;
}

/** Severity: the word, then four marks. Fills when the sheet is active; critical keeps pulsing. */
function Meter({ level, on, delay = 0 }: { level: SeverityLevel; on: boolean; delay?: number }) {
  const filled = severityWeight[level];
  const urgent = level === "critical";
  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap">
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-900/70">{severityLabel[level]}</span>
      <span className="flex items-center gap-[4px]" role="img" aria-label={`Severity: ${severityLabel[level]}`}>
        {[0, 1, 2, 3].map((i) => {
          const lit = i < filled;
          return (
            <motion.span
              key={i}
              aria-hidden="true"
              className={`block size-[7px] ${lit ? "bg-ink-900" : "border border-ink-900/35"}`}
              animate={on ? (lit && urgent ? { scale: 1, opacity: [1, 0.35, 1] } : { scale: 1, opacity: 1 }) : { scale: 0.2, opacity: 0 }}
              transition={
                on
                  ? lit && urgent
                    ? {
                        scale: { delay: delay + i * 0.1, type: "spring", stiffness: 500, damping: 22 },
                        opacity: { delay: delay + 0.6 + i * 0.15, duration: 2.4, repeat: Infinity, ease: "easeInOut" },
                      }
                    : { delay: delay + i * 0.1, type: "spring", stiffness: 500, damping: 22 }
                  : { duration: 0.2 }
              }
            />
          );
        })}
      </span>
    </span>
  );
}

/** Words that land one after another whenever the sheet is active. */
function Words({ text, on, delay = 0, step = 0.02, className = "" }: { text: string; on: boolean; delay?: number; step?: number; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block"
          animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={on ? { delay: delay + i * step, duration: 0.4, ease: ease.enter } : { duration: 0.15 }}
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </span>
  );
}

/** A sheet: one screen, one piece of paper. */
function Sheet({ id, on, children, bare = false }: { id: string; on: boolean; children: ReactNode; bare?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <section id={id} data-slide={id} className="flex min-h-[100svh] snap-start items-center px-[var(--gutter)] py-20 sm:px-[max(var(--gutter),3rem)]">
      {bare ? (
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      ) : (
        <motion.div
          animate={on ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : { opacity: 0.55, y: 30, rotateX: 4, scale: 0.98 }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, ease: ease.settle }}
          className="paper mx-auto w-full max-w-5xl rounded-3xl bg-vellum p-7 text-ink-900 shadow-[0_50px_140px_rgba(0,0,0,0.7)] sm:p-12"
          style={{ transformOrigin: "50% 80%" }}
        >
          {children}
        </motion.div>
      )}
    </section>
  );
}

function Head({ n, title, on }: { n: string; title: string; on: boolean }) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-900/45">{n}</span>
        <h2 className="font-display text-[1.9rem] leading-none text-ink-900 sm:text-[2.6rem]">
          <Words text={title} on={on} step={0.06} />
        </h2>
      </div>
      <motion.div className="mt-5 h-px origin-left bg-ink-900" animate={{ scaleX: on ? 1 : 0 }} transition={{ duration: 0.9, delay: 0.2, ease: ease.settle }} />
    </div>
  );
}

function FindingSheet({ f, index, on }: { f: ReportFinding; index: number; on: boolean }) {
  const hideAt = f.code.findIndex((c) => c.hide);
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-900/45">
          Finding {String.fromCharCode(65 + index)} · {f.ref}
        </p>
        <div className="mt-3">
          <Meter level={f.severity} on={on} delay={0.3} />
        </div>
        <h2 className="font-display mt-6 text-[2rem] leading-[1.02] text-ink-900 sm:text-[2.6rem]">
          <Words text={f.title} on={on} delay={0.1} step={0.05} />
        </h2>
        <p className="mt-6 font-mono text-[0.72rem] text-ink-900/60" aria-label={f.path}>
          {f.path.split("").map((ch, ci) => (
            <motion.span key={ci} aria-hidden="true" animate={{ opacity: on ? 1 : 0 }} transition={{ delay: on ? 0.5 + ci * 0.018 : 0, duration: 0.05 }}>
              {ch}
            </motion.span>
          ))}
          {f.line > 0 && (
            <motion.span className="ml-2 text-ink-900/40" animate={{ opacity: on ? 1 : 0 }} transition={{ delay: on ? 0.55 + f.path.length * 0.018 : 0 }}>
              L{f.line}
            </motion.span>
          )}
        </p>
        <motion.span aria-hidden="true" className="mt-5 block h-px w-8 origin-left bg-ink-900/40" animate={{ scaleX: on ? 1 : 0 }} transition={{ delay: 0.7, duration: 0.5, ease: ease.wipe }} />
        <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-900/45">Effort · {f.effort}</p>
      </div>

      <div className="lg:col-span-8">
        {/* Evidence: lines arrive, the secret waits behind ink with a caret, then wipes clean. */}
        <div className="overflow-x-auto rounded-2xl border border-ink-900/15 bg-[#f4f2ec] p-5 font-mono text-[0.78rem] leading-[1.95] sm:p-6">
          {f.code.map((l, i) => (
            <motion.div
              key={i}
              className="flex gap-4 whitespace-pre"
              animate={on ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ delay: on ? 0.25 + i * 0.12 : 0, duration: 0.4, ease: ease.enter }}
            >
              <span className="w-5 shrink-0 select-none text-right text-ink-900/30">{f.line > 0 ? f.line - (hideAt - i) : i + 1}</span>
              <span className={`relative inline-block ${l.dim ? "text-ink-900/55" : "text-ink-900"}`}>
                {l.text}
                {l.hide && (
                  <>
                    <motion.span
                      aria-hidden="true"
                      className="absolute -inset-x-1 -inset-y-0.5 origin-right bg-ink-900"
                      animate={{ scaleX: on ? 0 : 1 }}
                      transition={on ? { delay: 1.4 + i * 0.1, duration: 0.6, ease: ease.wipe } : { duration: 0.2 }}
                    />
                    <motion.span
                      aria-hidden="true"
                      className="absolute -right-3 top-[0.2em] h-[1.1em] w-px bg-ink-900"
                      animate={{ opacity: on ? [1, 0, 1, 0, 1, 0] : 0 }}
                      transition={{ duration: 1.4, ease: "linear" }}
                    />
                  </>
                )}
              </span>
            </motion.div>
          ))}
        </div>

        <dl className="mt-7 grid gap-6 sm:grid-cols-2">
          {[
            ["What it means", f.means, 1.0],
            ["The fix", f.fix, 1.15],
          ].map(([k, v, d]) => (
            <motion.div key={k as string} animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }} transition={{ delay: on ? (d as number) : 0, duration: 0.5, ease: ease.enter }}>
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-900/45">{k as string}</dt>
              <dd className="mt-2 text-[0.95rem] leading-relaxed text-ink-900/80">{v as string}</dd>
            </motion.div>
          ))}
          <motion.div className="sm:col-span-2" animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }} transition={{ delay: on ? 1.3 : 0, duration: 0.5, ease: ease.enter }}>
            <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-900/45">How we found it</dt>
            <dd className="mt-2 text-[0.88rem] leading-relaxed text-ink-900/65">{f.how}</dd>
          </motion.div>
        </dl>
      </div>
    </div>
  );
}

export default function SampleReport() {
  const reduce = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-slide]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(els.indexOf(e.target as HTMLElement));
        }
      },
      { root, threshold: 0.55 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = useCallback(
    (i: number) => {
      const root = scroller.current;
      if (!root) return;
      const n = Math.max(0, Math.min(SLIDES.length - 1, i));
      const el = root.querySelectorAll<HTMLElement>("[data-slide]")[n];
      el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    },
    [reduce],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(active + 1);
      }
      if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(active - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  const on = (id: string) => SLIDES[active]?.id === id;

  return (
    <main className="relative h-[100svh] overflow-hidden bg-ink-900 text-vellum">
      <div ref={scroller} className="h-full snap-y snap-proximity overflow-y-auto overflow-x-clip lg:snap-mandatory" style={{ perspective: "2000px" }}>
        {/* 1. Cover: dark, the title rising, the numbers counting. */}
        <Sheet id="cover" on={on("cover")} bare>
          <motion.p animate={on("cover") ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
            <motion.span aria-hidden="true" className="block h-px w-6 origin-left bg-faint" animate={{ scaleX: on("cover") ? 1 : 0 }} transition={{ duration: 0.6, ease: ease.settle }} />
            Free code review · {report.head.left} · sample, anonymised
          </motion.p>
          <h1 className="font-display mt-8 text-vellum" style={{ fontSize: "clamp(3.2rem, 1.5rem + 7vw, 8rem)", lineHeight: 0.92, letterSpacing: "-0.03em" }}>
            {report.title.split(" ").map((w, i) => (
              <span key={i} className="mr-[0.24em] inline-block overflow-hidden pb-[0.08em] align-top last:mr-0">
                <motion.span className="inline-block" animate={{ y: on("cover") ? "0%" : "110%" }} transition={{ duration: 0.9, delay: on("cover") ? 0.15 + i * 0.09 : 0, ease: ease.settle }}>
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-ink-500 pt-7 sm:grid-cols-3 lg:grid-cols-6">
            {report.meta.map((m, i) => (
              <motion.div key={m.label} animate={on("cover") ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }} transition={{ delay: on("cover") ? 0.6 + i * 0.08 : 0, duration: 0.5, ease: ease.enter }}>
                <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">{m.label}</dt>
                <dd className="mt-2 font-mono text-[0.85rem] tabular-nums text-vellum">
                  {"counter" in m && m.counter ? (
                    <Counter to={m.counter} on={on("cover")} format={(n) => (m.label === "Time spent" ? `${Math.floor(n / 60)} h ${String(n % 60).padStart(2, "0")} min` : n.toLocaleString())} />
                  ) : (
                    m.value
                  )}
                </dd>
              </motion.div>
            ))}
          </dl>
          <motion.button
            type="button"
            onClick={() => go(1)}
            animate={on("cover") ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-14 inline-flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted hover:text-vellum"
          >
            Read
            <motion.span aria-hidden="true" animate={{ y: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
              ↓
            </motion.span>
          </motion.button>
        </Sheet>

        {/* 2. Summary: the first paragraph large, the rest beneath. */}
        <Sheet id="summary" on={on("summary")}>
          <Head n="01" title="Summary, in plain language" on={on("summary")} />
          <p className="font-display mt-10 max-w-3xl text-[1.5rem] leading-[1.2] text-ink-900 sm:text-[2rem]">
            <Words text={report.summary[0]} on={on("summary")} delay={0.4} step={0.035} />
          </p>
          <div className="mt-8 grid gap-6 border-t border-ink-900/15 pt-6 sm:grid-cols-2">
            {report.summary.slice(1).map((p, i) => (
              <p key={i} className="text-[0.95rem] leading-relaxed text-ink-900/75">
                <Words text={p} on={on("summary")} delay={1.2 + i * 0.4} step={0.012} />
              </p>
            ))}
          </div>
        </Sheet>

        {/* 3. Fix first: three things, huge numbers, stamped in. */}
        <Sheet id="first" on={on("first")}>
          <Head n="02" title="Fix first" on={on("first")} />
          <ol className="mt-6">
            {report.fixFirst.map((f, i) => (
              <motion.li
                key={f.n}
                animate={on("first") ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
                transition={{ delay: on("first") ? 0.3 + i * 0.18 : 0, duration: 0.6, ease: ease.settle }}
                className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-x-5 gap-y-3 border-b border-ink-900/15 py-7 sm:grid-cols-[5rem_minmax(0,1fr)_auto]"
              >
                <span className="inline-block overflow-hidden font-display text-[2.6rem] leading-none text-ink-900 sm:text-[3.4rem]">
                  <motion.span className="inline-block" animate={{ y: on("first") ? "0%" : "110%" }} transition={{ delay: on("first") ? 0.35 + i * 0.18 : 0, duration: 0.7, ease: ease.settle }}>
                    {f.n}
                  </motion.span>
                </span>
                <span className="text-[1.1rem] leading-snug text-ink-900 sm:text-[1.35rem]">
                  <Words text={f.text} on={on("first")} delay={0.5 + i * 0.18} step={0.03} />
                </span>
                <span className="col-start-2 sm:col-start-auto">
                  <Meter level={f.severity} on={on("first")} delay={0.7 + i * 0.18} />
                </span>
              </motion.li>
            ))}
          </ol>
        </Sheet>

        {/* 4 to 8. One finding per sheet. */}
        {report.findings.map((f, i) => (
          <Sheet key={f.ref} id={`f-${i}`} on={on(`f-${i}`)}>
            <FindingSheet f={f} index={i} on={on(`f-${i}`)} />
          </Sheet>
        ))}

        {/* 9. Scope. */}
        <Sheet id="scope" on={on("scope")}>
          <Head n="04" title="What we read, and what we did not" on={on("scope")} />
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            {[
              ["Read", report.scope.read],
              ["Not done, on purpose", report.scope.notRead],
            ].map(([label, items], col) => (
              <div key={label as string}>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-900/45">{label as string}</p>
                <ul className="mt-3">
                  {(items as readonly string[]).map((t, i) => (
                    <motion.li
                      key={t}
                      animate={on("scope") ? { opacity: 1, x: 0 } : { opacity: 0, x: col ? 14 : -14 }}
                      transition={{ delay: on("scope") ? 0.3 + i * 0.1 : 0, duration: 0.5, ease: ease.enter }}
                      className="flex gap-3 border-b border-ink-900/15 py-3 text-[0.92rem] leading-relaxed text-ink-900/80"
                    >
                      <motion.span
                        aria-hidden="true"
                        className="mt-[0.7em] block h-px w-4 shrink-0 origin-left bg-ink-900/50"
                        animate={{ scaleX: on("scope") ? 1 : 0 }}
                        transition={{ delay: on("scope") ? 0.5 + i * 0.1 : 0, duration: 0.4, ease: ease.wipe }}
                      />
                      {t}
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Sheet>

        {/* 10. Custody and the stamp. */}
        <Sheet id="custody" on={on("custody")}>
          <Head n="05" title="Custody" on={on("custody")} />
          <ol className="relative mt-8 border-l border-ink-900/20 pl-8">
            {report.custody.map((c, i) => (
              <motion.li
                key={c.when}
                animate={on("custody") ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ delay: on("custody") ? 0.3 + i * 0.15 : 0, duration: 0.5, ease: ease.enter }}
                className="relative pb-6 last:pb-0"
              >
                <motion.span
                  aria-hidden="true"
                  className="absolute -left-[2.3rem] top-1.5 size-2.5 rounded-full bg-ink-900"
                  animate={{ scale: on("custody") ? 1 : 0 }}
                  transition={{ delay: on("custody") ? 0.4 + i * 0.15 : 0, type: "spring", stiffness: 500, damping: 20 }}
                />
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-900/50">{c.when}</p>
                <p className="mt-1 text-[1.05rem] text-ink-900">{c.what}</p>
              </motion.li>
            ))}
          </ol>
          <div className="mt-12 flex flex-col gap-6 border-t border-ink-900 pt-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-display text-[1.5rem] italic leading-tight text-ink-900">{report.signoff.line}</p>
              <p className="mt-2 font-mono text-[0.72rem] text-ink-900/60">
                {report.signoff.from} ·{" "}
                <a href={`mailto:${report.signoff.email}`} className="underline underline-offset-4 hover:text-ink-900">
                  {report.signoff.email}
                </a>
              </p>
            </div>
            <motion.span
              aria-hidden="true"
              animate={on("custody") ? { opacity: 1, scale: 1, rotate: -7 } : { opacity: 0, scale: 2.2, rotate: -14 }}
              transition={on("custody") ? { delay: 1.1, type: "spring", stiffness: 380, damping: 20 } : { duration: 0.2 }}
              className="w-fit rounded-md border-[3px] border-ink-900 px-5 py-2 font-mono text-[0.85rem] uppercase tracking-[0.3em] text-ink-900"
            >
              Verified
            </motion.span>
          </div>
        </Sheet>
      </div>

      {/* The rail. */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-ink-900 via-ink-900/80 to-transparent pt-10"
        style={{ paddingBottom: "calc(0.75rem + var(--safe-bottom))" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-[var(--gutter)] sm:px-[max(var(--gutter),3rem)]">
          <Link href="/" className="pointer-events-auto group inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted hover:text-vellum">
            <span className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
            <Mark className="size-3.5" />
            {company.name}
          </Link>
          <div className="pointer-events-auto hidden items-center gap-1.5 sm:flex">
            {SLIDES.map((s, i) => (
              <button key={s.id} type="button" onClick={() => go(i)} aria-label={s.label} aria-current={i === active ? "true" : undefined} className="group relative px-0.5 py-2">
                <motion.span className="block h-px bg-vellum" animate={{ width: i === active ? 28 : 10, opacity: i === active ? 1 : 0.35 }} transition={{ duration: 0.4, ease: ease.settle }} />
              </button>
            ))}
          </div>
          <span className="whitespace-nowrap font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
            <span className="text-vellum">{SLIDES[active]?.label}</span>
            <span className="ml-3 tabular-nums">
              {String(active + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
          </span>
        </div>
      </div>
    </main>
  );
}
