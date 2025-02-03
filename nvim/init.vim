" vim-plug automatically does filetype plugin indent on and syntax enable

" ========
" Plugins
" ========

" call vim-plug without prompts
silent! if plug#begin('~/.local/share/nvim/plugged')

" searching
Plug 'ctrlpvim/ctrlp.vim'
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
Plug 'junegunn/fzf.vim'
Plug 'jremmen/vim-ripgrep'

" text manipulation
Plug 'junegunn/vim-pseudocl'
Plug 'junegunn/vim-fnr'

" set paste
Plug 'ConradIrwin/vim-bracketed-paste'

" movement
Plug 'lokaltog/vim-easymotion'

" buffers/status
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'

" language support
Plug 'fatih/vim-go', { 'do': ':GoUpdateBinaries' }
Plug 'vim-syntastic/syntastic'
Plug 'pangloss/vim-javascript'
Plug 'plasticboy/vim-markdown'
Plug 'honza/dockerfile.vim'
Plug 'leafgarland/typescript-vim'
Plug 'ianks/vim-tsx'
Plug 'Quramy/tsuquyomi'
Plug 'Shougo/vimproc.vim', { 'do': 'make' }
Plug 'vim-ruby/vim-ruby' " support for running ruby
Plug 'nelstrom/vim-textobj-rubyblock' " selecting ruby blocks
Plug 'kana/vim-textobj-user' " needed for vim-textobj-rubyblock
Plug 'tpope/vim-endwise' " add end to structures, mainly ruby
Plug 'tpope/vim-rails'
Plug 'github/copilot.vim'
Plug 'autozimu/LanguageClient-neovim', {
    \ 'branch': 'next',
    \ 'do': 'bash install.sh',
    \ }
Plug 'neoclide/coc.nvim', {'branch': 'release'}

" file tree
Plug 'preservim/nerdtree'

" git
Plug 'tpope/vim-fugitive'
Plug 'airblade/vim-gitgutter'
Plug 'junegunn/gv.vim'

" comments
Plug 'sudar/comments.vim'

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

" send to black hole
vmap <leader>d "_d
nmap <leader>d "_d
nmap <leader>dd "_dd
nmap <leader>D "_D

" fatih/go-vim
" Find declarations in file
nmap <leader>a :GoDecls<CR>
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
"nmap <leader>c :GoCallers<CR>

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
syntax on
let g:go_highlight_types = 1
let g:go_highlight_fields = 1
let g:go_highlight_functions = 1
let g:go_highlight_methods = 1
let g:go_highlight_structs = 1
let g:go_highlight_operators = 1
let g:go_highlight_build_constraints = 1
let g:go_highlight_extra_types = 1
let g:go_fmt_command = "goimports"

" syntastic
let g:syntastic_always_populate_loc_list = 1
let g:syntastic_auto_loc_list = 1
let g:syntastic_check_on_open = 1
let g:syntastic_check_on_wq = 0
let g:syntastic_go_checkers = ['golint', 'govet']

" fzf search
map <leader><leader> :Files<CR>

"let FZF_DEFAULT_COMMAND='rg --files --no-ignore --hidden --follow --glob "!.git/*"'
let g:fzf_layout = { 'window': '-tabnew' }
let g:fzf_layout = { 'down': '~40%' }
"let g:fzf_colors =
"\ { 'gutter':      ['bg', 'Normal'] }

"command! Plugs call fzf#run({
"  \ 'source':  map(sort(keys(g:plugs)), 'g:plug_home."/".v:val'),
"  \ 'options': '--delimiter / --nth -1',
"  \ 'down':    '~40%',
"  \ 'sink':    'Explore'})

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

" fnr
nmap <Leader>r <Plug>(FNR%)
xmap <Leader>r <Plug>(FNR)

" gitgutter
let g:gitgutter_async=0
set signcolumn=auto

" show hidden files in NERDTree
let NERDTreeShowHidden=1

" navigates to matching tags
runtime macros/matchit.vim

" trim trailing whitespace on save
autocmd BufWritePre * %s/\s\+$//e

" ruby provider for vim
let g:ruby_host_prog = '~/.rbenv/versions/3.2.2/bin/neovim-ruby-host'

" autocompletion for ruby files
" currently does not work with my neovim setup because of lack of ruby
" compilation
"autocmd FileType ruby,eruby let g:rubycomplete_buffer_loading = 1
"autocmd FileType ruby,eruby let g:rubycomplete_classes_in_global = 1
"autocmd FileType ruby,eruby let g:rubycomplete_rails = 1

let g:LanguageClient_serverCommands = {
    \ 'rust': ['~/.cargo/bin/rustup', 'run', 'stable', 'rls'],
    \ 'javascript': ['/usr/local/bin/javascript-typescript-stdio'],
    \ 'javascript.jsx': ['tcp://127.0.0.1:2089'],
    \ 'python': ['/usr/local/bin/pyls'],
    \ 'ruby': ['~/.rbenv/shims/solargraph', 'stdio'],
    \ }
let g:LanguageClient_loggingLevel = "DEBUG"
let g:LanguageClient_loggingFile = expand('~/language_client.log')

" Or map each action separately
nmap <silent>K <Plug>(lcn-hover)
nmap <silent> gd <Plug>(lcn-definition)
nmap <silent> <F2> <Plug>(lcn-rename)

" for copilot
imap <silent><script><expr> <C-o> copilot#Accept("\<CR>")
let g:copilot_no_tab_map = v:true

" for coc.nvim
inoremap <silent><expr> <C-n> coc#pum#visible() ? coc#pum#confirm()
                              \: "\<C-g>u\<CR>\<c-r>=coc#on_enter()\<CR>"

" copy relative path of current file to clipboard
nmap <leader>cp :let @*=expand('%')<CR>
" copy relative path of current file for spec
nmap <leader>cs :let @*='bin/rspec ' . expand('%')<CR>
" copy github path of current file
" https://vi.stackexchange.com/questions/39786/expand-sometimes-gives-me-a-full-path
nmap <leader>cc :let @*='https://github.com/patch-technology/patch/tree/main/' . expand('%:.')<CR>
nmap <leader>cg :let @*='https://github.com/patch-technology/patch/commit/' . expand("<cword>")<CR>

let g:splitjoin_split_mapping = ''
let g:splitjoin_join_mapping = ''

nmap <leader>j :SplitjoinJoin<cr>
nmap <leader>s :SplitjoinSplit<cr>
