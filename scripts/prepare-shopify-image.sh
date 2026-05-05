#!/usr/bin/env bash
set -euo pipefail

if ! command -v magick >/dev/null 2>&1; then
  echo "Error: ImageMagick (magick) is required." >&2
  exit 1
fi

if [ "${1:-}" = "" ]; then
  cat <<'EOF'
Usage:
  scripts/prepare-shopify-image.sh <input_image> [output_image] [max_megapixels]

Examples:
  scripts/prepare-shopify-image.sh hero_deskop.webp
  scripts/prepare-shopify-image.sh hero_deskop.webp hero_desktop_shopify.webp 20

Notes:
  - Default max megapixels is 20 (conservative Shopify-safe target).
  - Image is only resized if it exceeds the megapixel limit.
EOF
  exit 1
fi

input="$1"
if [ ! -f "$input" ]; then
  echo "Error: input file not found: $input" >&2
  exit 1
fi

output="${2:-${input%.*}_shopify.${input##*.}}"
max_mp="${3:-20}"

read -r width height < <(magick identify -format '%w %h\n' "$input")
current_pixels=$(( width * height ))
max_pixels=$(awk -v mp="$max_mp" 'BEGIN { printf "%.0f", mp * 1000000 }')

current_mp=$(awk -v w="$width" -v h="$height" 'BEGIN { printf "%.2f", (w*h)/1000000 }')

if [ "$current_pixels" -le "$max_pixels" ]; then
  cp "$input" "$output"
  echo "No resize needed: ${width}x${height} (${current_mp} MP) <= ${max_mp} MP"
  echo "Wrote: $output"
  exit 0
fi

scale=$(awk -v p="$current_pixels" -v m="$max_pixels" 'BEGIN { printf "%.12f", sqrt(m/p) }')
new_w=$(awk -v w="$width" -v s="$scale" 'BEGIN { v=int(w*s); if (v<1) v=1; print v }')
new_h=$(awk -v h="$height" -v s="$scale" 'BEGIN { v=int(h*s); if (v<1) v=1; print v }')

magick "$input" -resize "${new_w}x${new_h}!" -strip -quality 88 "$output"

read -r out_w out_h < <(magick identify -format '%w %h\n' "$output")
out_mp=$(awk -v w="$out_w" -v h="$out_h" 'BEGIN { printf "%.2f", (w*h)/1000000 }')

echo "Input : ${width}x${height} (${current_mp} MP)"
echo "Output: ${out_w}x${out_h} (${out_mp} MP)"
echo "Wrote: $output"
