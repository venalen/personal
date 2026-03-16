# Journal Mirror — Design Spec

A hybrid note-taking system that maintains a searchable digital mirror of handwritten bullet journal entries as local markdown files, managed through Claude Code CLI.

## Motivation

Vicky keeps a single physical bullet journal for everything — AI learning/research, personal life, wedding, etc. This is supported by cognitive science research on interleaving (mixing topics improves retention) and the commonplace book tradition. The journal-mirror skill creates a digital counterpart that makes those handwritten notes searchable, synthesizable, and accessible without replacing the physical workflow.

## Skill Definition

**Location:** `dot-claude/skills/journal-mirror/SKILL.md`

```yaml
name: journal-mirror
description: >
  Ingest handwritten journal pages, maintain a searchable digital mirror,
  and generate topic rollups. Triggers on mentions of "journal," "mirror,"
  "bullet journal," "journal pages," "rollup," or requests to ingest,
  search, or synthesize journal notes.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, AskUserQuestion
argument-hint: "[ingest | search <query> | synthesize <topic> | rollup | status]"
```

## Directory Layout

All data lives under `~/github.com/venalen/personal/journal-mirror/`.

```
journal-mirror/
├── entries/          # One .md per topic-chunk (structured)
├── raw/              # One .md per physical page (verbatim transcription)
├── syntheses/        # Consolidated reference docs by topic
├── rollups/          # Topic-organized reference docs (Drive-ready)
├── keywords.yml      # Alias map (canonical → variants)
└── index.md          # Journal tracking: names, page ranges, gaps, monthly checklist
```

**Git strategy:** `entries/`, `raw/`, `syntheses/`, and `rollups/` are gitignored (personal content). `keywords.yml` and `index.md` stay tracked (structural metadata).

## Journal Naming

Journals are named by type and sequential number scoped to that type:

- `Bear #1` — current journal
- `Bear #2` — a future second Bear journal
- `Moleskine #1` — a different journal type

If only one journal of a type exists, the number can be omitted in conversation (e.g., "Bear p.42" implies Bear #1).

**File naming convention:** Journal names are slugified and page numbers are zero-padded to 3 digits throughout. Examples: `bear-1_p042.md`, `moleskine-1_p007.md`. This convention applies consistently to both `entries/` and `raw/` filenames.

When starting a new journal, Vicky tells Claude and it increments the number and starts tracking pages from 1.

## Entry Types

### Daily Entries

Date-headed entries with structured bullets. These are the primary entry type and get segmented into topic-chunks during ingest.

### Monthly Entries

Standalone calendar/planner pages. Each monthly page contains:

- The month as a header with numbered days on the side
- A mini calendar at the bottom
- Circle bullets with names for birthdays (`○ Name`)
- Habit tracker: colored lines running alongside the days, with blue labels identifying what each color tracks (e.g., green = workouts, lavender = reading, coral = PT). Colors may change month to month — always read the labels.

Monthly pages are ingested once at month-end (Claude prompts for this). They are not reconciled against daily entries — they serve as standalone reference documents, searchable for events, birthdays, habit consistency, and scheduling patterns.

When ingesting a monthly page, Claude:
1. Identifies habit tracks and their labels
2. Counts days each habit was marked and identifies streaks
3. Asks for clarification on any unlabeled or unrecognized patterns
4. Writes a summary (e.g., "Workouts: 22/31 days, 8-day streak mid-month")

### Study Entries

Green-headered topic sections following the same bullet and color conventions as daily entries. After ingesting a study session, Claude asks: "I see study notes on [topic] — were there reference materials you used?" Links are stored in the entry frontmatter as a `references` field.

### Yearly Format

Vicky maintains a yearly format for seeding monthly pages. These are not ingested.

## Handwriting Conventions & Parsing

### Bullet Legend

| Symbol | Meaning | Context |
|--------|---------|---------|
| `-` | Thought | Indented = continuation of thought |
| `•` (dot) | Todo item | |
| `x` | Completed todo | |
| `>` | Deferred / in-progress todo | |
| `○` (circle) | Scheduled event (daily) or birthday (monthly, with name) | |

### Color Coding

| Color | Meaning |
|-------|---------|
| Green | Headers — dates, study topics |
| Blue | Primary content — thoughts, todos, labels |
| Red | Emphasis / branching ideas (usually with an arrow from original thought) |

Red-highlighted content is preserved in raw transcriptions with a marker: `**[red]** this thought` or `**[red →]** branching idea`.

### Special Content

- **Mementos, photos, doodles:** Best-effort text description in the raw transcription (e.g., `*[photo of concert ticket taped to page]*`). Not indexed as entries.
- **Diagrams:** Described in the entry summary and optionally recreated digitally (Mermaid, SVG, etc.) in a `## Diagram` section.

## File Formats

All filenames use the slugified journal name and zero-padded 3-digit page numbers (e.g., `bear-1_p042`). Monthly entries follow a separate naming pattern noted below.

### Structured Entry (`entries/YYYY-MM-DD_JOURNAL_pSTART-END_TOPIC.md`)

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

(only present if has_diagram: true)
```

### Raw Transcription (`raw/JOURNAL_pPAGE.md`)

One file per physical page. Page number is zero-padded (e.g., `raw/bear-1_p022.md`).

`page_complete` is authoritative on raw files only — structured entries do not carry this field since completeness is a property of the physical page, not the topic-chunk. During re-ingestion, only the raw file's `page_complete` flag is updated.

`date_written` is derived from the date header on the page. If a page has entries spanning multiple dates, use the first date. If no date is visible, Claude asks.

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

No segmentation, no summarization — verbatim transcription preserving bullet style and color annotations.

### Monthly Entry (`entries/YYYY-MM_JOURNAL_monthly.md`)

Monthly entries use a different naming pattern from daily/study entries — no day, no topic slug, just the month and a `monthly` suffix. Monthly pages also get raw transcriptions: if the monthly spread covers pages 1-2, both `raw/bear-1_p001.md` and `raw/bear-1_p002.md` are created (one per physical page, same as daily).

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

## Commands

**Confidence-gated clarification:** Across all commands, if Claude's confidence in a transcription, segmentation, keyword extraction, or interpretation is low, it asks a clarifying question rather than guessing. This applies to handwriting ambiguity, topic boundaries, keyword categorization, and search intent.

### `ingest`

Core workflow. Accepts one or more photos of journal pages.

**Steps:**
1. For each page: transcribe handwriting → save to `raw/JOURNAL_pPAGE.md`
2. If page was previously ingested: diff against existing raw file, flag changes
3. Segment into topic-chunks → create/update entry files in `entries/`
4. Update `keywords.yml` — new terms added freeform, periodically ask about merging variants
5. Update `index.md` — mark pages as ingested, detect and report gaps
6. Regenerate rollups for any topics touched in this session
7. Report summary: pages processed, entries created/updated, gaps detected, incomplete pages, rollups refreshed

**Gap detection (automatic, after every ingest):**
- Flag missing page ranges: "Bear #1 pages 14-15 haven't been captured yet"
- Flag incomplete pages: "Bear #1 p.22 was marked incomplete last time — want to re-send?"
- One mention per gap per session (not nagging)

**Re-ingestion:**
When a previously ingested page is re-sent:
1. Recognize page exists in `index.md`
2. Diff new transcription against existing raw file
3. Overwrite raw file with updated transcription
4. New topic-chunks → new entries; modified chunks → update existing entries
5. Report changes: "Bear #1 p.22 re-ingested — 1 new bullet added to study notes, todo section unchanged"
6. Update `page_complete` flag on the raw file if applicable

**Monthly prompts:**
At the end of each month, Claude prompts Vicky to send the final version of that month's page. Additionally, during any ingest session, Claude checks the monthly checklist in `index.md` for missed months — since photos can be batched and arrive out of order, a month-end-only check is insufficient. If a previous month's page hasn't been captured, Claude flags it (e.g., "February's monthly page hasn't been ingested yet — want to send it?").

**Study session handling:**
After ingesting study notes, Claude asks if there are reference materials used. Links are stored in the entry's `references` frontmatter field.

**Unrecognized patterns:**
If Claude encounters an unfamiliar bullet style, color, or notation pattern during ingest, it asks for clarification rather than guessing.

### `search <query>`

Search across entries by keyword, topic, date range, or free text. Returns matching entries ranked by relevance.

Examples:
- `/journal-mirror search transformers` — keyword search
- `/journal-mirror search topic:wedding date:2026-03` — filtered search
- `/journal-mirror search When did I last go to Tivoli?` — natural language, searches monthly and daily entries

Keywords resolve through `keywords.yml` aliases so variant terms match their canonical form.

### `synthesize <topic>`

Generate a consolidated reference doc for a topic, saved to `syntheses/TOPIC.md`. Pulls from all entries tagged with that topic or related keywords (via alias map).

**Default format:** Consolidated reference — distilled knowledge doc, like a mini wiki page.
**On request:** Timeline narrative — chronological summary of how thinking evolved.

### `rollup`

Manually trigger a full rollup regeneration across all topics. Normally happens automatically after ingest, but this forces a refresh.

**Rollup format** (`rollups/TOPIC.md`):

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

Topic-organized, consolidated. Drive push mechanism deferred — files are stored locally in `rollups/` and are ready to push when a mechanism is chosen.

### `status`

Reports:
- Total entries and pages ingested
- Page gaps and incomplete pages
- Last ingest date
- Keyword count and recent additions
- Stale syntheses (topics with new entries since last synthesis)
- Monthly page checklist (which months have been captured)

## Keyword Alias System

**File:** `keywords.yml`

```yaml
canonical:
  attention:
    - attention mechanisms
    - self-attention
    - attention heads
  transformers:
    - transformer architecture
    - transformer model
  wedding:
    - wedding planning
    - venue
```

**Behavior:**
- During ingest, keywords are extracted freeform from content
- New keywords are checked against existing canonical terms; obvious variants are silently added as aliases
- Ambiguous cases are surfaced periodically ("I've been using both 'attention' and 'attention mechanisms' — want me to merge these?") — not every ingest, just when drift accumulates
- Search and synthesis always resolve through canonical terms

## Index Tracking

**File:** `index.md`

Tracks journal metadata, ingested pages, and gaps:

```markdown
## Journals
- Bear #1: started 2026-03-16

## Bear #1
- Pages ingested: 1-13, 16-22
- Gaps: 14-15
- Last ingest: 2026-03-20

## Incomplete Pages
- Bear #1 p.22 (ingested 2026-03-20, marked incomplete)

## Monthly Checklist
- [ ] 2026-03
- [x] 2026-02
```

## Deferred

- **Google Drive push mechanism:** Rollup files are generated locally and are Drive-ready. The actual push to Google Drive (CLI tool, API, or manual) is deferred until available tooling is evaluated.
- **Claude Chat memory integration:** Lightweight index in Claude Chat memory pointing to Drive docs — deferred until Drive push is implemented.
- **Auto-regenerating syntheses:** Whether syntheses should auto-update when new related entries come in — start with on-demand only, revisit based on usage patterns.
