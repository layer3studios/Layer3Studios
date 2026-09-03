# layer3studios — Report template and pre-send checklist

Every free review report follows this shape. The published sample at `/report`
is this template filled in. Do not send a report that skips a section; write
"nothing found" instead. The reader is often not technical, so the top half is
for them and the bottom half is for whoever maintains the code.

Time box: one person, one sitting, two to three hours. Whatever fits in the box
is the scope. Depth beyond that is the paid audit, and the report should say so.

---

## 1. Head

- Review number (`L3-0001`, sequential).
- Repository name (or "anonymised" if the report may be shared).
- Read by: one person, named.
- Time spent, lines read, date sent, date the clone will be deleted.

## 2. Summary (plain language, three short paragraphs)

1. What the codebase is and its overall state, in one honest sentence.
2. The two or three things that matter most, and which of them is live now.
3. How big the fix is. Say "no rewrite needed" when it is true.

No jargon here. A founder should be able to forward this paragraph unchanged.

## 3. Fix first (three items, never more)

Numbered, one line each, severity shown. The order is the order to do them.

## 4. Findings

One block per finding, in severity order. Each block has, in this order:

| Field      | Rule                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| Ref        | `L3-0001-A`, letters in severity order.                                               |
| Severity   | critical / high / medium / low. Critical means exploitable now, without skill.        |
| Title      | A sentence, not a category. "A live payment key in git history", not "Secrets".       |
| Where      | `path/to/file.ts`, line number. For repo-wide findings, the count of files.           |
| Evidence   | One to four lines of the actual code. Secrets are shown redacted and never in full.   |
| Means      | What it lets someone do, in plain language. Say what we did not attempt and why.      |
| Fix        | Concrete. Name the function, the middleware, the config. Then "search for siblings".  |
| Effort     | A phrase: "about an hour", "an afternoon", "two days for the first split".            |
| How found  | One or two sentences. It shows the work and teaches the reader to find the next one.  |

Rules:

- Never paste a live secret in full, even in a private report. Redact the middle.
- Never guess. If a finding depends on runtime behaviour we did not observe, say so.
- Every finding gets a fix. A finding without a fix is a complaint.
- If nothing is found in a category, write the category with "nothing found" and what was checked.

## 5. What we read, and what we did not

Two lists. The first is what was actually covered (files, history, routes, the
lockfile, the import graph). The second is the honest limit: nothing run
against live systems, no active testing, one sitting. This section is what
makes a clean report worth something.

## 6. Custody

Four lines: access granted, read (where, how), report sent, deletion date.
The deletion date is a commitment; put it in the calendar when you send.

## 7. Sign-off

"Read by a person, not a scanner." Name, email. Offer the NDA if not already
signed. No pitch.

---

## Pre-send checklist

- [ ] Summary readable by a non-engineer in under a minute.
- [ ] Exactly three "fix first" items, in order.
- [ ] Every finding has where, evidence, means, fix, effort, how.
- [ ] No secret printed in full anywhere, including screenshots.
- [ ] Every path and line number re-checked against the current default branch.
- [ ] "What we did not do" section present, even for a clean report.
- [ ] Deletion date set and added to the calendar.
- [ ] Repository name removed if the client has not agreed to be named.
- [ ] Spell-checked, and read once aloud.
- [ ] Sent as a PDF and as plain text in the email body, so it survives forwarding.
