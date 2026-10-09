# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Static personal site: plain HTML pages sharing one `styles.css`. No build step, no package manager. Open the `.html` files directly in a browser.

- The `<nav>` block is copy-pasted into every page. When adding, renaming, or removing a page, update the nav in all pages.
- Links are relative filenames (e.g. `href="about.html"`), not absolute paths.
- After changing any `href` or adding/renaming pages, run `./check-links.sh`. It exits 1 and lists `file:line` for every href pointing to a missing local file. Node is not installed, so keep the checker as bash.
