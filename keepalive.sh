#!/bin/bash
# Keep the SKILL SETU dev server alive (restart if port 3000 is down)
if ! curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000/ >/dev/null 2>&1; then
  pkill -f "next dev" 2>/dev/null
  sleep 1
  cd /home/z/my-project
  nohup setsid bun run dev > /home/z/my-project/dev.log 2>&1 < /dev/null &
  disown
  echo "$(date): restarted dev server" >> /home/z/my-project/keepalive.log
fi
