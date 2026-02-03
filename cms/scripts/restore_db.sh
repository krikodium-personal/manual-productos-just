#!/bin/bash
# Script to restore the database to a remote server
# Usage: ./restore_db.sh <CONNECTION_STRING>

CONNECTION_STRING=$1
DUMP_FILE="directus_dump.sql"

if [ -z "$CONNECTION_STRING" ]; then
  echo "Usage: ./restore_db.sh <CONNECTION_STRING>"
  echo "Example: ./restore_db.sh postgres://user:pass@host:port/dbname"
  exit 1
fi

if [ ! -f "$DUMP_FILE" ]; then
  echo "Error: Dump file $DUMP_FILE not found."
  exit 1
fi

echo "Restoring database to remote server..."
# Use docker to run psql if local psql is not available
docker run -i --rm postgres:13 psql "$CONNECTION_STRING" < $DUMP_FILE

if [ $? -eq 0 ]; then
  echo "✅ Database restored successfully!"
else
  echo "❌ Error restoring database."
fi
