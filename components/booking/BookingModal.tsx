"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { booking, ease, serviceList } from "@/brand";
import { useBooking } from "@/components/booking/BookingContext";

type Status = "idle" | "sending" | "sent";

/**
 * The booking sheet.
 *
 * A paper card on a dark scrim, entering as a sheet that rises and settles.
 * Three short steps, a progress rail on the left, one primary action at a
 * time. Steps slide horizontally; the card height animates with them.
 *
 * SUBMISSION IS A STUB. The form validates, pretends to send for a moment,
 * and shows the success state. Wire `submit()` to a real endpoint later; the
 * payload shape is already the one the /api/contact route accepts.
 */

const slide = {
  enter: (dir: number) => ({ x: dir * 48, opacity: 0, filter: "blur(6px)" }),
  centre: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit: (dir: number) => ({ x: dir * -48, opacity: 0, filter: "blur(6px)" }),
};

const field =
  "peer w-full rounded-xl border border-ink-900/15 bg-white px-4 py-3.5 text-ink-900 placeholder:text-ink-900/35 transition-[border-color,box-shadow] focus:border-ink-900 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)] focus:outline-none";

export default function BookingModal() {
  const { open, interest, closeBooking } = useBooking();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [worries, setWorries] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const data = useRef<Record<string, string>>({});

  // Reset on every open, lock the page behind it, close on Escape.
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setDir(1);
    setStatus("idle");
    setWorries([]);
    setError(null);
    data.current = {};
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeBooking();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeBooking]);

  const interestTitle = serviceList.find((s) => s.id === interest)?.title ?? null;

  /** Collect the current step's inputs and check the required ones. */
  function capture(): boolean {
    const form = formRef.current;
    if (!form) return false;
    const inputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
    for (const el of inputs) {
      if (el.name) data.current[el.name] = el.value;
      if (el.required && !el.value.trim()) {
        el.focus();
        setError("This one we need.");
        return false;
      }
      if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
        el.focus();
        setError("That email doesn't look right.");
        return false;
      }
    }
    setError(null);
    return true;
  }

  function go(to: number) {
    if (to > step && !capture()) return;
    setDir(to > step ? 1 : -1);
    setStep(to);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!capture()) return;
    setStatus("sending");
    // TODO: POST { ...data.current, worries, interest } to the real endpoint.
    void { ...data.current, worries, interest };
    await new Promise((r) => setTimeout(r, 900));
    setStatus("sent");
  }

  const t = { duration: reduce ? 0 : 0.42, ease: ease.settle };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="scrim"
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={closeBooking}
            className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-heading"
            className="paper relative z-10 flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-vellum text-ink-900 shadow-[0_40px_120px_rgba(0,0,0,0.6)] sm:rounded-3xl"
            initial={reduce ? { opacity: 0 } : { y: 80, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }}
          >
            {/* Header. */}
            <div className="flex items-start justify-between gap-6 border-b border-ink-900 px-6 pb-5 pt-6 sm:px-9">
              <div>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-900/55">
                  {booking.eyebrow}
                </p>
                <h2 id="booking-heading" className="font-display mt-2 text-[1.9rem] leading-none sm:text-[2.4rem]">
                  {booking.heading}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeBooking}
                aria-label="Close"
                className="group grid size-10 shrink-0 place-items-center rounded-full border border-ink-900/20 transition-colors hover:bg-ink-900 hover:text-vellum"
              >
                <span className="block text-lg leading-none transition-transform duration-300 group-hover:rotate-90">×</span>
              </button>
            </div>

            <div data-lenis-prevent className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto overflow-x-hidden overscroll-contain sm:grid-cols-[11rem_minmax(0,1fr)]">
              {/* Progress rail. */}
              <aside className="border-b border-ink-900/10 px-6 py-5 sm:border-b-0 sm:border-r sm:px-7 sm:py-8">
                <ol className="flex gap-6 sm:flex-col sm:gap-5">
                  {booking.steps.map((s, i) => {
                    const state = status === "sent" || i < step ? "done" : i === step ? "now" : "todo";
                    return (
                      <li key={s.id} className="flex items-center gap-3">
                        <motion.span
                          className="grid size-6 place-items-center rounded-full border font-mono text-[0.65rem] tabular-nums"
                          animate={{
                            backgroundColor: state === "todo" ? "rgba(0,0,0,0)" : "#000",
                            color: state === "todo" ? "#000" : "#fff",
                            borderColor: state === "todo" ? "rgba(0,0,0,0.25)" : "#000",
                          }}
                          transition={t}
                        >
                          {state === "done" ? "✓" : i + 1}
                        </motion.span>
                        <span
                          className={`font-mono text-[0.7rem] uppercase tracking-[0.14em] ${
                            state === "now" ? "text-ink-900" : "text-ink-900/45"
                          }`}
                        >
                          {s.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>

                <ul className="mt-8 hidden space-y-2 sm:block">
                  {booking.reassurance.map((r) => (
                    <li key={r} className="flex items-center gap-2 font-mono text-[0.65rem] text-ink-900/50">
                      <span className="block size-1 rounded-full bg-ink-900/40" />
                      {r}
                    </li>
                  ))}
                </ul>
              </aside>

              {/* Steps. */}
              <form ref={formRef} onSubmit={submit} noValidate className="relative overflow-x-hidden px-6 py-6 sm:px-9 sm:py-8">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  {status === "sent" ? (
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={t}
                      className="flex min-h-[18rem] flex-col justify-center"
                    >
                      <motion.span
                        aria-hidden="true"
                        className="grid size-14 place-items-center rounded-full bg-ink-900 text-vellum"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.1 }}
                      >
                        ✓
                      </motion.span>
                      <h3 className="font-display mt-6 text-[2.2rem] leading-none">{booking.success.heading}</h3>
                      <p className="mt-4 max-w-md leading-relaxed text-ink-900/70">{booking.success.body}</p>
                      <button
                        type="button"
                        onClick={closeBooking}
                        className="mt-8 w-fit rounded-full bg-ink-900 px-6 py-3 font-medium text-vellum"
                      >
                        {booking.success.close}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={step}
                      custom={dir}
                      variants={slide}
                      initial="enter"
                      animate="centre"
                      exit="exit"
                      transition={t}
                      className="grid gap-5"
                    >
                      {step === 0 && (
                        <>
                          <Field label={booking.fields.repo.label} hint={booking.fields.repo.hint}>
                            <input
                              name="subject"
                              required
                              defaultValue={data.current.subject}
                              inputMode="url"
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                              placeholder={booking.fields.repo.placeholder}
                              className={`${field} font-mono text-[0.9375rem]`}
                            />
                          </Field>
                          <Field label={booking.fields.stack.label}>
                            <input
                              name="stack"
                              defaultValue={data.current.stack}
                              placeholder={booking.fields.stack.placeholder}
                              className={field}
                            />
                          </Field>
                          {interestTitle && (
                            <p className="font-mono text-[0.75rem] text-ink-900/55">
                              {booking.interestLabel}: <span className="text-ink-900">{interestTitle}</span>
                            </p>
                          )}
                        </>
                      )}

                      {step === 1 && (
                        <>
                          <div className="grid gap-5 sm:grid-cols-2">
                            <Field label={booking.fields.name.label}>
                              <input name="name" required defaultValue={data.current.name} autoComplete="name" className={field} />
                            </Field>
                            <Field label={booking.fields.email.label}>
                              <input
                                name="email"
                                type="email"
                                required
                                defaultValue={data.current.email}
                                inputMode="email"
                                autoComplete="email"
                                placeholder={booking.fields.email.placeholder}
                                className={field}
                              />
                            </Field>
                          </div>
                          <Field label={booking.fields.company.label}>
                            <input
                              name="company"
                              defaultValue={data.current.company}
                              autoComplete="organization"
                              placeholder={booking.fields.company.placeholder}
                              className={field}
                            />
                          </Field>
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <div>
                            <span className="mb-3 block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-900/55">
                              What worries you most?
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {booking.worries.map((w) => {
                                const on = worries.includes(w);
                                return (
                                  <motion.button
                                    key={w}
                                    type="button"
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() =>
                                      setWorries((cur) => (on ? cur.filter((x) => x !== w) : [...cur, w]))
                                    }
                                    aria-pressed={on}
                                    className={`rounded-full border px-4 py-2 text-[0.875rem] transition-colors ${
                                      on
                                        ? "border-ink-900 bg-ink-900 text-vellum"
                                        : "border-ink-900/20 text-ink-900/75 hover:border-ink-900"
                                    }`}
                                  >
                                    {w}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                          <Field label={booking.fields.notes.label}>
                            <textarea
                              name="message"
                              rows={3}
                              defaultValue={data.current.message}
                              placeholder={booking.fields.notes.placeholder}
                              className={`${field} resize-none`}
                            />
                          </Field>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {status !== "sent" && (
                  <div className="mt-7 flex items-center justify-between gap-4 border-t border-ink-900/10 pt-5">
                    <div className="min-w-0">
                      <AnimatePresence>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            role="alert"
                            className="font-mono text-[0.75rem] text-ink-900"
                          >
                            {error}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {step > 0 && (
                        <button
                          type="button"
                          onClick={() => go(step - 1)}
                          className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-900/60 hover:text-ink-900"
                        >
                          {booking.back}
                        </button>
                      )}
                      {step < booking.steps.length - 1 ? (
                        <motion.button
                          key="next"
                          type="button"
                          onClick={(e) => {
                            // Keyed and defaulted off: React swaps this for the
                            // submit button in the same click, and without this
                            // the browser's default action would submit it.
                            e.preventDefault();
                            go(step + 1);
                          }}
                          whileTap={{ scale: 0.97 }}
                          className="group inline-flex items-center gap-3 rounded-full bg-ink-900 py-3 pl-6 pr-2 font-medium text-vellum"
                        >
                          {booking.next}
                          <span className="grid size-7 place-items-center rounded-full bg-vellum text-ink-900 transition-transform duration-300 group-hover:translate-x-0.5">
                            →
                          </span>
                        </motion.button>
                      ) : (
                        <motion.button
                          key="submit"
                          type="submit"
                          disabled={status === "sending"}
                          whileTap={{ scale: 0.97 }}
                          className="group inline-flex items-center gap-3 rounded-full bg-ink-900 py-3 pl-6 pr-2 font-medium text-vellum disabled:opacity-60"
                        >
                          {status === "sending" ? booking.submitting : booking.submit}
                          <span className="grid size-7 place-items-center rounded-full bg-vellum text-ink-900 transition-transform duration-300 group-hover:rotate-45">
                            ↗
                          </span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-900/55">
        {label}
      </span>
      {children}
      {hint && <span className="mt-2 block text-[0.75rem] leading-snug text-ink-900/50">{hint}</span>}
    </label>
  );
}
