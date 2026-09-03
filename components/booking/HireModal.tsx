"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { company, ease, hire, serviceList } from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";

type Status = "idle" | "sending" | "sent";

/**
 * The hire sheet: a letter you compose.
 *
 * The free review is a paper form in three steps. Hiring us is a letter, and
 * the sheet is built around that: on the left, the letter itself on paper,
 * written live from what you choose and type; on the right, the choices.
 * Chips are segmented controls with a pill that slides between options, the
 * inputs are ruled lines rather than boxes, and there is one action.
 *
 * When you send, the letter folds away and a stamp lands where it was.
 *
 * On submit it posts to /api/enquiry, which emails the studio the letter on
 * the left and sends an acknowledgement back. The mailto fallback under the
 * button is always there, and it is what the error points to.
 */

const line =
  "w-full border-b border-ink-500 bg-transparent py-3 text-[1.0625rem] text-vellum placeholder:text-faint transition-colors focus:border-vellum focus:outline-none";

function Segment<T extends string>({
  label,
  options,
  value,
  onChange,
  id,
}: {
  label: string;
  options: { id: T; label: string; hint?: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
  id: string;
}) {
  return (
    <div>
      <span className="label mb-3 block">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(on ? null : o.id)}
              aria-pressed={on}
              className={`relative rounded-full px-4 py-2 text-[0.875rem] transition-colors ${
                on ? "text-ink-900" : "text-muted hover:text-vellum"
              }`}
            >
              {on && (
                <motion.span
                  layoutId={`seg-${id}`}
                  className="absolute inset-0 rounded-full bg-vellum"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              {!on && <span className="absolute inset-0 rounded-full border border-ink-500" />}
              <span className="relative">
                {o.label}
                {o.hint && <span className={`ml-2 font-mono text-[0.65rem] ${on ? "text-ink-900/60" : "text-faint"}`}>{o.hint}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function HireModal() {
  const { hireOpen, hireService, closeHire } = useBooking();
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [service, setService] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [brief, setBrief] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hireOpen) return;
    setStatus("idle");
    setService(hireService);
    setSize(null);
    setTimeline(null);
    setName("");
    setEmail("");
    setOrg("");
    setBrief("");
    setError(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeHire();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [hireOpen, hireService, closeHire]);

  const serviceTitle = serviceList.find((s) => s.id === service)?.title ?? null;
  const sizeLabel = hire.sizes.find((s) => s.id === size)?.label ?? null;

  /** The letter, assembled from the form. This is the payload. */
  const letter = useMemo(() => {
    const re = [serviceTitle, sizeLabel && `${sizeLabel.toLowerCase()} project`, timeline && timeline.toLowerCase()]
      .filter(Boolean)
      .join(" · ");
    return {
      re: re || "a project",
      from: name ? `${name}${org ? `, ${org}` : ""}` : "—",
      reply: email || "—",
      body: brief || hire.fields.brief.placeholder,
      empty: !brief,
    };
  }, [serviceTitle, sizeLabel, timeline, name, org, email, brief]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !brief.trim()) {
      setError("Name, email and the brief. Those three we need.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email doesn't look right.");
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "hire",
          name,
          email,
          company: org,
          service: serviceList.find((s) => s.id === service)?.title ?? "",
          size: hire.sizes.find((s) => s.id === size)?.label ?? "",
          timeline,
          brief,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `That didn't send. Write to ${company.email} and we'll pick it up.`);
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch {
      setError(`That didn't send. Check your connection, or write to ${company.email}.`);
      setStatus("idle");
    }
  }

  const mailto = `mailto:${hire.email}?subject=${encodeURIComponent(`Hire: ${letter.re}`)}`;
  const t = { duration: reduce ? 0 : 0.45, ease: ease.settle };

  const fields = [
    <Segment
      key="service"
      id="service"
      label={hire.serviceLabel}
      options={serviceList.map((s) => ({ id: s.id, label: s.title }))}
      value={service}
      onChange={setService}
    />,
    <div key="size-time" className="grid gap-8 md:grid-cols-2">
      <Segment
        id="size"
        label={hire.sizeLabel}
        options={hire.sizes.map((s) => ({ id: s.id, label: s.label, hint: s.hint }))}
        value={size}
        onChange={setSize}
      />
      <Segment id="time" label={hire.timelineLabel} options={hire.timelines.map((tl) => ({ id: tl, label: tl }))} value={timeline} onChange={setTimeline} />
    </div>,
    <div key="who" className="grid gap-6 md:grid-cols-2">
      <label className="block">
        <span className="label mb-1 block">{hire.fields.name.label}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" className={line} />
      </label>
      <label className="block">
        <span className="label mb-1 block">{hire.fields.email.label}</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder={hire.fields.email.placeholder}
          className={line}
        />
      </label>
      <label className="block md:col-span-2">
        <span className="label mb-1 block">{hire.fields.company.label}</span>
        <input value={org} onChange={(e) => setOrg(e.target.value)} autoComplete="organization" placeholder={hire.fields.company.placeholder} className={line} />
      </label>
    </div>,
    <label key="brief" className="block">
      <span className="label mb-1 block">{hire.fields.brief.label}</span>
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        required
        rows={4}
        placeholder={hire.fields.brief.placeholder}
        className={`${line} resize-none leading-relaxed`}
      />
      <span className="mt-2 block text-right font-mono text-[0.65rem] text-faint">{brief.length} characters</span>
    </label>,
    <div key="send" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} role="alert" className="font-mono text-[0.75rem] text-vellum">
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        {!error && (
          <p className="font-mono text-[0.68rem] leading-relaxed text-faint">
            {hire.or}{" "}
            <a href={mailto} className="text-muted underline underline-offset-4 hover:text-vellum">
              {hire.email}
            </a>
          </p>
        )}
      </div>
      <motion.button
        type="submit"
        disabled={status === "sending"}
        whileTap={{ scale: 0.97 }}
        className="group inline-flex shrink-0 items-center gap-4 rounded-full bg-vellum py-3.5 pl-7 pr-2 font-medium text-ink-900 disabled:opacity-60"
      >
        {status === "sending" ? hire.submitting : hire.submit}
        <span className="grid size-8 place-items-center rounded-full bg-ink-900 text-vellum transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          ↗
        </span>
      </motion.button>
    </div>,
  ];

  return (
    <AnimatePresence>
      {hireOpen && (
        <motion.div
          key="hire-scrim"
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button type="button" aria-label="Close" onClick={closeHire} className="absolute inset-0 bg-ink-900/85 backdrop-blur-sm" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hire-heading"
            className="relative z-10 grid max-h-[94svh] w-full max-w-5xl grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-t-3xl border border-ink-500 bg-ink-800 text-vellum shadow-[0_50px_140px_rgba(0,0,0,0.75)] sm:rounded-3xl lg:h-[min(94svh,50rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
            initial={reduce ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.9 }}
          >
            {/* Close. */}
            <button
              type="button"
              onClick={closeHire}
              aria-label="Close"
              className="group absolute right-4 top-4 z-20 grid size-10 place-items-center rounded-full border border-ink-500 bg-ink-800/80 backdrop-blur transition-colors hover:bg-vellum hover:text-ink-900"
            >
              <span className="block text-lg leading-none transition-transform duration-300 group-hover:rotate-90">×</span>
            </button>

            {/* The letter. */}
            <div className="relative hidden min-h-0 flex-col overflow-hidden bg-ink-900 p-8 lg:flex" style={{ perspective: "1400px" }}>
              <div className="shrink-0 pb-6">
                <p className="label">{hire.eyebrow}</p>
                <h2 id="hire-heading" className="font-display mt-3 text-[2.2rem] leading-none">
                  {hire.heading}
                </h2>
                <p className="mt-4 max-w-sm text-[0.9rem] leading-relaxed text-muted">{hire.intro}</p>
              </div>

              <AnimatePresence mode="wait">
                {status === "sent" ? (
                  <motion.div
                    key="stamp"
                    initial={{ opacity: 0, scale: 1.6, rotate: -8 }}
                    animate={{ opacity: 1, scale: 1, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                    className="mx-auto my-10 w-fit rounded-md border-2 border-vellum px-5 py-2 font-mono text-[0.85rem] uppercase tracking-[0.3em]"
                  >
                    Sent
                  </motion.div>
                ) : (
                  <motion.article
                    key="letter"
                    initial={{ opacity: 0, y: 24, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -40, rotateX: -60 }}
                    transition={{ duration: 0.55, ease: ease.settle }}
                    className="paper mt-auto min-h-0 overflow-hidden rounded-2xl bg-vellum p-6 text-ink-900 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
                    style={{ transformOrigin: "top center" }}
                  >
                    <dl className="grid grid-cols-[4rem_minmax(0,1fr)] gap-y-2 border-b border-ink-900/15 pb-4 font-mono text-[0.72rem]">
                      <dt className="text-ink-900/45">To</dt>
                      <dd className="text-ink-900">{hire.email}</dd>
                      <dt className="text-ink-900/45">From</dt>
                      <dd className="truncate text-ink-900">{letter.from}</dd>
                      <dt className="text-ink-900/45">Reply</dt>
                      <dd className="truncate text-ink-900">{letter.reply}</dd>
                      <dt className="text-ink-900/45">Re</dt>
                      <dd className="text-ink-900">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={letter.re}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="block"
                          >
                            {letter.re}
                          </motion.span>
                        </AnimatePresence>
                      </dd>
                    </dl>
                    <p
                      className={`mt-4 line-clamp-6 min-h-[5.5rem] whitespace-pre-wrap font-display text-[1.2rem] leading-snug ${
                        letter.empty ? "text-ink-900/35" : "text-ink-900"
                      }`}
                    >
                      {letter.body}
                    </p>
                    <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-900/45">{hire.note}</p>
                  </motion.article>
                )}
              </AnimatePresence>
            </div>

            {/* The choices. */}
            <div data-lenis-prevent className="min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-7 sm:px-9 sm:py-9">
              <div className="mb-8 lg:hidden">
                <p className="label">{hire.eyebrow}</p>
                <h2 className="font-display mt-2 text-[1.9rem] leading-none">{hire.heading}</h2>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">{hire.intro}</p>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {status === "sent" ? (
                  <motion.div key="sent" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={t} className="flex min-h-[20rem] flex-col justify-center">
                    <h3 className="font-display text-[2.6rem] leading-none">{hire.success.heading}</h3>
                    <p className="mt-4 max-w-md leading-relaxed text-muted">{hire.success.body}</p>
                    <button type="button" onClick={closeHire} className="mt-8 w-fit rounded-full bg-vellum px-6 py-3 font-medium text-ink-900">
                      {hire.success.close}
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={submit}
                    noValidate
                    initial="hidden"
                    animate="shown"
                    exit={{ opacity: 0, y: -10 }}
                    variants={{ shown: { transition: { staggerChildren: 0.05 } } }}
                    className="grid gap-8 lg:mt-2"
                  >
                    {fields.map((node, i) => (
                      <motion.div key={i} variants={{ hidden: { opacity: 0, y: 14 }, shown: { opacity: 1, y: 0, transition: { duration: 0.45, ease: ease.enter } } }}>
                        {node}
                      </motion.div>
                    ))}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
