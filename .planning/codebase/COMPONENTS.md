# Codebase Component Map

## Component Graph

- `src/main.tsx` -> `src/App.tsx`
- `src/App.tsx` -> `src/components/WeekHeader.tsx`
- `src/App.tsx` -> `src/components/GanttLane.tsx`
- `src/components/GanttLane.tsx` -> `src/components/TaskBar.tsx`
- `src/App.tsx` -> `src/components/TaskModal.tsx`
- `src/App.tsx` -> `src/data/gantt.ts`, `src/helpers/date.ts`, `src/types/gantt.ts`

## Module Responsibilities

### `src/main.tsx`

- Bootstraps React root and loads global CSS.
- No domain logic.

### `src/App.tsx`

- Owns all app-level state:
  - tasks, drag state, week navigation, modal visibility, undo/redo flags.
- Derives timeline data:
  - visible week days, current-day highlight index, task index map.
- Coordinates interactions:
  - drag/move updates start/end/lane in real time.
  - resize updates end date with start-date guard.
  - keyboard and button undo/redo.
  - modal submit adds task.
- Acts as integration hub for browser events and child component callbacks.

### `src/components/WeekHeader.tsx`

- Renders lane header column and 7 day columns.
- Displays weekday label and normalized date string.
- Highlights current day if index is in the visible week.

### `src/components/GanttLane.tsx`

- Converts lane tasks into on-screen bounds for 7-day viewport.
- Performs row-packing algorithm to avoid overlap collisions.
- Computes visual clipping and continuation flags for tasks crossing week boundaries.
- Delegates actual task rendering/interaction handles to `TaskBar`.

### `src/components/TaskBar.tsx`

- Renders positioned task chip with tooltip and resize handle.
- Initiates drag or resize via pointer handlers and callback props.
- Applies visual states: dragging opacity, continuation indicators, hover affordances.

### `src/components/TaskModal.tsx`

- Provides task creation form and local form state.
- Validates title and end>=start constraints before submit.
- Implements accessibility controls:
  - focus on open, focus trap on Tab, Escape to close, focus return on close.

### `src/data/gantt.ts`

- Contains seed tasks and lane metadata:
  - `laneIds`, labels, colors, `dayWidth`, and initial `weekStart`.

### `src/helpers/date.ts`

- Date utility primitives:
  - `parseDate`, `formatDate`, `addDays`, `daysBetween`.
- Central dependency for rendering math and interaction calculations.

### `src/types/gantt.ts`

- Shared domain types:
  - `LaneId`
  - `Task`

## Integration Points

- UI interactions rely on browser-level events:
  - pointer move/up listeners on `window`
  - keyboard listeners for undo/redo and modal behavior
  - hit-testing via `document.elementFromPoint`
- Task IDs are generated with `crypto.randomUUID()` in modal submit path.
- Layout constants (`dayWidth`, lane enums) are shared between data and rendering modules.

## High-Risk Components And Why

- `src/App.tsx`:
  - highest change surface; drag/resize/history/week navigation logic is tightly coordinated.
- `src/components/GanttLane.tsx`:
  - row-packing and clipping math can regress with off-by-one/date-boundary changes.
- `src/helpers/date.ts`:
  - all positioning and date delta calculations depend on helper correctness.
- `src/components/TaskModal.tsx`:
  - accessibility behavior (focus trap/restore) can break with small refactoring errors.

## Suggested Focus Areas For Future Phases

- Add automated tests around date math and lane packing.
- Add interaction tests for drag/resize + cross-lane drop behavior.
- Consider extracting undo/redo state management into a dedicated hook/module.
- Consider constraining or paginating history snapshots for large task sets.
