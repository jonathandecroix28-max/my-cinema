#!/bin/bash
if [ -n "$DATABASE_URL" ]; then
  echo "Initializing database..."
  psql $DATABASE_URL -f /var/www/html/script.sql
  echo "Database initialized!"
fi