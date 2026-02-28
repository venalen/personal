# Neovim Cheatsheet

## Searching & Navigation

| Key | Action | Source |
|-----|--------|--------|
| `<Space><Space>` | File search (tv.nvim) | custom |
| `<Space>t` | Text/grep search (tv.nvim) | custom |
| `<Space>kb` | Toggle NERDTree file tree | custom |
| `<Space>r` | Find and replace in file | custom (FNR) |
| `/` | Search forward in file | built-in |
| `?` | Search backward in file | built-in |
| `n` / `N` | Next / previous search result | built-in |
| `*` / `#` | Search word under cursor forward / backward | built-in |
| `Ctrl-l` | Clear search highlighting | custom |

## Easymotion (prefix: `<Space>`)

| Key | Action |
|-----|--------|
| `<Space>w` | Jump forward by word |
| `<Space>b` | Jump backward by word |
| `<Space>f{char}` | Jump to character forward |
| `<Space>F{char}` | Jump to character backward |

## Splits & Windows

| Key | Action | Source |
|-----|--------|--------|
| `<Space>h` | Move to left split | custom |
| `<Space>k` | Move to upper split | custom |
| `<Space>l` | Move to right split | custom |
| `<Space>,` | Shrink vertical split | custom |
| `<Space>.` | Grow vertical split | custom |
| `<Space>-` | Shrink horizontal split | custom |
| `<Space>+` | Grow horizontal split | custom |
| `Ctrl-w v` | Vertical split | built-in |
| `Ctrl-w s` | Horizontal split | built-in |

## Buffers

| Key | Action | Source |
|-----|--------|--------|
| `<Space>o` | Next buffer | custom |
| `<Space>y` | Previous buffer | custom |
| `<Space>q` | Close buffer | custom |
| `<Space>T` | New empty buffer | custom |

## Editing

| Key | Action | Source |
|-----|--------|--------|
| `<Space>d` | Delete without yanking (normal + visual) | custom |
| `<Space>dd` | Delete line without yanking | custom |
| `<Space>D` | Delete to end without yanking | custom |
| `<Space>j` | Join lines (splitjoin) | custom |
| `<Space>s` | Split line (splitjoin) | custom |
| `Ctrl-m` | Comment line/selection | custom |
| `Ctrl-n` | Uncomment line/selection | custom |
| `Ctrl-o` | Accept Copilot suggestion (insert mode) | custom |
| `cs{old}{new}` | Change surrounding (e.g. `cs"'`, `cs'<q>`, `cst"`) | vim-surround |
| `ds{char}` | Delete surrounding (e.g. `ds"`, `dst` for tags) | vim-surround |
| `ys{motion}{char}` | Add surrounding (e.g. `ysiw"`, `ysiw)`, `yss"` for line) | vim-surround |
| `S{char}` | Surround selection (visual mode, e.g. `S"`, `S<div>`) | vim-surround |
| `)` `]` `}` | Closing bracket = no spaces inside | vim-surround |
| `(` `[` `{` | Opening bracket = spaces inside | vim-surround |

## Git

| Key | Action | Source |
|-----|--------|--------|
| `<Space>gd` | Open diff view | custom (diffview) |
| `<Space>gm` | Diff against main | custom (diffview) |
| `<Space>gh` | File history | custom (diffview) |
| `<Space>gH` | Full repo history | custom (diffview) |
| `<Space>gp` | PR review diff (branch changes only) | custom (diffview) |
| `<Space>gq` | Close diff view | custom (diffview) |
| `]c` / `[c` | Next / previous git hunk | gitgutter |

## Python (jedi-vim)

| Key | Action |
|-----|--------|
| `<Space>a` | Go to assignments |
| `<Space>]` | Go to definitions |
| `Ctrl-N` | Jedi completions |

## Linting & Formatting

| Key | Action |
|-----|--------|
| `<Space>x` | ALE fix |

## Clipboard & Paths

| Key | Action |
|-----|--------|
| `<Space>cp` | Copy relative file path |
| `<Space>cs` | Copy rspec command for file |
| `<Space>cc` | Open file on GitHub |
| `<Space>cg` | Open commit under cursor on GitHub |

## Misc

| Key | Action | Source |
|-----|--------|--------|
| `<Space>sv` | Reload vimrc | custom |
| `Ctrl-p` | Toggle markdown preview | custom |
| `u` | Undo | built-in |
| `Ctrl-r` | Redo | built-in |
| `.` | Repeat last command | built-in |
| `gg` / `G` | Go to top / bottom of file | built-in |
| `zz` | Center screen on cursor | built-in |
| `:%s/old/new/g` | Find and replace all | built-in |
