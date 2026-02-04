# Plan: Gantt Chart POC (React + TS + Vite + Tailwind)

Phased plan so you can test and commit after each phase.

## Project Rules

1. Follow best practices for React/TypeScript/Tailwind structure and maintainability.
2. Implement security checks (ESLint rules + dependency audit step in CI or local workflow).
3. Use one-line git commit messages for each phase checkpoint.
4. Apply best UI/UX practices: clear hierarchy, spacing consistency, accessible contrast, and sensible cursor/interaction feedback.
5. After each phase, pause for your testing and explicit approval. Only then I will commit and proceed to the next phase.

## Phase 1 — Scaffold + Tailwind

1. Scaffold a new Vite React + TypeScript project in the current directory using npm.
2. Install and configure TailwindCSS (postcss, autoprefixer), and wire Tailwind into `src/index.css` and `tailwind.config.*`.
3. Add Prettier, ESLint, and Husky (config + scripts) and verify all run.
4. Add minimal app shell to confirm Tailwind is active.

Test/Commit: `npm install` then `npm run dev` — verify base page renders with Tailwind styles.

## Phase 2 — Data Model + Static Layout

1. Implement date helpers (`parseDate`, `formatDate`, `addDays`, `daysBetween`) and task types in `src/App.tsx`.
2. Build the Gantt layout: week header (Mon–Sun for weekStart `2026-02-02`), 3 lanes (Backend/Frontend/QA), and 7-column grid (120px columns).
3. Render a few static tasks using the specified positioning math.

Test/Commit: verify header dates, grid alignment, and static task positioning.

## Phase 3 — Interactions (Drag + Resize)

1. Implement drag and resize interactions with pointer events.
2. Snap moves/resizes to day width and clamp within the week.
3. Ensure cursor styles and UX feedback (grab/grabbing, ew-resize).

Test/Commit: drag/resize tasks; verify snapping, clamping, and date updates.

## Phase 4 — Add Task Modal + Validation

1. Build the “+ Task” modal with title, lane, start/end pickers.
2. Validate range and end >= start; update state on submit.

Test/Commit: add tasks, validate errors, ensure new tasks render correctly.

## Phase 5 — Polish + Run Instructions

1. Tune Tailwind styling (lane backgrounds, bar colors, spacing).
2. Add brief run instructions to `README.md`.

Test/Commit: final visual pass and sanity check.
