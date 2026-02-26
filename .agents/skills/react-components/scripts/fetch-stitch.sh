#!/bin/bash

# Arguments: URL, Output Path
URL=$1
OUTPUT=$2

if [ -z "$URL" ] || [ -z "$OUTPUT" ]; then
    echo "Usage: bash fetch-stitch.sh <url> <output_path>"
    exit 1
fi

mkdir -p $(dirname "$OUTPUT")

# Use curl with follow-redirects and silent mode
curl -L -s "$URL" -o "$OUTPUT"

if [ $? -eq 0 ]; then
    echo "Successfully downloaded source to $OUTPUT"
else
    echo "Failed to download source"
    exit 1
fi
