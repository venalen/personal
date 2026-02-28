" vim-plug automatically does filetype plugin indent on and syntax enable

" ========
" Plugins
" ========

" call vim-plug without prompts
silent! if plug#begin('~/.local/share/nvim/plugged')

" searching
Plug 'alexpasmantier/tv.nvim'

" text manipulation
Plug 'junegunn/vim-pseudocl'
Plug 'junegunn/vim-fnr'

" movement
Plug 'easymotion/vim-easymotion'

" buffers/status
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'

" language support
Plug 'pangloss/vim-javascript'
Plug 'plasticboy/vim-markdown'
Plug 'honza/dockerfile.vim'
Plug 'leafgarland/typescript-vim'
Plug 'github/copilot.vim'
Plug 'davidhalter/jedi-vim'
Plug 'dense-analysis/ale'
" file tree
Plug 'preservim/nerdtree'
" git
Plug 'tpope/vim-fugitive'
Plug 'airblade/vim-gitgutter'
Plug 'nvim-lua/plenary.nvim'
Plug 'sindrets/diffview.nvim'

" comments
Plug 'sudar/comments.vim'

" markdown
Plug 'iamcco/markdown-preview.nvim', { 'do': 'cd app && npx --yes yarn install' }

" bracket matching
Plug 'jiangmiao/auto-pairs'

" colours
Plug 'chriskempson/base16-vim'

Plug 'tpope/vim-surround'
Plug 'AndrewRadev/splitjoin.vim'

call plug#end()
endif

" ========
" General
" ========
" Set line numbers
set number
" Line will wrap
set wrap
" Auto save when switching buffers
set autowrite
" Get access to clipboard
set clipboard=unnamed
" Set vsplit to create split on right
set splitright
" Set split to create split below
set splitbelow
" Highlight line cursor is on
set cursorline
" Highlight vertical line cursor is on
set cursorcolumn
" Highlight search pattern matches
set hlsearch
" Always show status line
set laststatus=2
" Don't show the --insert-- --visual-- etc footers
set noshowmode
" Enable unicode
"set encoding=utf-8
set backspace=indent,eol,start
" Redraw screen to remove search highlighting
nnoremap <silent> <C-l> :nohl<CR><C-l>
" No backups
set nobackup
set nowritebackup
set noswapfile
" set minimum number of lines below the cursor
set scrolloff=5
" colours theme!
set termguicolors
silent! colorscheme base16-tomorrow-night-eighties
" diff colours (github-inspired, subtle for dark background)
highlight DiffAdd     guibg=#1a2e1a guifg=NONE
highlight DiffDelete  guibg=#2e1a1a guifg=#5c3030
highlight DiffChange  guibg=#1a2a3a guifg=NONE
highlight DiffText    guibg=#2a4060 guifg=NONE
" lower the delay of escaping out of other modes
set timeoutlen=200

" Combination of the setting below prevents the weird duplicate
" lines caused by the conflict between colorscheme and vim-airline
" length of time after you stop typing before it triggers the plugin
set updatetime=700
" don't update screen during macro/script execution
set lazyredraw


" ========
" Leader
" ========

" map leader to space
let mapleader = " "
let maplocalleader = " "

" nerd tree remap
nmap <leader>kb :NERDTreeToggle<CR>

" split navigation
nmap <leader>h <C-w><C-h>
nmap <leader>l <C-w><C-l>
nmap <leader>k <C-w><C-k>

" send to black hole
vmap <leader>d "_d
nmap <leader>d "_d
nmap <leader>dd "_dd
nmap <leader>D "_D

" jedi-vim
" Find declarations in file
" Go to definition under cursor
let g:jedi#completions_command = "<C-N>"
let g:jedi#rename_command = ""
nmap <silent> <leader>a :call jedi#goto_assignments()<CR>
nmap <silent> <leader>] :call jedi#goto_definitions()<CR>
" Go to previous definition
"nmap <leader>[ :jedi#goto_definitions<CR>

" ===============
" Buffer Movement
" ===============

" Allow changing buffer even if you haven't saved
set hidden
" To open a new empty buffer
nmap <leader>T :enew<cr>
" Move to the next buffer
nmap <leader>o :bnext<CR>
" Move to the previous buffer
nmap <leader>y :bprevious<CR>
" Close the current buffer and move to the previous one
nmap <leader>q :bp <BAR> bd #<CR>
" List the buffers for navigation !!conflicts with easymotion
"nmap <leader>b :buffers<CR>:buffer<space>
" Reduce vertical split size
nmap <leader>, :vertical resize -5<CR>
" Increase vertical split size
nmap <leader>. :vertical resize +5<CR>
" Reduce horizontal split size
nmap <leader>- :res -5<CR>
" Increase horizontal split size
nmap <leader>+ :res +5<CR>

"================
" Plugin Settings
"================

" Enable the list of buffers
let g:airline#extensions#tabline#enabled = 1
" Show just the filename
let g:airline#extensions#tabline#fnamemod = ':t'
" Colour theme for airline
let g:airline_theme='bubblegum'

syntax on

"python3 provider
let g:python3_host_prog = '/opt/homebrew/bin/python3'


let $BAT_THEME = "base16"

" tv.nvim
lua << EOF
local h = require("tv").handlers
local tv = require("tv")
tv.setup({
  channels = {
    files = {
      keybinding = "<leader><leader>",
      args = { "--no-remote", "--no-status-bar", "--preview-command", "bat -n --color=always --theme='Catppuccin Macchiato' '{}'" },
      handlers = {
        ["<CR>"] = h.open_as_files,
        ["<C-s>"] = h.open_in_split,
        ["<C-v>"] = h.open_in_vsplit,
        ["<C-y>"] = h.copy_to_clipboard,
        ["<C-q>"] = h.send_to_quickfix,
      },
    },
    text = {
      keybinding = "<leader>t",
      args = { "--no-remote", "--no-status-bar", "--preview-command", "bat -n --color=always --theme='Catppuccin Macchiato' '{strip_ansi|split:\\::0}'" },
      handlers = {
        ["<CR>"] = h.open_at_line,
        ["<C-s>"] = h.open_in_split,
        ["<C-v>"] = h.open_in_vsplit,
        ["<C-y>"] = h.copy_to_clipboard,
        ["<C-q>"] = h.send_to_quickfix,
      },
    },
  },
})
EOF

" comments
let g:comments_map_keys = 0
" key-mappings for comment line in normal mode
noremap  <silent> <C-m> :call CommentLine()<CR>
" key-mappings for range comment lines in visual <Shift-V> mode
vnoremap <silent> <C-m> :call RangeCommentLine()<CR>
" key-mappings for un-comment line in normal mode
noremap  <silent> <C-n> :call UnCommentLine()<CR>
" key-mappings for range un-comment lines in visual <Shift-V> mode
vnoremap <silent> <C-n> :call RangeUnCommentLine()<CR>

" easymotion
map <leader> <Plug>(easymotion-prefix)
hi link EasyMotionShade  Comment

" fnr
nmap <Leader>r <Plug>(FNR%)
xmap <Leader>r <Plug>(FNR)

" diffview
lua << DIFFEOF
local actions = require("diffview.actions")
require("diffview").setup({
  use_icons = false,
  keymaps = {
    view = {
      { "n", "<leader>b", false },
    },
    file_panel = {
      { "n", "<leader>b", false },
    },
    file_history_panel = {
      { "n", "<leader>b", false },
    },
  },
})
DIFFEOF
nmap <leader>gd :DiffviewOpen<CR>
nmap <leader>gm :DiffviewOpen main<CR>
nmap <leader>gh :DiffviewFileHistory %<CR>
nmap <leader>gH :DiffviewFileHistory<CR>
nmap <leader>gp :DiffviewOpen main...HEAD<CR>
nmap <leader>gq :DiffviewClose<CR>

" gitgutter
let g:gitgutter_async=0
set signcolumn=auto

" show hidden files in NERDTree
let NERDTreeShowHidden=1

" navigates to matching tags
runtime macros/matchit.vim

" trim trailing whitespace on save
autocmd BufWritePre * %s/\s\+$//e

" ale autoformatting support
let g:ale_linters_explicit = 1
let g:ale_fixers = {
\   '*': ['remove_trailing_lines', 'trim_whitespace'],
\   'python': ['autoimport', 'ruff', 'ruff_format', 'pycln'],
\}
nmap <leader>x <Plug>(ale_fix)
"let g:ale_lint_on_save = 1
"let g:ale_lint_on_text_changed = 'always'


" for copilot
imap <silent><script><expr> <C-o> copilot#Accept("\<CR>")
let g:copilot_no_tab_map = v:true

" copy relative path of current file to clipboard
nmap <leader>cp :let @*=expand('%')<CR>
" copy relative path of current file for spec
nmap <leader>cs :let @*='bin/rspec ' . expand('%')<CR>
" copy github path of current file
" https://vi.stackexchange.com/questions/39786/expand-sometimes-gives-me-a-full-path
nnoremap <leader>cc :silent! call system('open https://' . substitute(join(split(substitute(system("git rev-parse --show-toplevel"), '\n\\+$', '', ''), '/')[2:], '/') . '/tree/main/' . expand('%:.'), '[^[:print:]]', '', ''))<CR>
nnoremap <leader>cg :silent! call system('open https://' . substitute(join(split(substitute(system("git rev-parse --show-toplevel"), '\n\\+$', '', ''), '/')[2:], '/') . '/commit/' . expand('<cword>'), '[^[:print:]]', '', ''))<CR>

let g:splitjoin_split_mapping = ''
let g:splitjoin_join_mapping = ''

nmap <leader>j :SplitjoinJoin<cr>
nmap <leader>s :SplitjoinSplit<cr>

:set colorcolumn=79,100
highlight ColorColumn guibg=#1c1c1c

nnoremap <leader>sv :source $MYVIMRC<CR>

command! SC vnew
        \ | setlocal bufhidden=wipe buftype=nofile nobuflisted noswapfile
        \ | nnoremap <buffer> ,<CR> :silent %source<CR>

" markdown preview
nmap <C-p> <Plug>MarkdownPreviewToggle
