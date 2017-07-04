" vim-plug automatically does filetype plugin indent on and syntax enable

" ========
" Plugins
" ========

" call vim-plug without prompts
silent! if plug#begin('~/.local/share/nvim/plugged')

" searching
Plug 'ctrlpvim/ctrlp.vim'
Plug 'rking/ag.vim'
Plug 'junegunn/fzf', { 'dir': '~/.fzf', 'do': './install --all' }
Plug 'hinshun/fzf.vim'

" movement
Plug 'lokaltog/vim-easymotion'

" buffers/status
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'

" language support
Plug 'fatih/vim-go', { 'do': ':GoInstallBinaries' }
Plug 'pangloss/vim-javascript'
Plug 'plasticboy/vim-markdown'
Plug 'honza/dockerfile.vim'
"Plug 'Shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }

" file tree
Plug 'scrooloose/nerdtree', { 'on': 'NERDTreeToggle' }

" git
Plug 'tpope/vim-fugitive'
Plug 'airblade/vim-gitgutter'
Plug 'junegunn/gv.vim'

" comments
Plug 'sudar/comments.vim'

" bracket matching
Plug 'jiangmiao/auto-pairs'

" colours
Plug 'chriskempson/vim-tomorrow-theme'

call plug#end()
endif

" ========
" General
" ========
set t_Co=256
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
" Highlight search pattern matches
set hlsearch
" Always show status line
set laststatus=2
" Don't show the --insert-- --visual-- etc footers
set noshowmode
" Enable unicode
set encoding=utf-8
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
silent! colorscheme Tomorrow-Night-Eighties
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
let g:mapleader = " "
let maplocalleader = " "
let g:maplocalleader = " "

" nerd tree remap
nmap <leader>kb :NERDTreeToggle<CR>

" split navigation
nmap <leader>h <C-w><C-h>
nmap <leader>l <C-w><C-l>
nmap <leader>j <C-w><C-j>
nmap <leader>k <C-w><C-k>

" fatih/go-vim
" Find declarations in file
nmap <leader>d :GoDecls<CR>
" Find declarations in directory
nmap <leader>s :GoDeclsDir<CR>
" Go to definition under cursor
nmap <leader>] :GoDef<CR>
" Go to previous definition
nmap <leader>[ :GoDefPop<CR>
" Location window next
nmap <leader>' :lnext<CR>
" Location window prev
nmap <leader>: :lprev<CR>
" Quickfix window next
nmap <leader>/ :cnext<CR>
" Quickfix window prev
nmap <leader>. :cprev<CR>
" Find all callers under cursor
nmap <leader>c :GoCallers<CR>

" tpope/vim-fugitive
nmap <leader>gs :GFiles?<CR>

" ag/silver searcher
"nnoremap <leader>ag :Ag --ignore-dir vendor -G go$<space>

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

" fatih/vim-go syntax highlighting
let g:go_highlight_types = 1
let g:go_highlight_fields = 1
let g:go_highlight_functions = 1
let g:go_highlight_methods = 1
let g:go_highlight_operators = 1
let g:go_highlight_build_constraints = 1
let g:go_fmt_command = "goimports"

" fzf search
map <leader><leader> :Files<CR>

" hinshun/fzf.vim
let FZF_DEFAULT_COMMAND='rg --files --no-ignore --hidden --follow --glob "!.git/*"'
let g:fzf_layout = { 'window': '-tabnew' }
"let g:fzf_layout = { 'down': '~40%' }

command! Plugs call fzf#run({
  \ 'source':  map(sort(keys(g:plugs)), 'g:plug_home."/".v:val'),
  \ 'options': '--delimiter / --nth -1',
  \ 'down':    '~40%',
  \ 'sink':    'Explore'})

" ctrlp
" set working path to nearest git ancestor
let g:ctrlp_working_path_mode = 'ra'
let g:ctrlp_cache_dir = $HOME . '/.cache/ctrlp'
if executable('ag')
  let g:ctrlp_user_command = 'ag %s -l --nocolor -g ""'
endif

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

