"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ease, hire, serviceList } from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";

type Status = "idle" | "sending" | "sent";

/**
 * The hire sheet.
 *
 * Deliberately not the booking sheet. The free review is paper; hiring us is
 * ink: a dark card, one page, no steps. It reads as composing an email, which
 * is what it is. Service, size and timeline are chips so the message we get
 * is already structured; the brief is the only long field.
 *
 * SUBMISSION IS A STUB. `submit()` waits, then shows the sent state. The
 * payload is shaped for an email body. A mailto fallback is always visible.
 */

const field =
  "w-full rounded-xl border border-ink-500 bg-ink-800 px-4 py-3.5 text-vellum placeholder:text-faint transition-[border-color,box-shadow] focus:border-vellum focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)] focus:outline-none";

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-4 py-2 text-[0.875rem] transition-colors ${
        on ? "border-vellum bg-vellum text-ink-900" : "border-ink-500 text-muted hover:border-ink-400 hover:text-vellum"
      }`}
    >
      {children}
    </motion.button>
  );
}

export default function HireModal() {
  const { hireOpen, hireService, closeHire } = useBooking();
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const [service, setService] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!hireOpen) return;
    setStatus("idle");
    setService(hireService);
    setSize(null);
    setTimeline(null);
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

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const brief = String(data.get("brief") ?? "").trim();
    if (!name || !email || !brief) {
      setError("Name, email and the brief — those three we need.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email doesn't look right.");
      return;
    }
    setError(null);
    setStatus("sending");
    // TODO: send as an email. Payload:
    void { name, email, company: data.get("company"), service, size, timeline, brief };
    await new Promise((r) => setTimeout(r, 900));
    setStatus("sent");
  }

  const mailto = `mailto:${hire.email}?subject=${encodeURIComponent(
    `Hire: ${serviceList.find((s) => s.id === service)?.title ?? "project"}`,
  )}`;

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
          <button
            type="button"
            aria-label="Close"
            onClick={closeHire}
            className="absolute inset-0 bg-ink-900/85 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hire-heading"
            className="relative z-10 flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-ink-500 bg-ink-700 text-vellum shadow-[0_40px_120px_rgba(0,0,0,0.7)] sm:rounded-3xl"
            initial={reduce ? { opacity: 0 } : { y: 80, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }}
          >
            {/* Envelope header. */}
            <div className="flex items-start justify-between gap-6 border-b border-ink-500 px-6 pb-5 pt-6 sm:px-9">
              <div>
                <p className="label">{hire.eyebrow}</p>
                <h2 id="hire-heading" className="font-display mt-2 text-[1.9rem] leading-none sm:text-[2.4rem]">
                  {hire.heading}
                </h2>
                <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-muted">{hire.intro}</p>
              </div>
              <button
                type="button"
                onClick={closeHire}
                aria-label="Close"
                className="group grid size-10 shrink-0 place-items-center rounded-full border border-ink-500 transition-colors hover:bg-vellum hover:text-ink-900"
              >
                <span className="block text-lg leading-none transition-transform duration-300 group-hover:rotate-90">×</span>
              </button>
            </div>

            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-6 sm:px-9 sm:py-8">
              <AnimatePresence mode="wait" initial={false}>
                {status === "sent" ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: ease.settle }}
                    className="flex min-h-[16rem] flex-col justify-center"
                  >
                    <motion.span
                      aria-hidden="true"
                      className="grid size-14 place-items-center rounded-full bg-vellum text-ink-900"
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.1 }}
                    >
                      ↗
                    </motion.span>
                    <h3 className="font-display mt-6 text-[2.2rem] leading-none">{hire.success.heading}</h3>
                    <p className="mt-4 max-w-md leading-relaxed text-muted">{hire.success.body}</p>
                    <button
                      type="button"
                      onClick={closeHire}
                      className="mt-8 w-fit rounded-full bg-vellum px-6 py-3 font-medium text-ink-900"
                    >
                      {hire.success.close}
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    ref={formRef}
                    onSubmit={submit}
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid gap-6"
                  >
                    {/* To: line, like an email. */}
                    <div className="flex items-center gap-3 border-b border-ink-500 pb-4 font-mono text-[0.8125rem]">
                      <span className="text-faint">To:</span>
                      <span className="text-vellum">{hire.email}</span>
                    </div>

                    <div>
                      <span className="label mb-3 block">{hire.serviceLabel}</span>
                      <div className="flex flex-wrap gap-2">
                        {serviceList.map((s) => (
                          <Chip key={s.id} on={service === s.id} onClick={() => setService(service === s.id ? null : s.id)}>
                            {s.title}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <span className="label mb-3 block">{hire.sizeLabel}</span>
                        <div className="flex flex-wrap gap-2">
                          {hire.sizes.map((s) => (
                            <Chip key={s.id} on={size === s.id} onClick={() => setSize(size === s.id ? null : s.id)}>
                              {s.label}
                              <span className={`ml-2 font-mono text-[0.65rem] ${size === s.id ? "text-ink-900/60" : "text-faint"}`}>
                                {s.hint}
                              </span>
                            </Chip>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="label mb-3 block">{hire.timelineLabel}</span>
                        <div className="flex flex-wrap gap-2">
                          {hire.timelines.map((t) => (
                            <Chip key={t} on={timeline === t} onClick={() => setTimeline(timeline === t ? null : t)}>
                              {t}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="label mb-2.5 block">{hire.fields.name.label}</span>
                        <input name="name" required autoComplete="name" className={field} />
                      </label>
                      <label className="block">
                        <span className="label mb-2.5 block">{hire.fields.email.label}</span>
                        <input name="email" type="email" required inputMode="email" autoComplete="email" placeholder={hire.fields.email.placeholder} className={field} />
                      </label>
                    </div>
                    <label className="block">
                      <span className="label mb-2.5 block">{hire.fields.company.label}</span>
                      <input name="company" autoComplete="organization" placeholder={hire.fields.company.placeholder} className={field} />
                    </label>
                    <label className="block">
                      <span className="label mb-2.5 block">{hire.fields.brief.label}</span>
                      <textarea name="brief" required rows={5} placeholder={hire.fields.brief.placeholder} className={`${field} resize-y`} />
                    </label>

                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          role="alert"
                          className="font-mono text-[0.8125rem] text-vellum"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <div className="flex flex-col gap-4 border-t border-ink-500 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-mono text-[0.7rem] leading-relaxed text-faint">
                        {hire.or}{" "}
                        <a href={mailto} className="text-muted underline underline-offset-4 hover:text-vellum">
                          {hire.email}
                        </a>
                      </p>
                      <motion.button
                        type="submit"
                        disabled={status === "sending"}
                        whileTap={{ scale: 0.97 }}
                        className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-vellum py-3 pl-6 pr-2 font-medium text-ink-900 disabled:opacity-60"
                      >
                        {status === "sending" ? hire.submitting : hire.submit}
                        <span className="grid size-7 place-items-center rounded-full bg-ink-900 text-vellum transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                          ↗
                        </span>
                      </motion.button>
                    </div>
                    <p className="font-mono text-[0.65rem] text-faint">{hire.note}</p>
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
