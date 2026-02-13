# PLAN: Phase 3 - Critical Path Engine + Visualization

## Phase Metadata

- Milestone: `Gantt Solo Pro`
- Phase ID: `3`
- Phase Name: `Critical Path Engine + Visualization`
- Owner: `codex`
- Status: `completed`
- Last Updated: `2026-02-14`

## Objective

Compute and visualize a deterministic critical path across all board tasks while preserving existing Phase 1/2 dependency model and interaction behavior.

## Locked Decisions

1. Scope covers all board tasks (not week-only and not per-lane).
2. Duration metric is calendar days; milestones contribute `0` duration.
3. UI scope includes critical bar highlight, critical badges, and top-toolbar summary.
4. Recompute runs on every task mutation, including undo/redo.
5. Invalid graph behavior is non-blocking warning + hidden critical highlight.
6. Tie-break for equal longest paths is earliest `start`, then `id`.
7. Connector lines remain deferred to a later phase.

## Deliverables

1. New critical-path helper module with deterministic longest-path computation.
2. App-level computed critical-path state with warning handling.
3. Lane/task-bar visualization updates for critical highlighting and order metadata.
4. Test suite for algorithm scenarios and deterministic tie handling.

## Implementation Breakdown

### Wave 1 - Critical Path Engine

1. Added `src/helpers/criticalPath.ts`.
2. Implemented `getTaskDurationDays(task)`:
   - milestone: `0`
   - task: inclusive calendar span (`max(1, daysBetween + 1)`).
3. Implemented `computeCriticalPath(tasks)`:
   - validates graph with existing dependency utilities.
   - returns warning and no path for invalid graphs.
   - computes deterministic weighted longest path from topological order.
   - applies tie-break by earliest `start`, then `id`.

### Wave 2 - App-Level Integration

1. Integrated critical-path computation in `src/App.tsx` via `useMemo` over full `tasks` state.
2. Derived `criticalTaskIdSet` and `criticalOrderById` for render use.
3. Added top-toolbar critical-path panel with total days and ordered summary.
4. Added warning banner when graph is invalid and suppressed highlight in that state.

### Wave 3 - Visualization

1. Extended `GanttLane` contract to accept critical path lookup data.
2. Extended `TaskBar` contract with `isCritical` and `criticalOrderLabel`.
3. Added critical badge and emphasized ring treatment for critical tasks.
4. Added critical order line in task tooltip while preserving dependency badge/tooltip behavior.

### Wave 4 - Test Coverage

1. Added `src/helpers/__tests__/criticalPath.test.ts`.
2. Covered:
   - simple chain
   - branching longest path
   - deterministic tie-break
   - milestone zero-duration handling
   - invalid cyclic graph warning
   - deterministic repeatability

## Verification Loop Results

### Automated

1. `npm run lint`: pass
2. `npm run test`: pass (`4` files, `18` tests)
3. `npm run build`: pass

### Manual UAT

1. Pending for formal verification phase (`$gsd-verify-work 3`).

## Exit Criteria Status

1. Deterministic critical-path helper implemented: `met`
2. Invalid graph warning + hidden highlight behavior implemented: `met`
3. Critical-task highlight, badge, and summary rendering implemented: `met`
4. Lint/test/build passing: `met`
5. Planning/state artifacts updated for execution handoff: `met`

## Handoff

Next verification command:

1. `$gsd-verify-work 3`
