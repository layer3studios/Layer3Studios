# layer3studios — Site Copy (draft 1)

Words only. No layout, no UI decisions. Sections are in narrative order.
[BRACKETS] = you must decide or supply before this goes live.

---

## 1. Opening

**Headline**

> Your code shipped. Your secrets might have shipped too.

**Subhead**

> We read your codebase and tell you exactly what's exposed — leaked API keys,
> open endpoints, weak spots, and the structural mess that hides them.
> Free, in writing, in [3 business days]. No call required.

**Primary action:** Send us your repo

**Small, directly under it:** Read-only access. NDA on request. We delete your code after [14] days.

*Why:* the headline names the specific fear (secrets in a repo) instead of the
generic one (hackers). "No call required" is the differentiator and belongs
above the fold. The safety line sits under the button because that is the exact
moment hesitation happens.

---

## 2. The free review — what you actually get

**Heading:** What we check, for free

**Intro:** Not a scan. A person reads your code. Here's the full scope — this is
everything, there's no hidden tier of findings we hold back.

**Exposed secrets**
API keys, tokens, passwords and .env files committed to your repo — including
ones you deleted later, which are still sitting in your git history.

**Security leaks**
Publicly reachable endpoints that shouldn't be, missing input validation,
unprotected routes, and dependencies with known published vulnerabilities.

**Structure**
How your project is organised, whether concerns are separated, and where the
dead code is. Bad structure is where security problems hide.

**Duplication**
The same logic written four times in four places. It means four places to fix
when something breaks, and three that get forgotten.

**Closing line:** You get a written report. If your developer can fix everything
in it without hiring us, good — that's a fine outcome.

*Why:* naming git history specifically is the single most credible sentence on
the page; it's a thing amateurs miss and it proves you know the work. The
closing line is the trust mechanism. Do not soften it.

---

## 3. Proof

**Heading:** What this looks like in practice

- [REDACTED SCREENSHOT OF A REAL FINDING — anonymised repo, key blacked out]
- [One paragraph: what it was, how long it had been there, what it gave access
  to, how it got committed. Understated. No exclamation marks.]

**Sample report link:** See a full sample report → [link to a real redacted report]

**If you have no finding to show yet:** run the free review on 5 open-source
projects or friends' repos, with permission. One real anonymised example
unblocks this section and it is the highest-value thing you can build this week.

*Why:* one concrete artifact outperforms every claim. Established firms use
audit counts as proof; you don't have counts, so your proof is showing the
actual work product before anyone commits.

---

## 4. What happens after (the ladder)

**Heading:** Then it's your call

**Intro:** Most people take the report and fix things themselves. Some ask us to
go further. Both are fine.

**Deep security audit — [price]**
We stop reading and start testing. Cross-site scripting, injection,
authentication and session handling, access control, and reconnaissance on what
your infrastructure exposes publicly. You get a full report: every finding, how
we found it, what it lets an attacker do, and how to fix it. Scoped and
authorised in writing before we begin.

**We fix it — [price]**
You have the findings and no time. We do the repairs, in a branch you review,
with each fix explained so your team knows what changed and why.

**We build it — [price]**
Your next project, built the way we'd want to audit it. Exactly what you asked
for, with none of the problems we spend our days finding.

**Closing:** No retainers. No packages. Nothing starts without you asking for it.

*Why:* framed as their choice at every step. "Most people fix it themselves" is
a deliberate anti-sales line and it makes everything else believable.

---

## 5. How we handle your code

**Heading:** Before you hand over your codebase

**Intro:** You're being asked to give a stranger your source code. Here's exactly
what we do and don't do with it.

- Read-only access. We never push, never commit, never open a pull request
  unless you've hired us to.
- We never touch production. The free review is passive reading only — no
  testing against anything live, ever.
- Your code is deleted from our systems [14] days after we send the report. Ask
  and we'll delete it sooner.
- NDA signed before access, if you want one. Just ask.
- We never name you as a client, publish your findings, or use your logo
  without written permission.
- Active testing only happens in the paid audit, only in the scope you signed,
  and never before.

*Why:* nobody else writes this section. Someone handing over a codebase is more
afraid of you than of the vulnerability. Answering that fear out loud is worth
more than any credential you could claim.

---

## 6. Who we are

**Heading:** A small studio that reads code carefully

We're [N] people. We're not a scanning tool with a sales team, and we're not a
firm with a hundred auditors. Every review is read by a person who writes code
for a living.

Small means you talk to whoever did the work. It also means we take on a limited
number of reviews at a time — [N] a week — so if there's a wait, that's why.

*Why:* turn small into an asset. Scarcity here is honest, not a tactic, and it
explains turnaround time before it becomes a complaint.

---

## 7. Questions

**Why is this free?**
Because the fastest way to show you we're good at this is to be good at it, on
your actual code, before you've paid anything. Some people hire us afterwards.
Most don't, and that's the deal.

**What's the catch?**
You get a report. We don't call you. We email it, and if you want more you
reply. That's the whole thing.

**Do I need to be technical?**
No. Every report opens with a plain-language summary of what we found and what
it means. The technical detail is underneath it, for whoever maintains your code.

**Is my code safe with you?**
Read-only access, never touched in production, deleted after [14] days, NDA on
request. Full details above.

**What languages and stacks do you review?**
[DECIDE — be specific and honest. "Anything" reads as inexperience.]

**How big a repo can you review for free?**
[DECIDE — a stated limit protects you and reads as professional.]

**What if you don't find anything?**
We'll tell you that. A report saying "this is clean, here are three small
things" is a real result and you'll get it in writing.

**What do you need from me?**
A link to your repository and read access. Nothing else.

*Why:* "what's the catch" is the actual question in their head — answer it in
their words. "What if you find nothing" removes the quiet fear that a free audit
is guaranteed to manufacture problems in order to sell fixes.

---

## 8. Closing

**Heading:** Find out what's in there

Send us a link to your repo. You'll get a written report in [3 business days].
No call, no pitch, no obligation.

**Form fields, worded plainly**
- Your repository link
- Where should we send the report?
- Anything we should know? (optional)

**Button:** Send me my report

*Why:* field labels in plain words measurably reduce hesitation. Three fields
maximum — every extra field costs signups, and you can ask the rest by email
once they've already said yes.

---

## Voice rules

**Never write:** military-grade, bulletproof, hackers are targeting you,
bank-level security, 100% secure, cutting-edge, we leverage, industry-leading,
trusted by thousands (until true).

**Always:**
- Short sentences. Say the specific thing.
- Name the mechanism: "keys in deleted commits", not "deep scanning".
- State risk plainly once, then stop. Never twice, never with adjectives.
- Say what you don't do as readily as what you do.
- Never promise a number you can't defend.

**Test for any sentence:** could a competitor's marketing page say this exact
sentence? If yes, cut it or make it specific.
