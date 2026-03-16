# Journal Mirror Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Claude Code skill that ingests photos of handwritten bullet journal pages, maintains a searchable digital mirror as local markdown files, and generates topic-organized rollups.

**Architecture:** Single SKILL.md skill file with argument-based routing to five commands (ingest, search, synthesize, rollup, status). Data stored as flat markdown files with YAML frontmatter under `journal-mirror/` in the personal repo. A `keywords.yml` alias map and `index.md` tracker are the only version-controlled data files.

**Tech Stack:** Claude Code skill system (SKILL.md), markdown with YAML frontmatter, YAML for keyword aliases.

**Spec:** `docs/superpowers/specs/2026-03-16-journal-mirror-design.md`

**Note:** This project is entirely markdown/YAML — there is no application code to unit test. Verification is manual: invoke the skill, send test input, confirm output matches spec. Each task ends with a commit.

---

## Chunk 1: Scaffolding

### Task 1: Create directory structure and gitignore

**Files:**
- Create: `journal-mirror/entries/.gitkeep`
- Create: `journal-mirror/raw/.gitkeep`
- Create: `journal-mirror/syntheses/.gitkeep`
- Create: `journal-mirror/rollups/.gitkeep`
- Create: `journal-mirror/.gitignore`

- [ ] **Step 1: Create the journal-mirror directory tree**

```bash
mkdir -p journal-mirror/{entries,raw,syntheses,rollups}
```

- [ ] **Step 2: Add .gitkeep files so empty dirs are tracked**

```bash
touch journal-mirror/entries/.gitkeep
touch journal-mirror/raw/.gitkeep
touch journal-mirror/syntheses/.gitkeep
touch journal-mirror/rollups/.gitkeep
```

- [ ] **Step 3: Create .gitignore for data directories**

Write `journal-mirror/.gitignore`:

```gitignore
# Personal journal content — not version controlled
entries/*.md
raw/*.md
syntheses/*.md
rollups/*.md

# Keep the directories themselves
!.gitkeep
```

- [ ] **Step 4: Commit**

```bash
git add journal-mirror/
git commit -m "scaffold journal-mirror directory structure"
```

### Task 2: Create seed data files

**Files:**
- Create: `journal-mirror/keywords.yml`
- Create: `journal-mirror/index.md`

- [ ] **Step 1: Create empty keywords.yml**

Write `journal-mirror/keywords.yml`:

```yaml
# Keyword alias map — canonical terms with their variants
# Managed automatically during ingest; periodically reviewed with user
canonical: {}
```

- [ ] **Step 2: Create initial index.md**

Write `journal-mirror/index.md`:

```markdown
# Journal Mirror Index

## Journals

(No journals registered yet. Tell Claude "starting a new journal" to add one.)

## Incomplete Pages

(None)

## Monthly Checklist

(No months tracked yet)
```

- [ ] **Step 3: Commit**

```bash
git add journal-mirror/keywords.yml journal-mirror/index.md
git commit -m "add seed keyword alias map and index tracker"
```

---

## Chunk 2: SKILL.md — Frontmatter, Routing, and Data Files Reference

### Task 3: Create SKILL.md with frontmatter and argument routing

**Files:**
- Create: `dot-claude/skills/journal-mirror/SKILL.md`

This task creates the skill file with frontmatter, the overview, data file references, and the argument routing logic. Subsequent tasks will append each command section.

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p dot-claude/skills/journal-mirror
```

- [ ] **Step 2: Write SKILL.md with frontmatter, overview, and routing**

Write `dot-claude/skills/journal-mirror/SKILL.md`:

````markdown
---
name: journal-mirror
description: >
  Ingest handwritten journal pages, maintain a searchable digital mirror,
  and generate topic rollups. Triggers on mentions of "journal," "mirror,"
  "bullet journal," "journal pages," "rollup," or requests to ingest,
  search, or synthesize journal notes.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, AskUserQuestion
argument-hint: "[ingest | search <query> | synthesize <topic> | rollup | status]"
---

# Journal Mirror

Maintain a searchable digital mirror of Vicky's handwritten bullet journal as local markdown files.

## Data files

All data lives under `~/github.com/venalen/personal/journal-mirror/`.

| Path | Purpose |
|------|---------|
| `journal-mirror/entries/` | One `.md` per topic-chunk — structured summaries with YAML frontmatter |
| `journal-mirror/raw/` | One `.md` per physical page — verbatim transcription |
| `journal-mirror/syntheses/` | Consolidated reference docs by topic |
| `journal-mirror/rollups/` | Topic-organized reference docs (Drive-ready) |
| `journal-mirror/keywords.yml` | Alias map: canonical keyword → variant spellings |
| `journal-mirror/index.md` | Journal registry, page ranges, gaps, monthly checklist |

## Argument routing

Route based on `$ARGUMENTS`:

| Argument | Action |
|----------|--------|
| `ingest` (or no argument when photos are attached) | Run the **Ingest** workflow |
| `search <query>` | Run the **Search** workflow |
| `synthesize <topic>` | Run the **Synthesize** workflow |
| `rollup` | Run the **Rollup** workflow |
| `status` | Run the **Status** workflow |

If `$ARGUMENTS` is empty and no photos are attached, show a brief usage hint:

> Usage: `/journal-mirror [ingest | search <query> | synthesize <topic> | rollup | status]`
> Attach photos of journal pages to ingest them.
````

- [ ] **Step 3: Commit**

```bash
git add dot-claude/skills/journal-mirror/SKILL.md
git commit -m "add journal-mirror skill with frontmatter and routing"
```

---

## Chunk 3: SKILL.md — Handwriting Conventions and File Formats

### Task 4: Add handwriting conventions and file format reference

**Files:**
- Modify: `dot-claude/skills/journal-mirror/SKILL.md`

Append the handwriting parsing guide and file format templates to SKILL.md. These sections are referenced by the ingest command.

- [ ] **Step 1: Append handwriting conventions section**

Append to SKILL.md after the argument routing section:

````markdown

## Handwriting conventions

Vicky uses a bullet journal with consistent notation. Use this legend when transcribing.

### Bullet legend

| Symbol | Meaning | Context |
|--------|---------|---------|
| `-` | Thought | Indented `-` = continuation of thought |
| `•` (dot) | Todo item | |
| `x` | Completed todo | |
| `>` | Deferred / in-progress todo | |
| `○` (circle) | Scheduled event (daily) or birthday (monthly, with name) | |

### Color coding

| Color | Meaning | Transcription marker |
|-------|---------|---------------------|
| Green | Headers — dates, study topics | `**[green]** text` |
| Blue | Primary content — default, no marker needed | (unmarked) |
| Red | Emphasis / branching ideas (often with arrow from original) | `**[red]** text` or `**[red →]** text` |

### Special content

- **Mementos, photos, doodles:** Describe in the raw transcription as `*[photo of concert ticket taped to page]*` or similar. Do not create entries for these.
- **Diagrams:** Describe in the entry summary. Optionally recreate digitally (Mermaid, SVG) in a `## Diagram` section of the entry.
- **Unrecognized patterns:** If you encounter an unfamiliar bullet style, color, or notation, ask for clarification rather than guessing.

### Entry types

**Daily entries:** Date in green as header. Mix of thoughts (`-`), todos (`•`/`x`/`>`), and events (`○`). May contain multiple topics — segment into topic-chunks during ingest.

**Monthly entries:** Standalone calendar/planner page. Contains:
- Month header with numbered days on the side, mini calendar at bottom
- `○ Name` = birthday
- Habit tracker: colored lines alongside days with blue labels (e.g., green = workouts, lavender = reading, coral = PT). Colors change month to month — always read the labels.

**Study entries:** Green header with topic name. Same bullet/color conventions as daily. After ingesting, ask if there are reference materials.

**Yearly format:** Not ingested — used by Vicky to seed monthly pages.
````

- [ ] **Step 2: Append file format templates section**

Append to SKILL.md:

````markdown

## File formats

All filenames use slugified journal name and zero-padded 3-digit page numbers (e.g., `bear-1_p042`).

### Structured entry

**Path:** `journal-mirror/entries/YYYY-MM-DD_JOURNAL_pSTART-END_TOPIC.md`

Example: `entries/2026-03-16_bear-1_p022-022_attention-mechanisms.md`

```yaml
---
date: 2026-03-16
journal: bear-1
page_start: 22
page_end: 22
topic: attention-mechanisms
keywords:
  - transformers
  - attention
  - self-attention
has_diagram: false
references: []
---

## Summary

Notes on how self-attention works in transformer architectures...

## Diagram

(only present if has_diagram: true — Mermaid or SVG recreation + text description)
```

### Raw transcription

**Path:** `journal-mirror/raw/JOURNAL_pPAGE.md`

Example: `raw/bear-1_p022.md`

One file per physical page. `page_complete` is authoritative here only — structured entries do not carry this field. `date_written` comes from the date header on the page; if spanning multiple dates use the first; if no date visible, ask.

```yaml
---
journal: bear-1
page: 22
date_ingested: 2026-03-16
date_written: 2026-03-16
page_complete: true
---

**[green]** 3/16
- feeling good about the study session yesterday
  - especially the attention mechanism deep dive
- **[red →]** could this connect to the sparse attention paper?
• call dentist
x review PR #432
> finish rollup feature design

**[green]** Attention mechanisms
- self-attention: each token attends to all others...
```

### Monthly entry

**Path:** `journal-mirror/entries/YYYY-MM_JOURNAL_monthly.md`

Example: `entries/2026-03_bear-1_monthly.md`

Different naming pattern — no day, no topic slug. Monthly pages also get raw transcriptions (one per physical page, same as daily).

```yaml
---
date: 2026-03
journal: bear-1
page_start: 1
page_end: 2
type: monthly
---

## Calendar

(transcription of the monthly calendar layout)

## Birthdays
- 3/5: Alex
- 3/18: Mom

## Habit Tracking

| Habit | Color | Days | Streaks | Rate |
|-------|-------|------|---------|------|
| Workouts | green | 22/31 | 8-day (3/10-3/17) | 71% |
| Reading | lavender | 15/31 | 4-day (3/1-3/4) | 48% |
| PT exercises | coral | 28/31 | 12-day (3/15-3/26) | 90% |
```

### Rollup

**Path:** `journal-mirror/rollups/TOPIC.md`

Example: `rollups/attention-mechanisms.md`

```markdown
# Attention Mechanisms

*Last updated: 2026-03-20 | 8 entries | Bear #1 p.5, 12, 18, 22*

## Key concepts
- Self-attention: each token attends to all others...

## Open questions
- How does sparse attention scale?

## Related topics
- transformers, ML fundamentals
```

### Synthesis

**Path:** `journal-mirror/syntheses/TOPIC.md`

Same structure as rollup but more comprehensive — a consolidated reference doc (default) or timeline narrative (on request).
````

- [ ] **Step 3: Commit**

```bash
git add dot-claude/skills/journal-mirror/SKILL.md
git commit -m "add handwriting conventions and file format templates to journal-mirror skill"
```

---

## Chunk 4: SKILL.md — Ingest Command

### Task 5: Add the ingest command workflow

**Files:**
- Modify: `dot-claude/skills/journal-mirror/SKILL.md`

The ingest command is the most complex section — it covers transcription, segmentation, re-ingestion, gap detection, monthly prompts, and study session handling.

- [ ] **Step 1: Append the ingest command section**

Append to SKILL.md:

````markdown

## Ingest workflow

Triggered by `$ARGUMENTS` starting with `ingest`, or when photos are attached with no explicit command.

**Confidence-gated clarification:** Throughout this workflow, if your confidence in a transcription, segmentation, or keyword extraction is low, ask a clarifying question rather than guessing. This applies to handwriting ambiguity, topic boundaries, and keyword categorization.

### Step 1 — Identify pages

Look at the attached photo(s). For each photo:
1. Identify the journal (check `index.md` for registered journals; if unknown, ask which journal this is from)
2. Read the page number (usually visible at top or bottom of page)
3. Determine if this is a daily page, monthly page, or study notes

If no journal is registered yet, ask:
> "What's the name of this journal? (e.g., 'Bear', 'Moleskine')"

Then register it in `index.md` under `## Journals` with today's date and `#1` as the sequence number.

### Step 2 — Transcribe each page

For each physical page, create a raw transcription file at `journal-mirror/raw/JOURNAL_pPAGE.md`.

Follow the handwriting conventions section above for bullet and color notation. Preserve the original structure — do not summarize, reorganize, or clean up. Include:
- All bullet types with correct symbols
- Color markers for green and red text
- Indentation for continued thoughts
- Special content descriptions (mementos, doodles)

Set frontmatter fields:
- `journal`: slugified journal name (e.g., `bear-1`)
- `page`: page number (integer)
- `date_ingested`: today's date
- `date_written`: from the green date header on the page (ask if unclear)
- `page_complete`: `true` unless the writing clearly continues onto the next page or ends mid-thought — in that case set `false`

**If the page was previously ingested** (raw file already exists):
1. Read the existing raw file
2. Transcribe the new version
3. Diff them — identify what was added, changed, or removed
4. Overwrite the raw file with the new transcription
5. Note the changes for the report in Step 7

### Step 3 — Segment into topic-chunks

For each page, identify distinct topics. A new topic starts when:
- A new green header appears (date or study topic)
- The subject matter clearly shifts (e.g., from todos to journal reflection)
- There's a visual separator on the page

For each topic-chunk, create or update a structured entry at:
`journal-mirror/entries/YYYY-MM-DD_JOURNAL_pSTART-END_TOPIC.md`

Where:
- `YYYY-MM-DD` = the date written (from the page)
- `JOURNAL` = slugified journal name (e.g., `bear-1`)
- `pSTART-END` = zero-padded page range (e.g., `p022-022` for a single page, `p022-023` if it spans pages)
- `TOPIC` = slugified topic name (e.g., `attention-mechanisms`, `daily-todos`, `daily-reflection`)

Write a concise summary of the topic-chunk content. Include:
- Key points, decisions, and ideas
- Todo status (what's done, deferred, pending)
- Red-highlighted branching ideas — call these out specifically
- For diagrams: text description + optional Mermaid/SVG recreation

Set frontmatter: `date`, `journal`, `page_start`, `page_end`, `topic`, `keywords` (list), `has_diagram` (boolean), `references` (list, empty unless study entry).

**For monthly pages:** Create a single entry at `entries/YYYY-MM_JOURNAL_monthly.md` with `type: monthly` in frontmatter. Transcribe the calendar layout, extract birthdays, then process the habit tracker:
1. Identify each colored line and read its blue label to determine what it tracks
2. For each habit, count the number of days marked out of the month's total days
3. Identify streaks (consecutive days marked) — note the longest streak and its date range
4. Calculate completion rate as a percentage
5. Produce a per-habit summary (e.g., "Workouts: 22/31 days, 8-day streak 3/10-3/17, 71%")
6. Build the habit tracking table (see file formats section)
7. If any colored line has no label or you can't identify the habit, ask for clarification

**For study entries:** After creating the entry, ask:
> "I see study notes on [topic] — were there reference materials you used? (links, books, etc.)"

Store any provided links in the `references` frontmatter field.

**For re-ingested pages:** Compare new topic-chunks against existing entries for the same page range. Update modified entries, create new ones for new topics, and note changes.

### Step 4 — Update keywords

Read `journal-mirror/keywords.yml`. For each keyword extracted in Step 3:
1. Check if it matches an existing canonical term or any of its variants
2. If it's an obvious variant of an existing canonical (e.g., "attention mechanism" vs existing canonical "attention"), silently add it to that canonical's variant list
3. If it's a new term with no close match, add it as a new canonical with an empty variant list
4. If it's ambiguous, note it internally — do NOT ask about every ambiguous keyword. Instead, batch these and ask periodically (roughly every 5-10 ingest sessions, or when 3+ ambiguous terms have accumulated):
   > "I've been using these terms separately — should any be merged? [list terms]"

Write the updated `keywords.yml`.

### Step 5 — Update index

Read `journal-mirror/index.md`. Update:
1. Add newly ingested pages to the journal's page range
2. Recalculate gaps (missing page numbers within the range)
3. Update the `Last ingest` date
4. Update `## Incomplete Pages` — add pages marked `page_complete: false`, remove pages that were re-ingested as complete
5. Check `## Monthly Checklist`:
   - If any month that should have been captured by now is missing (based on the dates of entries ingested), flag it
   - Mark months as captured when their monthly entry exists

Write the updated `index.md`.

### Step 6 — Regenerate rollups

Identify all topics that were touched in this ingest session. For each:
1. Read all entries tagged with that topic (or related keywords via alias map)
2. Generate a consolidated rollup at `journal-mirror/rollups/TOPIC.md`
3. Include: key concepts, open questions, related topics, entry count, and page references

This overwrites any existing rollup for that topic.

### Step 7 — Report

Print a summary to the user:

```
## Ingest complete

**Pages processed:** Bear #1 p.22-24 (3 pages)
**Entries created:** 5 (attention-mechanisms, daily-todos, daily-reflection, wedding-venues, study-sparse-attention)
**Entries updated:** 1 (daily-todos on p.22 — 1 new bullet)
**Rollups refreshed:** attention-mechanisms, wedding
**Keywords added:** sparse-attention (new), venue (→ wedding alias)

### Gaps detected
- Bear #1 p.14-15 not yet captured

### Incomplete pages
- Bear #1 p.24 (writing continues to next page)

### Monthly check
- February's monthly page hasn't been ingested yet — want to send it?
```

Omit sections that have no content (e.g., skip "Gaps detected" if there are no gaps).

### End-of-month monthly page prompt

The spec calls for Claude to proactively prompt Vicky at the end of each month to send that month's final monthly page. Since Claude Code skills are invoked on-demand (no cron-like triggers), this prompt is delivered during any skill invocation — not just ingest. At the start of any `/journal-mirror` command, if the current date is in a new month and the previous month's monthly page hasn't been captured (per `index.md`'s monthly checklist), display:

> "Reminder: [previous month]'s monthly page hasn't been ingested yet. Want to send it?"

This is in addition to the ingest-time check in Step 5 which catches older missed months.
````

- [ ] **Step 2: Commit**

```bash
git add dot-claude/skills/journal-mirror/SKILL.md
git commit -m "add ingest workflow to journal-mirror skill"
```

---

## Chunk 5: SKILL.md — Search, Synthesize, Rollup, and Status Commands

### Task 6: Add search command

**Files:**
- Modify: `dot-claude/skills/journal-mirror/SKILL.md`

- [ ] **Step 1: Append the search command section**

Append to SKILL.md:

````markdown

## Search workflow

Triggered by `$ARGUMENTS` starting with `search`.

### Step 1 — Parse query

Extract the search intent from `$ARGUMENTS` after `search`. Support:
- **Keyword search:** `search transformers` — match against entry keywords, resolving through `keywords.yml` aliases
- **Filtered search:** `search topic:wedding date:2026-03` — filter by topic and/or date range
- **Natural language:** `search When did I last go to Tivoli?` — interpret intent, search across both daily and monthly entries

Read `journal-mirror/keywords.yml` to resolve any keyword aliases to their canonical form.

If the query is ambiguous, ask for clarification rather than guessing:
> "Did you mean [interpretation A] or [interpretation B]?"

### Step 2 — Search entries

Use Glob to find entry files in `journal-mirror/entries/`, then Grep or Read to match content.

For keyword/filtered searches:
1. Glob `journal-mirror/entries/*.md`
2. Filter by frontmatter fields (topic, keywords, date) and body content
3. Rank by relevance: exact keyword match > alias match > body text match

For natural language searches:
1. Identify the likely search targets (dates, events, topics, people)
2. Search both `entries/` and monthly entries for matches
3. For time-based questions ("when did I last..."), sort results by date descending

### Step 3 — Present results

Show matching entries as a concise list:

```
## Search results for "transformers"

1. **2026-03-16 — Attention Mechanisms** (Bear #1 p.22)
   Self-attention deep dive, connection to sparse attention research
   Keywords: transformers, attention, self-attention

2. **2026-03-10 — ML Study Notes** (Bear #1 p.15)
   Transformer architecture overview, encoder-decoder structure
   Keywords: transformers, encoder-decoder

3 entries found across 2 topics.
```

If no results found, suggest related keywords from the alias map.
````

- [ ] **Step 2: Commit**

```bash
git add dot-claude/skills/journal-mirror/SKILL.md
git commit -m "add search workflow to journal-mirror skill"
```

### Task 7: Add synthesize command

**Files:**
- Modify: `dot-claude/skills/journal-mirror/SKILL.md`

- [ ] **Step 1: Append the synthesize command section**

Append to SKILL.md:

````markdown

## Synthesize workflow

Triggered by `$ARGUMENTS` starting with `synthesize`.

### Step 1 — Identify topic

Extract the topic from `$ARGUMENTS` after `synthesize`. Resolve through `keywords.yml` to the canonical term. If no match found, search entries for close matches and suggest:
> "I don't have a canonical keyword for '[term]'. Did you mean one of these? [list]"

Check if the user requested timeline format (e.g., "synthesize transformers timeline" or "synthesize transformers as timeline"). Default is consolidated reference.

### Step 2 — Gather entries

1. Read `journal-mirror/keywords.yml` to get all aliases for the canonical term
2. Glob `journal-mirror/entries/*.md`
3. Collect all entries where the topic or any keyword matches the canonical term or its aliases
4. Sort by date

### Step 3 — Generate synthesis

**Consolidated reference (default):**

Write a distilled knowledge doc to `journal-mirror/syntheses/TOPIC.md`:

```markdown
# [Topic Name]

*Synthesized: YYYY-MM-DD | N entries | [journal] p.X, Y, Z*

## Overview
(2-3 sentence summary of what these notes cover)

## Key Concepts
- Bullet points distilling the core knowledge

## Decisions & Conclusions
- Any decisions made or conclusions reached in the notes

## Open Questions
- Unresolved questions or areas to explore further

## References
- Any reference materials linked in entries

## Source Entries
- [date — topic](relative path to entry) — one-line summary
```

**Timeline narrative (on request):**

Same file path, but structured chronologically:

```markdown
# [Topic Name] — Timeline

*Synthesized: YYYY-MM-DD | N entries | [journal] p.X, Y, Z*

## Timeline

### YYYY-MM-DD (p.X)
What was written and thought about on this date...

### YYYY-MM-DD (p.Y)
How thinking evolved, new connections made...

## Evolution
Brief narrative of how understanding changed over time.
```

### Step 4 — Report

```
Synthesis saved to journal-mirror/syntheses/[topic].md
Based on N entries from [date range].
```
````

- [ ] **Step 2: Commit**

```bash
git add dot-claude/skills/journal-mirror/SKILL.md
git commit -m "add synthesize workflow to journal-mirror skill"
```

### Task 8: Add rollup and status commands

**Files:**
- Modify: `dot-claude/skills/journal-mirror/SKILL.md`

- [ ] **Step 1: Append the rollup command section**

Append to SKILL.md:

````markdown

## Rollup workflow

Triggered by `$ARGUMENTS` starting with `rollup`.

This manually triggers a full rollup regeneration. (Rollups also regenerate automatically after each ingest session for touched topics.)

### Step 1 — Gather all topics

1. Glob `journal-mirror/entries/*.md`
2. Read frontmatter to collect all unique canonical topics
3. Resolve through `keywords.yml`

### Step 2 — Regenerate all rollups

For each canonical topic:
1. Collect all entries tagged with that topic or its aliases
2. Write/overwrite `journal-mirror/rollups/TOPIC.md` using the rollup format (see file formats section)

### Step 3 — Report

```
## Rollup complete

N rollups generated:
- attention-mechanisms (8 entries)
- wedding (5 entries)
- daily-reflection (12 entries)
...

Rollups saved to journal-mirror/rollups/
```
````

- [ ] **Step 2: Append the status command section**

Append to SKILL.md:

````markdown

## Status workflow

Triggered by `$ARGUMENTS` starting with `status`.

Read `journal-mirror/index.md`, `journal-mirror/keywords.yml`, and scan `journal-mirror/entries/` and `journal-mirror/syntheses/` to compile a status report.

### Report format

```
## Journal Mirror Status

### Journals
- Bear #1: started 2026-03-16, pages 1-22 ingested (20 pages, 2 gaps)

### Pages
- Total pages ingested: 20
- Gaps: Bear #1 p.14-15
- Incomplete pages: Bear #1 p.22
- Last ingest: 2026-03-20

### Entries
- Total entries: 35
- Topics: 12 unique canonical topics
- Most active: daily-reflection (12 entries), attention-mechanisms (8 entries)

### Keywords
- Canonical terms: 15
- Total variants: 28
- Recent additions: sparse-attention, venue

### Syntheses
- Up to date: 5
- Stale (new entries since last synthesis): attention-mechanisms (2 new entries), wedding (1 new entry)

### Monthly Checklist
- [x] 2026-02
- [ ] 2026-03 (not yet ingested)
```

Check for stale syntheses by comparing synthesis file modification dates against entry dates for each topic.
````

- [ ] **Step 3: Commit**

```bash
git add dot-claude/skills/journal-mirror/SKILL.md
git commit -m "add rollup and status workflows to journal-mirror skill"
```

---

## Chunk 6: Journal Naming and Smoke Test

### Task 9: Add journal naming reference to SKILL.md

**Files:**
- Modify: `dot-claude/skills/journal-mirror/SKILL.md`

- [ ] **Step 1: Append journal naming section**

Append to SKILL.md after the status workflow:

````markdown

## Journal naming

Journals are named by type and sequential number: `Bear #1`, `Moleskine #1`, etc. The number is scoped to the type — a second Bear journal becomes `Bear #2`.

**Slugified form for filenames:** lowercase, spaces to hyphens, number appended: `bear-1`, `moleskine-1`.

**Page numbers:** Zero-padded to 3 digits: `p001`, `p042`, `p100`.

When Vicky says she's starting a new journal:
1. Ask the journal name/type if not provided
2. Check `index.md` for existing journals of that type
3. Assign the next number
4. Add to `index.md` under `## Journals` with today's date
5. Start tracking pages from 1

If only one journal of a type exists, Vicky may omit the number in conversation (e.g., "Bear p.42" = Bear #1).
````

- [ ] **Step 2: Commit**

```bash
git add dot-claude/skills/journal-mirror/SKILL.md
git commit -m "add journal naming reference to journal-mirror skill"
```

### Task 10: Manual smoke test

No files created — this is a verification step.

- [ ] **Step 1: Verify skill is discoverable**

Run `/journal-mirror` with no arguments. Expected: usage hint showing the five commands.

- [ ] **Step 2: Test ingest with a real journal page**

Take a photo of a journal page and run `/journal-mirror ingest`. Verify:
- Raw transcription created in `raw/` with correct frontmatter and color markers
- Entry files created in `entries/` with correct naming, frontmatter, and summary
- `keywords.yml` updated with extracted keywords
- `index.md` updated with page range and journal registration
- Rollup generated for touched topics
- Summary report printed with all expected sections

- [ ] **Step 3: Test search**

Run `/journal-mirror search [keyword from ingested page]`. Verify results match.

- [ ] **Step 4: Test synthesize**

Run `/journal-mirror synthesize [topic from ingested page]`. Verify a synthesis file is created in `syntheses/` with the correct format.

- [ ] **Step 5: Test rollup**

Run `/journal-mirror rollup`. Verify rollup files are generated in `rollups/` for all topics.

- [ ] **Step 6: Test status**

Run `/journal-mirror status`. Verify report reflects the ingested data.

- [ ] **Step 7: Final commit if any adjustments were needed**

```bash
git add -A dot-claude/skills/journal-mirror/ journal-mirror/
git commit -m "journal-mirror skill: adjustments from smoke test"
```
