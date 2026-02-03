#!/bin/bash

BASE_URL="http://localhost:8055"
EMAIL="admin@example.com"
PASSWORD="password"

# Login to get token
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $RESPONSE | sed -E 's/.*"access_token":"([^"]+)".*/\1/')

if [ -z "$TOKEN" ]; then
  echo "Login failed"
  echo $RESPONSE
  exit 1
fi

echo "Logged in successfully"

upload_and_update() {
  local FILE_PATH=$1
  local ATTR_ID=$2
  
  echo "Uploading $FILE_PATH..."
  UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/files" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$FILE_PATH")
    
  FILE_ID=$(echo $UPLOAD_RESPONSE | sed -E 's/.*"id":"([^"]+)".*/\1/')
  
  if [ -z "$FILE_ID" ]; then
    echo "Upload failed for $FILE_PATH"
    echo $UPLOAD_RESPONSE
    return
  fi
  
  echo "Uploaded file ID: $FILE_ID"
  
  echo "Updating attribute $ATTR_ID..."
  UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/items/attributes/$ATTR_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"icon\":\"$FILE_ID\"}")
    
  echo "Update result: $UPDATE_RESPONSE"
}

upload_and_update "/Users/kriko/.gemini/antigravity/scratch/product-manual/web/scripts/icon-attr-7.svg" 7
upload_and_update "/Users/kriko/.gemini/antigravity/scratch/product-manual/web/scripts/icon-attr-8.svg" 8

echo "Done"
