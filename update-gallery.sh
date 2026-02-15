#!/bin/bash

# Base directory for images
BASE_DIR="public/assets/images"
GALLERY_FILE="src/components/Gallery.tsx"

# Function to get images from a subdirectory
get_images() {
  local dir="$1"
  if [ -d "$dir" ]; then
    ls "$dir" | grep -E '\.(jpg|jpeg|png|webp|gif|JPG|JPEG|PNG|WEBP|GIF)$'
  fi
}

# Get images for each day
IMAGES_D1=$(get_images "$BASE_DIR/day1")
IMAGES_D2=$(get_images "$BASE_DIR/day2")
IMAGES_D3=$(get_images "$BASE_DIR/day3")

# Format as JavaScript arrays
format_array() {
  local imgs="$1"
  local content=""
  for img in $imgs; do
    content="$content    \"$img\",\n"
  done
  echo "$content"
}

ARRAY_D1=$(format_array "$IMAGES_D1")
ARRAY_D2=$(format_array "$IMAGES_D2")
ARRAY_D3=$(format_array "$IMAGES_D3")

# Replace the arrays in Gallery.tsx
# We use a placeholder approach to keep the structure clean
sed -i "/const IMAGES_DAY1: string\[\] = \[/,/\];/c\const IMAGES_DAY1: string[] = [\n$ARRAY_D1  ];" $GALLERY_FILE
sed -i "/const IMAGES_DAY2: string\[\] = \[/,/\];/c\const IMAGES_DAY2: string[] = [\n$ARRAY_D2  ];" $GALLERY_FILE
sed -i "/const IMAGES_DAY3: string\[\] = \[/,/\];/c\const IMAGES_DAY3: string[] = [\n$ARRAY_D3  ];" $GALLERY_FILE

echo "Gallery updated!"
echo "Day 1: $(echo "$IMAGES_D1" | wc -w) images"
echo "Day 2: $(echo "$IMAGES_D2" | wc -w) images"
echo "Day 3: $(echo "$IMAGES_D3" | wc -w) images"
