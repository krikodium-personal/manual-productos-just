#!/bin/bash
# Script to dump the local Directus database
# Usage: ./dump_db.sh

CONTAINER_NAME="cms-database-1"
DB_USER="directus"
OUTPUT_FILE="directus_dump.sql"

echo "Dumping database from container $CONTAINER_NAME..."
docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER -c directus > $OUTPUT_FILE

if [ $? -eq 0 ]; then
  echo "✅ Database dumped successfully to $OUTPUT_FILE"
  echo "You can use this file to restore data to your cloud database."
else
  echo "❌ Error dumping database."
fi
