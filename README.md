# Endo Study

Offline study app for the endocrinology in-training exam (ESAP / ITE), built for a phone.
Target date default: **15 January 2027** (the real window runs mid-January to mid-February).

Open `index.html`. No build step, no internet needed to study; everything is stored in
the browser's localStorage on this device. Turn on **sync** once in More to keep a second
phone on the same progress (see below).

## The five tabs

- **Today** — exam countdown and streak, today's session (one button), then a single
  **Overview** card holding study plan, blueprint coverage, review load and the reading list as
  collapsed folds. Nothing else.
- **Study** — practice. Pick a section, pick a length, answer, then mark yourself Again / Hard /
  Good / Easy; the app schedules the card. The same screen holds **Your progress** (accuracy,
  by section, weakest questions, answers per day) in a fold, so there is no separate Stats tab.
  The timed mock gives 40 blueprint-weighted questions with a clock.
- **Questions** — all 144 in one searchable list: filter by section, due, new or flagged; open
  one to read the answer and explanation; flag, edit or delete.
- **Learn** — the reading list. Each card shows what the source is; the exact sections to read
  are in a **What to read** fold.
- **More** — exam date and daily limit, mock settings, sync, then collapsed folds for backup, lab
  reference, bank status, how the app works, and resets.

## App tour

`tour.html` is a two-minute tour that plays itself. A phone mock-up walks through the app —
Today, the study plan, Study, grading, the timed mock, Questions, Learn, More — with a typed
caption under each screen, a progress bar and chapter buttons for jumping. **Watch the app tour**
on Today and in **More → How this app works** opens it.

## One live copy for everyone

The app works with no connection, and it can also be **one shared board**: whoever opens the
link reads the last saved progress, and whatever they answer is written back within a few
seconds. There is no account and no key.

Tap **More → Shared live copy → Start the shared copy** once. The app creates the board and puts
its id in the address bar, so the URL you are on becomes the link to send. Paste that id into
`LIVE_STORE` at the top of `app.js` to make the bare site URL the shared board for everybody.

- **Last edit wins, per question** — a save overwrites the shared copy, but progress is merged so
  a count is never lost: the phone that took a card further owns its schedule, attempts and
  correct answers take the higher count, flags and reading ticks are combined.
- **Automatic** — it pulls when the app opens and whenever it comes back to the foreground, and
  pushes a couple of seconds after every change.
- **Offline-safe** — no connection only means it retries; the app keeps working and saves locally.
- **This device only** stops sharing on one device without touching the board.

## The question bank

**144 questions in two sets**, both filed to the eight blueprint sections and both verified:
no gaps, every question has five options and an answer key (More → Bank status shows the
counts live).

**Set 1 — ESAP 2026, all 120 questions** (`data/esap-01.js` … `esap-04.js`). Each item keeps the
case's decision-relevant facts, all five options and the correct answer (taken from the ESAP
answer key), plus a short teaching point summarising the ESAP discussion. The full discussion
and references stay in the book and can be pasted into a question's explanation with
**Questions → Edit**.

**Set 2 — 24 written questions** (`data/free-01.js`). Free sources do not publish question banks,
so these are original case vignettes written **to the ITE format and blueprint only** — five
options, one best answer, no ABIM board trivia — using the free guidelines in the Learn tab as
their source. Every one carries a **Read** reference to the ADA / ATA / ESE / AACE / Endotext
section it is built from, so a wrong answer sends her straight to the reading. They are numbered
`free-1` … `free-24` and are labelled "Written set" in the question view.

Ids are stable (`esap-<number>`, `free-<number>`), so scheduling survives updates, and a deleted
question stays deleted. The ten original sample questions are retired: dropped on load unless
already studied, and **Reset everything** reloads the 144.

*The paste importer has been removed. The JSON backup/restore remains for moving progress
between devices.*

## Study plan

Today shows a three-phase plan whose dates are computed from your exam date:

1. **Cover the bank** (~55% of the time left) — 10 new questions a day, 2-3 JCEM cases a week,
   one reading a week.
2. **Weak areas** (~30%) — only the sections scoring under 60% in Stats: the guideline, then the
   named Endotext chapter, then re-test.
3. **Mock season** (~15%) — one 40-question timed mock a week, reviewing every missed question.

Change the exam date in More and the phases move with it.

## Learn — the reading list

Ten sources, each tagged with the blueprint areas it covers and each saying three things:

- **What it is** — what the resource is, how long it is and who it is written for, so you can
  decide whether to read it at all.
- **Read** — the exact sections: section numbers, guideline titles, chapter names.
- **Time** — a realistic estimate for just those sections.

| What | Focus |
| --- | --- |
| ADA Standards of Care 2026 | Ten named sections — the diabetes reference |
| ATA guideline index | Pregnancy, DTC, hyperthyroidism, hypothyroidism, nodules |
| Endotext | One named chapter per missed question (bone, adrenal, pituitary, female, male) |
| ESE guideline directory | AI, adrenal incidentaloma, aggressive pituitary, PCOS, menopause, Klinefelter, male hypogonadism, hyponatraemia |
| AACE clinical guidance | 2026 T2D algorithm, diabetes technology, 2025 dyslipidaemia, obesity, adrenal incidentaloma, osteoporosis, acromegaly |
| Endocrine Society session library | 27 free guideline recordings — pick your weak sections |
| Zero To Finals | 14 named topics, first pass only |
| JCEM Case Reports | 2-3 cases a week, ESAP format |
| Geeky Medics quiz | One 23-question warm-up |
| Endocrine Board Review 2026 | Paid second bank, after the 120 here |

Reading is **not scheduled**. Tick **Mark done** when you have read the named sections; the tab
shows a progress bar and a **To do** filter, and the count appears on Today. Progress is saved
with the app and included in the backup.

Every URL was opened and checked. `endocrine.org` was returning HTTP 503 when this was built,
so the ITE page and the society's guideline hub are not linked; that material is reached through
`education.endocrine.org` and Endotext instead.

## Doing more questions than the daily cap

- Default is 10 new questions a day; Today shows how many are left.
- When the cap is used up, starting a session asks whether to keep going; **Ignore daily cap**
  on Study (or **Study more new cards** on Today) lifts it for the day.
- Every session summary offers **Study another session**, plus **Study missed again**.
- Mocks draw on the whole bank, so they always have questions.

## Tips for the run-up to January 2027

- At 10 new questions a day the 144 are covered in about 14 weeks, leaving time for repeats,
  weak-spot reading and mocks.
- One timed mock a month, then one a week in December; the ITE gives 4 hours for 90 questions,
  so 2.5 minutes per question is the right pace.
- **Flag** questions to reread; they appear on Today.
- **Export** before clearing the browser or wiping the phone. With sync on the cloud copy also
  survives, but an export is the one thing that survives everything.
- If a sync ever fails, **More → Sync across devices** shows the service's own message, and
  **Sync now** retries.

## Files

```
index.html          app shell, tab bar
styles.css          dark mobile-first styling
app.js              state, spaced repetition, views, plan, backup/restore
tour.html           self-playing app tour (two minutes)
tour.css            tour page styling
tour.js             tour timeline, captions and player controls
data/resources.js   the ten Learn entries
data/esap-01.js     ESAP 2026 questions 1-30
data/esap-02.js     ESAP 2026 questions 31-60
data/esap-03.js     ESAP 2026 questions 61-90
data/esap-04.js     ESAP 2026 questions 91-120
data/free-01.js     24 written ITE-style questions from the free guidelines
data/questions.js   10 original starter questions (retired once the bank is present)
```

## Note on content

ESAP is published by the Endocrine Society and is copyrighted. The bank here is a condensed
study rendition of the material for personal use; the full discussions and references are in
the book. Keep it to yourself and do not redistribute it.
