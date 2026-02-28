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

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
fpath=(~/.zsh/completion $fpath)
autoload -Uz compinit && compinit -i
export FZF_DEFAULT_OPTS="--no-separator --border=rounded --color='bg:-1,fg+:4,gutter:-1' --bind 'ctrl-d:preview-half-page-down,ctrl-u:preview-half-page-up'"

alias tmux='tmux -f ~/github.com/venalen/personal/tmux.conf'
alias vim='nvim'

export EDITOR='nvim'
export BAT_THEME="catppuccin Macchiato"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# pnpm
export PNPM_HOME="/Users/vickyenalen/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end

# propel
awscheck() {
  if aws sts get-caller-identity > /dev/null 2>&1; then
    echo "✅ AWS is authenticated"
  else
    aws sso login
  fi
  echo "AWS authentication check complete."
}
alias proj='cd ~/github.com/propelinc'
#alias login_all='awscheck | login_docker'
alias login_all='awscheck; login_docker'
alias login_docker='aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 608965757603.dkr.ecr.us-west-2.amazonaws.com'
alias update_all='~/github.com/propelinc/budwood/update-all-backends'
alias start_app='login_all; cd ~/github.com/propelinc/budwood/; tilt up'
alias kd="kubectl --context=eks-development"
alias kg="kubectl --context=eks-global"
alias ks="kubectl --context=eks-staging"
alias kp="kubectl --context=eks-production"
alias kvd="kubectl --context=eks-vault-dev"
alias kvp="kubectl --context=eks-vault-prod"
alias kbd="kubectl --context=eks-brokerage-dev"
alias kbs="kubectl --context=eks-brokerage-staging"
alias kbp="kubectl --context=eks-brokerage-prod"
# Created by `pipx` on 2025-06-02 21:46:12
export PATH="$PATH:/Users/vickyenalen/.local/bin:$HOME/.local/bin"
eval "$(mise activate zsh)"
