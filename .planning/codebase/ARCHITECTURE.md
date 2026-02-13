# Codebase Architecture Map

## Scope And Phase Context

- Project scope: single-page React + TypeScript Gantt chart proof of concept with drag, resize, week navigation, task creation modal, and undo/redo.
- Milestone context (inferred): `docs/plan.md` defines phases 1-10; implemented features and deployment artifacts indicate work is at/after Phase 10 ("Deploy Setup").
- No explicit milestone state file was found under `.planning/`, so current phase is inferred from code and docs.

## System Boundaries

- Frontend runtime boundary: browser-only SPA (no backend API calls in app code).
- Build boundary: Vite compiles `src/` into static assets under `dist/`.
- Delivery boundary: Nginx serves static assets in container; CapRover deployment is driven by `deploy.sh`.

## Module Topology

- Entry point: `src/main.tsx`
  - Mounts `App` inside React `StrictMode`.
- Application orchestrator: `src/App.tsx`
  - Owns task state, drag/resize lifecycle, week navigation, modal state, and undo/redo history.
- Presentational/interactive units:
  - `src/components/WeekHeader.tsx`
  - `src/components/GanttLane.tsx`
  - `src/components/TaskBar.tsx`
  - `src/components/TaskModal.tsx`
- Domain data and constants: `src/data/gantt.ts`
- Date utility layer: `src/helpers/date.ts`
- Shared type contracts: `src/types/gantt.ts`

## Runtime Flow

1. `App` initializes from seeded tasks and parsed `weekStart`.
2. `weekDays`, `todayIndex`, and `taskIndexMap` are derived from current week/task state.
3. Lanes are rendered per `laneIds`, each lane clips and positions tasks into a fixed 7-day viewport.
4. Pointer interactions update drag state and task dates/lane assignments, snapping by `dayWidth`.
5. Modal submission appends a new `Task` object after validation.
6. Undo/redo rehydrates full task snapshots from in-memory stacks.

## Data And State Ownership

- Canonical mutable state:
  - `tasks` (authoritative task list)
  - `dragState` (active pointer interaction)
  - `weekStartDate` (visible week)
  - `isModalOpen`, `canUndo`, `canRedo`
- Non-reactive history storage:
  - `historyRef`, `redoRef`, `tasksRef` store deep-copied task snapshots.
- Date math contract:
  - All rendering/interaction math is based on `YYYY-MM-DD` strings and helper conversions.

## Integration Points

- Browser APIs:
  - `window` pointer listeners (`pointermove`, `pointerup`)
  - `window` keyboard listener for undo/redo shortcuts
  - `document.elementFromPoint` for cross-lane drop target detection
- Deployment toolchain:
  - `deploy.sh` runs `npm run build`, stages deploy artifacts into `dist/`, creates temporary git repo, and calls CapRover CLI.
- Runtime serving:
  - `Dockerfile` + `nginx.conf` define static hosting, cache rules, SPA fallback, and security headers.

## High-Risk Areas

- Drag lifecycle complexity in `src/App.tsx`:
  - Global pointer listeners plus closure state can regress easily during feature extension.
- Date handling assumptions in `src/helpers/date.ts`:
  - Uses local `Date` construction, which can be sensitive around locale/timezone edge cases.
- History memory growth:
  - Undo/redo stores full task snapshots with no cap; large task sets can grow memory usage.
- Deployment coupling in `deploy.sh`:
  - Requires local `.env`, CapRover CLI availability, and mutates `dist/` into a git repo each deploy.
- CSP/header drift risk:
  - `nginx.conf` currently allows third-party domains not referenced in app code, creating policy drift to audit.
