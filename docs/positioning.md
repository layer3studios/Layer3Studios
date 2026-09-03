# layer3studios — Positioning & Story

Working document. Messaging only — no UI decisions here.

## The one-line promise

> You already suspect something's wrong in your code.
> We'll tell you exactly what — for free — and you decide what happens next.

## Why this works

We lead by giving away the diagnosis. Trust isn't claimed, it's demonstrated in the
first interaction. Every competitor asks for a call before they tell you anything.
We tell you first, and never require a call at all.

## The ladder (this IS the story — not a service list)

1. Free Code Review    — we find it
2. Deep Security Audit — we prove it, in depth
3. Security Fixes      — we repair it
4. Custom Development  — we build the next one right

Each step is the client's choice. Never presented as a funnel.

## Audience: one front door, two paths

The hook is universal — everyone with code has this fear. The split happens
*after* the free report.

- Technical buyer (founder, CTO, agency): report speaks in findings, file paths,
  severity. Next step is the audit.
- Non-technical buyer (business owner with a site someone built): same report,
  plus a plain-language summary at the top — what it means, what it costs to
  ignore, what we'd do. Next step is fixes, not an audit.

Same product. The report carries the segmentation, so the front door stays simple.

## Tone

Calm expert. Credibility comes from precision of language.

- Write: "we check for hardcoded credentials in your git history, including
  deleted commits"
- Never write: "military-grade security", "hackers are targeting you"

No hoodie-and-matrix aesthetic. The people who pay for audits are repelled by
theater. Specific > dramatic. Never fear-monger; name the risk plainly and stop.

## Story beats

1. The uneasy truth — name the feeling, not the feature.
   "Your code shipped. Your secrets might have shipped too."
2. The free review as proof, not bait — exactly what we check, exactly how long
   it takes, explicitly no obligation and no call required. The generosity must
   be unconditional or it reads as a trap.
3. One real finding — a redacted screenshot of an actual exposed key, repo
   anonymized. Highest-converting asset we can build. One artifact beats ten
   paragraphs of claims.
4. The ladder — presented as choices, not steps in a pipeline.
5. Safety guarantees — stated plainly (see below).
6. Who we are — a small studio that reads code carefully. Small is an asset.
   Don't fake enterprise scale.

## Safety guarantees (our differentiator — most competitors skip this)

Security buyers need to feel safe *from us* before they trust us about anything
else. State on the record:

- Read-only access. We never write to your repo.
- We never touch production.
- Your code is deleted from our systems within N days. (DECIDE N — suggest 14.)
- NDA signed on request, before access.
- We never name you as a client without written permission.

## Free report — what's in it

Delivered as a written document by email. No call required, ever.
Turnaround: [DECIDE — suggest 3 business days].

1. Plain-language summary (3-4 sentences, readable by a non-developer)
2. Exposed secrets & API keys — including git history
3. Basic security leaks — exposed env files, open endpoints, missing validation,
   dependency CVEs
4. Structure — folder layout, separation of concerns, dead code
5. Duplication & reusability — repeated logic, copy-pasted blocks
6. Severity-ranked findings list
7. "What we'd do next" — the ladder, offered once, at the end, without pressure

Rule: the report must be genuinely useful even if they never pay us. If a
developer could fix everything in it themselves, we did it right. That's the
whole trust mechanism.

## Legal — non-negotiable

Paid audits (XSS, SQLi, recon) require a signed scope + written authorization
before touching anything. Protects us legally, and reads as professionalism to
the buyer. Build it into the paid tier from day one.

The free review is passive code reading only — no active testing against live
systems. Keep that line sharp; it's what makes "free" safe to give away.

## Open decisions

- [ ] Code retention window (N days)
- [ ] Free review turnaround time
- [ ] Repo size / language limits on the free tier
- [ ] Deep audit pricing (flat vs. scoped)
- [ ] Fixes: fixed-price per finding, or day rate
