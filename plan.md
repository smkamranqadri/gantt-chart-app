# Plan: Gantt Chart POC (React + TS + Vite + Tailwind)

Phased plan so you can test and commit after each phase.

## Project Rules

1. Follow best practices for React/TypeScript/Tailwind structure and maintainability.
2. Implement security checks (ESLint rules + dependency audit step in CI or local workflow).
3. Use one-line git commit messages for each phase checkpoint.
4. Apply best UI/UX practices: clear hierarchy, spacing consistency, accessible contrast, and sensible cursor/interaction feedback.
5. After each phase, pause for your testing and explicit approval. Only then I will commit and proceed to the next phase.
6. Organize the app into multiple files (types, helpers, components) where it improves readability and maintainability across the entire app.
7. Ensure responsive behavior across mobile and desktop (no broken layouts; prefer horizontal scroll for fixed grids when needed).
8. Before each commit, run `npm run build` to ensure the build succeeds.
9. Frontend security hygiene: avoid `dangerouslySetInnerHTML`, validate/normalize any user input, and keep external resources minimal.

## Phase 1 — Scaffold + Tailwind

1. Scaffold a new Vite React + TypeScript project in the current directory using npm.
2. Install and configure TailwindCSS (postcss, autoprefixer), and wire Tailwind into `src/index.css` and `tailwind.config.*`.
3. Add Prettier, ESLint, and Husky (config + scripts) and verify all run.
4. Set up the base font (modern, legible) and ensure typography is consistent.
5. Add minimal app shell to confirm Tailwind is active.

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
3. Add accessibility pass (modal semantics, focus management, keyboard close, cursor affordances).
4. Add subtle motion polish (page-load fade-in, smooth scrolling, link/button hover states).

Test/Commit: final visual pass and sanity check.

## Phase 6 — Week Awareness + Navigation

1. Highlight the column for today when it falls within the visible week.
2. Add week navigation (Prev/Next) and update header/columns accordingly.
3. Allow tasks to render beyond the visible week (clip to overlap only).
4. Permit task creation for any date range.
5. Add multi-week indicators (left/right continuation cues).

Test/Commit: verify today highlight and navigation updates the grid correctly.

## Phase 7 — Cross-Lane Dragging + Drag UX

1. Enable vertical drag across lanes (drop to change lane).
2. Add drag ghost/opacity while dragging.
3. Smooth resize preview while dragging; snap to day on release.

Test/Commit: drag tasks across lanes; ensure laneId updates and ghost UX feels right.

## Phase 8 — Multi-Week Tasks + Tooltip

1. Allow tasks to span beyond the visible week (no clamping); render partial overlap within the week.
2. Show tooltip on hover with exact start/end dates.

Test/Commit: create a task that spans before/after the week and verify rendering + tooltip.

## Phase 9 — Productivity + Demo Assets

1. Add Undo (Ctrl+Z) for the last change (drag, resize, add task).
2. Add a “Seed demo plan” button (first-time users) with multiple sample scenarios.
3. Add a short demo GIF in `README.md`.

Test/Commit: verify undo, demo seeding behavior, and README GIF display.

## Phase 10 — Deploy Setup

1. Add deployment artifacts for CapRover (Dockerfile, nginx config, captain-definition).
2. Update deploy script to build and deploy the Vite `dist` output.
3. Clean up env examples to match this app and add `.env` to `.gitignore`.

Test/Commit: run deploy script in dry mode (build + package), verify generated bundle structure.
