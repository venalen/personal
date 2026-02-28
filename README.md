# personal

Config/rc files for alacritty, tmux, (n)vim, zsh

1. Install homebrew
2. brew install:
- git
- jq
- the_silver_searcher
- fzf
- nvim
- tmux
- reattach-to-user-namespace
3. Settings > Profiles > Keys. Set left/right option key to Esc+
  - set default text size to 25
4. mkdir github.com; cd github.com; git clone https://github.com/venalen/personal.git
5. Import Afterglow.itermcolors to iterm
6. symlink zshrc: ln -s ~/github.com/venalen/personal/zshrc ~/.zshrc
7. zprezto for zsh things: https://github.com/sorin-ionescu/prezto
8. PlugInstall for vim things: https://github.com/junegunn/vim-plug
	- ln -s ~/github.com/venalen/personal/nvim/init.vim ~/.config/nvim/init.vim
9. Update zpreztorc:
	zstyle ':prezto:load' pmodule \
  'environment' \
  'terminal' \
  'editor' \
  'history' \
  'directory' \
  'spectrum' \
  'utility' \
  'completion' \
  'history-substring-search' \
  'git' \
  'prompt'

  theme 'pure'

  zstyle ':prezto:module:prompt' pwd-length 'long'

  zstyle ':prezto:module:prompt' show-return-val 'yes' #uncomment

10. Codi settings: had to override bin to python3
