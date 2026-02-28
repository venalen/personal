# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a personal dotfiles/config repository for macOS. It contains configuration files for the shell, editor, and multiplexer.

## Setup

Configs are symlinked rather than copied. The primary symlink pattern from the README:

```sh
ln -s ~/github.com/venalen/personal/zshrc ~/.zshrc
ln -s ~/github.com/venalen/personal/nvim/init.vim ~/.config/nvim/init.vim
```

Tmux is aliased to always load from this repo:
```sh
alias tmux='tmux -f ~/github.com/venalen/personal/tmux.conf'
```

## Files

| File | Purpose |
|------|---------|
| `zshrc` | Zsh config — uses [zprezto](https://github.com/sorin-ionescu/prezto) with the `pure` theme |
| `nvim/init.vim` | Neovim config — uses [vim-plug](https://github.com/junegunn/vim-plug) |
| `tmux.conf` | Tmux config — vi keys, mouse on, panes indexed from 1 |
| `gitconfig` | Git config — sets nvim as editor, defines `co/st/br` aliases |
| `Afterglow.itermcolors` | iTerm2 color scheme (importable via Preferences) |
| `propel_pod.yaml` | Kubernetes pod spec for work |

## Color Theme Stack

The color setup spans multiple tools:

- **Neovim colorscheme**: `base16-tomorrow-night-eighties` (via `chriskempson/base16-vim`)
- **tv.nvim preview**: `Catppuccin Macchiato` (overridden via `--preview-command` args in tv.nvim setup)
- **Television UI theme**: configured in `~/.config/television/config.toml`
- **BAT_THEME**: `Catppuccin Macchiato` in zshrc, `base16` in init.vim (only affects standalone bat, not tv previews)
- **Airline**: `bubblegum` theme

Television's built-in channels hardcode `BAT_THEME = "ansi"`, which is why tv.nvim overrides the preview command explicitly with `--theme='Catppuccin Macchiato'`.

## Keybindings

See [CHEATSHEET.md](CHEATSHEET.md) for the full list of keybindings (custom and useful built-ins).

## Neovim Key Conventions

Leader is `<Space>`. Easymotion uses `<Space>` as its prefix (so `<Space>w`, `<Space>b`, etc. trigger easymotion). Other leader mappings still work within `timeoutlen` (200ms).

Key patterns in `nvim/init.vim`:

- `<leader><leader>` — tv.nvim file search
- `<leader>t` — tv.nvim text search
- `<leader>kb` — NERDTree toggle
- `<leader>h/k/l` — split navigation (left/up/right)
- `<leader>j` — SplitjoinJoin, `<leader>s` — SplitjoinSplit
- `<leader>o/y` — next/previous buffer
- `<leader>q` — close buffer
- `<leader>x` — ALE fix
- `<leader>a` — jedi goto assignments, `<leader>]` — jedi goto definitions
- `<leader>r` — find and replace (FNR)
- `<leader>gd` — DiffviewOpen, `<leader>gm` — diff vs main, `<leader>gp` — PR review (merge-base), `<leader>gh` — file history, `<leader>gq` — close diffview
- `<leader>cp/cs/cc/cg` — copy path variants to clipboard
- `<leader>sv` — reload vimrc
- `<C-m>/<C-n>` — comment/uncomment line
- `<C-o>` — accept Copilot suggestion
- `<C-p>` — markdown preview toggle

## Smoke Tests (manual)

After making changes to `nvim/init.vim`, manually verify these in Neovim:

1. `<leader><leader>` opens tv.nvim file search — search for `CLAUDE.md` and confirm it opens
2. With a file open, `<leader>w` and `<leader>b` trigger easymotion word motions (forward/backward)
3. `<leader>kb` opens NERDTree — navigate to a file and press `<CR>` to confirm it opens

## Dependencies (brew)

`git`, `jq`, `fzf`, `nvim`, `tmux`, `reattach-to-user-namespace`, `television`, `bat`

Runtime tools loaded via `mise` (`eval "$(mise activate zsh)"` in zshrc) and `nvm`/`pnpm` for Node.

PostgreSQL tools (`dropdb`, `createdb`, `psql`, etc.) are not on PATH. Use the full path:

```sh
/opt/homebrew/opt/postgresql@16/bin/dropdb expense_tracker
/opt/homebrew/opt/postgresql@16/bin/createdb expense_tracker
```
