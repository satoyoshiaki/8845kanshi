#!/bin/sh
set -eu

envsubst '${FRONTEND_PORT} ${BACKEND_PORT}' < /etc/nginx/templates/dashboard.conf.template > /etc/nginx/conf.d/default.conf
exec "$@"
