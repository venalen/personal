" Turn on automatic indentation
filetype plugin indent on

" Enable syntax highlighting
syntax enable

"==========
" Plugins
"==========

" call vim-plug without prompts
silent! if plug#begin('~/.vim/plugged')

" searching
Plug 'ctrlpvim/ctrlp.vim'
Plug 'rking/ag.vim'

" buffers/status
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'

" language support
Plug 'fatih/vim-go', { 'do': ':GoInstallBinaries' }
Plug 'pangloss/vim-javascript'
Plug 'plasticboy/vim-markdown'
Plug 'honza/dockerfile.vim'
Plug 'shougo/neocomplete.vim'

" file tree
Plug 'scrooloose/nerdtree', { 'on': 'NERDTreeToggle' }

" git
Plug 'tpope/vim-fugitive'
Plug 'airblade/vim-gitgutter'
Plug 'junegunn/gv.vim'

" bracket matching
Plug 'jiangmiao/auto-pairs'

" comments
Plug 'sudar/comments.vim'

call plug#end()
endif

"==========
" General
"==========

" Enable mouse movement
set mouse=a
" Enable 256 colors
set t_Co=256
set autowrite
" Turn on line numbers
set number
set autoindent
set updatetime=200
set nowrap
" Get access to clipboard
set clipboard=unnamed
" Set vsplit to create split on right
set splitright
" Set split to create split below
set splitbelow
" Highlight line cursor is on
set cursorline
" Minimum number of lines to have above and below cursor
set scrolloff=5
" Only break at breakat option
set linebreak
" Highlight search pattern matches
set hlsearch
set statusline+=%F

" Always show status line
set laststatus=2
" Enable unicode
set encoding=utf-8
set backspace=indent,eol,start

" Init colorscheme
silent! colorscheme Tomorrow-Night-Eighties 
let g:neocomplete#enable_at_startup = 1

" redraw screen to remove search highlighting
nnoremap <silent> <C-l> :nohl<CR><C-l>

" Change cursor shape between insert and normal mode in iTerm2.app
if $TERM_PROGRAM =~ "iTerm"
    let &t_SI = "\<Esc>]50;CursorShape=1\x7" " Vertical bar in insert mode
    let &t_EI = "\<Esc>]50;CursorShape=0\x7" " Block in normal mode
endif

"==========
" Leader
"==========

" map leader to space
let mapleader = " "
let g:mapleader = " "
let maplocalleader = " "
let g:maplocalleader = " "

" nerd tree remap
nnoremap <leader>kb :NERDTreeToggle<CR>

" split navigation
nnoremap <leader>h <C-w><C-h>
nnoremap <leader>l <C-w><C-l>
nnoremap <leader>j <C-w><C-j>
nnoremap <leader>k <C-w><C-k>

" fatih/go-vim
nmap <leader>d :GoDecls<CR>
nmap <leader>s :GoDeclsDir<CR>
nmap <leader>] :GoDef<CR>
nmap <leader>[ :GoDefPop<CR>
" modified def.vim to only show a 15 line split
au FileType go nmap <Leader>]] <Plug>(go-def-split)

" ag/silver searcher
nnoremap <Leader>ag :Ag<space>

" neocomplete
" tab for accepting autocomplete
inoremap <expr><Tab>        pumvisible() ? "\<C-n>" : "\<Tab>"

"================
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
nmap <leader>bq :bp <BAR> bd #<CR>
" List the buffers for navigation
nmap <leader>b :buffers<CR>:buffer<space>
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

" fatih/vim-go syntax highlighting
let g:go_highlight_types = 1
let g:go_highlight_fields = 1
let g:go_highlight_functions = 1
let g:go_highlight_methods = 1
let g:go_highlight_operators = 1
let g:go_highlight_build_constraints = 1
let g:go_fmt_command = "goimports"

" neocomplete
" Disable AutoComplPop.
let g:acp_enableAtStartup = 0
" Use neocomplete.
let g:neocomplete#enable_at_startup = 1
" Use smartcase.
let g:neocomplete#enable_smart_case = 1
" Set minimum syntax keyword length.
let g:neocomplete#sources#syntax#min_keyword_length = 3
" Disable preview
set completeopt-=preview

" ctrlp
" set working path to nearest git ancestor
let g:ctrlp_working_path_mode = 'ra'

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
