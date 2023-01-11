#
# Executes commands at the start of an interactive session.
#
# Authors:
#   Sorin Ionescu <sorin.ionescu@gmail.com>
#

# Source Prezto.
if [[ -s "${ZDOTDIR:-$HOME}/.zprezto/init.zsh" ]]; then
  source "${ZDOTDIR:-$HOME}/.zprezto/init.zsh"
fi

#if [ -f /Users/vicky.enalen/.clever_bash ]; then source /Users/vicky.enalen/.clever_bash; else echo "ERROR: Could not find /Users/vicky.enalen/.clever_bash"; fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
fpath=(~/.zsh/completion $fpath)
autoload -Uz compinit && compinit -i

alias vim=nvim
alias proj='cd $HOME/go/src/github.com/Clever'
#export GOROOT='/usr/local/go'
export GOPATH=$HOME/go
export AWS_PROFILE=main-engineer

# Base16 Shell https://github.com/chriskempson/base16-shell
BASE16_SHELL="$HOME/.config/base16-shell/"
[ -n "$PS1" ] && \
    [ -s "$BASE16_SHELL/profile_helper.sh" ] && \
        eval "$("$BASE16_SHELL/profile_helper.sh")"

# AWS
alias s2a='saml2aws login --skip-prompt && export AWS_PROFILE=main-engineer'
s2a

# Git
export GITHUB_API_TOKEN=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

# nvm
export NVM_DIR=~/.nvm
