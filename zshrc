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

# GPG agent
GPG_TTY=$(tty)
export GPG_TTY
#GPG_AGENT_FILE="$HOME/.gpg-agent-info"
#function start_gpg_agent {
  #gpg-agent --daemon $GPG_AGENT_FILE
#}
#if which gpg-agent > /dev/null; then
  ## start agent if there's no agent file
  #if [ ! -f $GPG_AGENT_FILE ]; then
    #eval $( start_gpg_agent )
  #else
    ## check agent works
    #source $GPG_AGENT_FILE
    #SOCKET=$(echo "${GPG_AGENT_INFO}"  | cut -d : -f 1)
    ## check agent connection
    #if ( ! nc -U $SOCKET < /dev/null | grep -q "OK Pleased to meet you" ); then
      #eval $( start_gpg_agent )
    #fi
  #fi
  #export GPG_TTY=$(tty)
#fi

[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
fpath=(~/.zsh/completion $fpath)
autoload -Uz compinit && compinit -i
