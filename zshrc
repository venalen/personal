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
export FZF_DEFAULT_OPTS="--no-separator --border=rounded --color='bg:-1,fg+:4,gutter:-1' --bind 'ctrl-d:preview-half-page-down,ctrl-u:preview-half-page-up'"

alias vim='nvim'
alias vim-listen='nvim --listen /tmp/nvim_xray.pipe'
alias proj='cd $HOME/patch-technology/patch'
# clean up branches, get new bundles, get new node packages, restart spring, run migration
alias pu='git gc --prune=now && git remote prune origin && bundle install && yarn && spring stop && bin/rails db:migrate && bin/rails restart'
alias k8ss='export AWS_PROFILE=staging && make update-k8s-conf-staging'
alias k8sp='export AWS_PROFILE=production && make update-k8s-conf-production'
alias k8sconsole='kubectl exec -it -n patch $(kubectl get pod -n patch | grep rails | awk "{print $1}") -- rails console'
#export GOROOT='/usr/local/go'
export GOPATH=$HOME/go
#export AWS_PROFILE=main-engineer

export EDITOR='nvim'

# Base16 Shell https://github.com/chriskempson/base16-shell
BASE16_SHELL="$HOME/.config/base16-shell/"
[ -n "$PS1" ] && \
    [ -s "$BASE16_SHELL/profile_helper.sh" ] && \
        eval "$("$BASE16_SHELL/profile_helper.sh")"

# AWS
#alias s2a='saml2aws login --skip-prompt && export AWS_PROFILE=main-engineer'
#s2a

eval "$(rbenv init - zsh)"
eval "$(~/.rbenv/bin/rbenv init - zsh)"

# nvm
#export NVM_DIR=~/.nvm

# pyenv
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
eval export PATH="/Users/vickyenalen/.jenv/shims:${PATH}"
export JENV_SHELL=zsh
export JENV_LOADED=1
unset JAVA_HOME
unset JDK_HOME
source '/opt/homebrew/Cellar/jenv/0.5.7/libexec/libexec/../completions/jenv.zsh'
jenv rehash 2>/dev/null
jenv refresh-plugins
jenv() {
  type typeset &> /dev/null && typeset command
  command="$1"
  if [ "$#" -gt 0 ]; then
    shift
  fi

  case "$command" in
  enable-plugin|rehash|shell|shell-options)
    eval `jenv "sh-$command" "$@"`;;
  *)
    command jenv "$command" "$@";;
  esac
}
