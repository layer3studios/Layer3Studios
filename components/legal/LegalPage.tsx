import Link from "next/link";
import { company, type LegalPage as LegalPageContent } from "@/brand";

/**
 * A sheet of paper for the three small pages.
 *
 * Same stock as the hero: white, a mono running head, the title set large in
 * the display face, then numbered sections with a hairline between each. No
 * nav island; a single line at the top takes you back. Server-rendered, no
 * client code at all, so these pages are the fastest thing on the site.
 */
export default function LegalPage({ page }: { page: LegalPageContent }) {
  return (
    <main className="paper min-h-[100svh] bg-vellum text-ink-900">
      <div
        className="mx-auto w-full max-w-4xl px-[var(--gutter)] pb-24 sm:px-[max(var(--gutter),3rem)]"
        style={{ paddingTop: "calc(var(--safe-top) + 2rem)" }}
      >
        {/* Running head. */}
        <header className="flex items-center justify-between gap-4 border-b border-ink-900 pb-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-900/60">
          <Link href="/" className="group inline-flex items-center gap-2 text-ink-900 transition-colors hover:text-ink-900/60">
            <span className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
            {company.name}
          </Link>
          <span className="hidden sm:inline">{page.eyebrow}</span>
          <span>Updated {page.updated}</span>
        </header>

        <h1
          className="font-display mt-14 max-w-3xl text-ink-900"
          style={{ fontSize: "clamp(2.4rem, 1.4rem + 4vw, 5rem)", lineHeight: 0.98, letterSpacing: "-0.02em" }}
        >
          {page.title}
        </h1>
        <p className="mt-7 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-900/70 sm:text-[1.125rem]">{page.intro}</p>

        <ol className="mt-16 border-t border-ink-900">
          {page.sections.map((s, i) => (
            <li key={s.heading} className="grid grid-cols-1 gap-x-10 gap-y-3 border-b border-ink-900/15 py-9 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-900/45">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="font-display mt-2 text-[1.5rem] leading-tight text-ink-900 sm:text-[1.7rem]">{s.heading}</h2>
              </div>
              <div className="space-y-4 sm:col-span-8">
                {s.body.map((p) =>
                  p.startsWith("• ") ? (
                    <p key={p} className="flex gap-3 text-[1rem] leading-relaxed text-ink-900/75">
                      <span aria-hidden="true" className="mt-[0.75em] block h-px w-4 shrink-0 bg-ink-900/40" />
                      <span>{p.slice(2)}</span>
                    </p>
                  ) : (
                    <p key={p} className="text-[1rem] leading-relaxed text-ink-900/75">
                      {p}
                    </p>
                  ),
                )}
              </div>
            </li>
          ))}
        </ol>

        <footer className="mt-12 flex flex-col gap-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-900/50 sm:flex-row sm:items-center sm:justify-between">
          <a href={`mailto:${company.email}`} className="text-ink-900 underline decoration-ink-900/30 underline-offset-[6px] hover:decoration-ink-900">
            {company.email}
          </a>
          <nav aria-label="Legal" className="flex gap-6">
            <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
            <Link href="/terms" className="hover:text-ink-900">Terms</Link>
            <Link href="/disclosure" className="hover:text-ink-900">Disclosure</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
