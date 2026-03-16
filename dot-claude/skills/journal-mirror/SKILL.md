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
