# Portfolio Workspace Rules (`D:\.PORTFOLIO\portfolio`)

## Off-GitHub Activity Inspection Rule (`D:\QwerNFC`)

Whenever checking, investigating, or updating **Off-GitHub Activity** ([src/data/off-github-notes.js](file:///D:/.PORTFOLIO/portfolio/src/data/off-github-notes.js), [tools/build-contributions-years.mjs](file:///D:/.PORTFOLIO/portfolio/tools/build-contributions-years.mjs), or missing/blank days in the contribution graph):

1. **Always inspect `D:\QwerNFC` in addition to `D:\.PORTFOLIO\portfolio`**:
   - Check `D:\QwerNFC\AGENTS.md` for the active QwerNFC product directories (`D:\QwerNFC\TimeCapsule\App`, `D:\QwerNFC\GReview\App`, `D:\QwerNFC\GReview\Backend`, `D:\QwerNFC\GReview\Public-Router`, `D:\QwerNFC\Music`).
   - Check both **local Git commit history** (`git log --all`) AND **file modification dates** (`LastWriteTime` / `mtime`, excluding `node_modules`, `.git`, `dist`, `build`, `.gradle`) across `D:\QwerNFC` (especially `D:\QwerNFC\TimeCapsule`).
2. If any blank date on the GitHub contribution graph has local commits or coding/design file updates in `D:\QwerNFC`, record that date and a factual note in `D:\.PORTFOLIO\portfolio\src\data\off-github-notes.js`.
3. Never modify or cross-push `D:\QwerNFC` repositories when updating Portfolio's `off-github-notes.js`.
