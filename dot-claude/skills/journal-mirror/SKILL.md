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

**Monthly page reminder:** Before executing any command, check `journal-mirror/index.md`'s monthly checklist. If the current date is in a new month and the previous month's monthly page hasn't been captured, display:

> "Reminder: [previous month]'s monthly page hasn't been ingested yet. Want to send it?"

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
