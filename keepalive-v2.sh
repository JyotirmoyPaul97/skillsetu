#!/bin/bash
while true; do
  if ! pgrep -f 'next-server' >/dev/null 2>&1; then
    cd /home/z/my-project
    setsid env NODE_OPTIONS='--max-old-space-size=1024' node /home/z/my-project/node_modules/.bin/next dev -p 3000 --webpack > /home/z/my-project/dev.log 2>&1 < /dev/null &
    disown
    echo "$(date): restarted dev server" >> /home/z/my-project/keepalive.log
    sleep 10
  fi
  sleep 10
done
