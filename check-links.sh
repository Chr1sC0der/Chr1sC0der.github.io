#!/usr/bin/env bash
# Fails if any href in an HTML file points to a local file that doesn't exist.
# Usage: ./check-links.sh [dir]   (default: current directory)

root="$(cd "${1:-.}" && pwd)"
broken=0
checked=0

while IFS= read -r file; do
  # Print "line<TAB>href" for every href attribute
  while IFS=$'\t' read -r lineno href; do
    # Skip empty, same-page anchors, protocol-relative, and external schemes (http:, mailto:, ...)
    [[ -z "$href" || "$href" == \#* || "$href" == //* || "$href" =~ ^[a-zA-Z][a-zA-Z0-9+.-]*: ]] && continue
    clean="${href%%#*}"; clean="${clean%%\?*}"
    if [[ "$clean" == /* ]]; then target="$root$clean"; else target="$(dirname "$file")/$clean"; fi
    checked=$((checked + 1))
    if [[ -d "$target" ]]; then
      [[ -f "$target/index.html" ]] && continue
      echo "  ${file#$root/}:$lineno  href=\"$href\"  ->  directory has no index.html" >&2
      broken=$((broken + 1))
    elif [[ ! -e "$target" ]]; then
      echo "  ${file#$root/}:$lineno  href=\"$href\"  ->  file not found" >&2
      broken=$((broken + 1))
    fi
  done < <(grep -noiE "href[[:space:]]*=[[:space:]]*(\"[^\"]*\"|'[^']*')" "$file" \
            | sed -E "s/^([0-9]+):[^=]*=[[:space:]]*[\"'](.*)[\"']$/\1\t\2/")
done < <(find "$root" -name '*.html' -not -path '*/.git/*' -not -path '*/node_modules/*')

if (( broken )); then
  echo "✗ $broken broken link(s) found (see above)" >&2
  exit 1
fi
echo "✓ All $checked local links point to existing files."
