#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd "/Users/asaf/Documents/Claude code/hicenter-tasks"
exec npm run dev -- --port 5173
