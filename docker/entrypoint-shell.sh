#!/bin/sh
set -eu
if [ -f /etc/nginx/csp-policy.txt ]; then
  policy=$(tr -d '\n' < /etc/nginx/csp-policy.txt | sed "s/'/'\"'\"'/g")
  printf "add_header Content-Security-Policy '%s' always;\n" "$policy" > /etc/nginx/csp.conf
else
  : > /etc/nginx/csp.conf
fi
exec nginx -g 'daemon off;'
