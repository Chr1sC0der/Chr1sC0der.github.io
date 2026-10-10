# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Static personal site: plain HTML pages sharing one `styles.css`. No build step, no package manager. Open the `.html` files directly in a browser.

- The `<nav>` block is copy-pasted into every page. When adding, renaming, or removing a page, update the nav in all pages.
- Links are relative filenames (e.g. `href="about.html"`), not absolute paths.
- After changing any `href` or adding/renaming pages, run `./check-links.sh`. It exits 1 and lists `file:line` for every href pointing to a missing local file. Node is not installed, so keep the checker as bash.

## Blog

- `blog.html` (feed) and `write.html` (Tumblr-style composer) share `blog.js`. Posts are stored in the browser's localStorage under `blog.posts`, so they are per-browser, not part of the repo.
- All storage access goes through `Blog.loadPosts` / `Blog.savePosts`; post HTML is rendered via `Blog.renderPost`, which sanitizes the body. Don't write post content with `innerHTML`.
- Links created in JS (e.g. tag filters) are not covered by `check-links.sh`.

## Git

- Never push without asking the user first.
