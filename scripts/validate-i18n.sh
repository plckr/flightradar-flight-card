#!/bin/bash

# Script to validate i18n JSON files
# Checks that all language files don't have extra keys (compared to en.json)
# Warns if language files are missing keys from en.json
#
# Usage: ./validate-i18n.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LANGUAGES_DIR="$PROJECT_ROOT/src/localize/languages"
SOURCE_FILE="$LANGUAGES_DIR/en.json"

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed. Please install jq first."
    echo "  macOS: brew install jq"
    echo "  Linux: apt-get install jq or yum install jq"
    exit 1
fi

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "Error: Source file not found: $SOURCE_FILE"
    exit 1
fi

# Function to get all keys from a JSON file (flattened with dots for nested keys)
get_keys() {
    local file="$1"
    jq -r 'paths(scalars) as $p | $p | join(".")' "$file" | sort
}

# Function to check if a key exists in the source
key_exists_in_source() {
    local key="$1"
    echo "$SOURCE_KEYS" | grep -Fx "$key" > /dev/null
}

# Get all keys from the source file (en.json)
echo "Reading keys from source file: en.json"
SOURCE_KEYS=$(get_keys "$SOURCE_FILE")
SOURCE_KEY_COUNT=$(echo "$SOURCE_KEYS" | wc -l | tr -d ' ')
echo "Found $SOURCE_KEY_COUNT keys in en.json"
echo ""

# Track overall status
HAS_ERRORS=0

# Process each language file (except en.json)
for lang_file in "$LANGUAGES_DIR"/*.json; do
    # Skip the source file itself
    if [ "$(basename "$lang_file")" = "en.json" ]; then
        continue
    fi
    
    lang_name=$(basename "$lang_file")
    echo "Checking $lang_name..."
    
    # Get all keys from the language file
    LANG_KEYS=$(get_keys "$lang_file")
    LANG_KEY_COUNT=$(echo "$LANG_KEYS" | wc -l | tr -d ' ')
    
    # Check for extra keys (keys in lang file but not in source)
    EXTRA_KEYS=$(comm -23 <(echo "$LANG_KEYS") <(echo "$SOURCE_KEYS"))
    
    if [ -n "$EXTRA_KEYS" ]; then
        echo "  ❌ ERROR: Found extra keys in $lang_name that don't exist in en.json:"
        echo "$EXTRA_KEYS" | while read -r key; do
            echo "    - $key"
        done
        HAS_ERRORS=1
    fi
    
    # Check for missing keys (keys in source but not in lang file)
    MISSING_KEYS=$(comm -23 <(echo "$SOURCE_KEYS") <(echo "$LANG_KEYS"))
    
    if [ -n "$MISSING_KEYS" ]; then
        MISSING_COUNT=$(echo "$MISSING_KEYS" | wc -l | tr -d ' ')
        echo "  ⚠️  WARNING: Missing $MISSING_COUNT key(s) in $lang_name (present in en.json but not in $lang_name):"
        echo "$MISSING_KEYS" | while read -r key; do
            echo "    - $key"
        done
    else
        echo "  ✓ All keys from en.json are present in $lang_name"
    fi
    
    echo ""
done

# Exit with error status if any extra keys were found
if [ $HAS_ERRORS -eq 1 ]; then
    echo "❌ Validation failed: Some language files contain extra keys not present in en.json"
    exit 1
else
    echo "✓ Validation passed: No extra keys found in any language file"
    exit 0
fi
