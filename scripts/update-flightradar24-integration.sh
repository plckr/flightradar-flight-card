#!/bin/bash

# Script to download and install a release of home-assistant-flightradar24
# into .hass_dev/custom_components/flightradar24/
#
# Usage: ./update-flightradar24-integration.sh [version]
#   version: Optional. Specific version tag to install (e.g., v2.1.0)
#            If not provided, installs the latest release.

set -e

REPO="AlexandrErohin/home-assistant-flightradar24"
TARGET_DIR=".hass_dev/custom_components/flightradar24"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VERSION="${1:-}"

cd "$PROJECT_ROOT"

if [ -n "$VERSION" ]; then
    echo "Fetching release info for version $VERSION from GitHub..."
    RELEASE_INFO=$(curl -s "https://api.github.com/repos/${REPO}/releases/tags/${VERSION}")
    
    # Check if the release was found
    if echo "$RELEASE_INFO" | grep -q '"message": "Not Found"'; then
        echo "Error: Version $VERSION not found"
        exit 1
    fi
else
    echo "Fetching latest release info from GitHub..."
    RELEASE_INFO=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest")
fi

# Get the release download URL for the zip asset
TAG_NAME=$(echo "$RELEASE_INFO" | grep -o '"tag_name": *"[^"]*"' | head -1 | cut -d'"' -f4)
ZIPBALL_URL=$(echo "$RELEASE_INFO" | grep -o '"zipball_url": *"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$TAG_NAME" ] || [ -z "$ZIPBALL_URL" ]; then
    echo "Error: Could not fetch release information from GitHub"
    exit 1
fi

echo "Latest release: $TAG_NAME"

# Create temp directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo "Downloading release..."
curl -sL "$ZIPBALL_URL" -o "$TEMP_DIR/release.zip"

echo "Extracting..."
unzip -q "$TEMP_DIR/release.zip" -d "$TEMP_DIR"

# Find the extracted directory (GitHub adds a prefix)
EXTRACTED_DIR=$(find "$TEMP_DIR" -maxdepth 1 -type d -name "AlexandrErohin-*" | head -1)

if [ -z "$EXTRACTED_DIR" ]; then
    echo "Error: Could not find extracted directory"
    exit 1
fi

# Check if custom_components/flightradar24 exists in the release
SOURCE_DIR="$EXTRACTED_DIR/custom_components/flightradar24"

if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: custom_components/flightradar24 not found in release"
    exit 1
fi

# Remove existing installation if present
if [ -d "$TARGET_DIR" ]; then
    echo "Removing existing installation..."
    rm -rf "$TARGET_DIR"
fi

# Create target directory and copy files
echo "Installing to $TARGET_DIR..."
mkdir -p "$TARGET_DIR"
cp -r "$SOURCE_DIR"/* "$TARGET_DIR/"

echo "Done! Installed flightradar24 $TAG_NAME to $TARGET_DIR"
echo ""
echo "Files installed:"
ls -la "$TARGET_DIR"

