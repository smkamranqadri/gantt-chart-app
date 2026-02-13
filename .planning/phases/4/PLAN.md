# PLAN: Phase 4 - Milestone Rendering + Timeline Rules

## Phase Metadata

- Milestone: `Gantt Solo Pro`
- Phase ID: `4`
- Phase Name: `Milestone Rendering + Timeline Rules`
- Owner: `codex`
- Status: `completed`
- Last Updated: `2026-02-14`

## Objective

Support milestone items as first-class timeline entities with enforced zero-duration behavior (`start === end`), milestone-specific rendering, and full dependency/critical-path participation.

## Locked Decisions

1. Milestones remain in the same task collection (`TaskV2`) using `kind: "milestone"`.
2. Milestone date invariant is strict: `start === end` across create, edit, drag, and normalization paths.
3. Milestones are draggable but non-resizable.
4. Milestones render with a marker-style visual treatment (not the same full-bar treatment as regular tasks).
5. Milestones can be dependency predecessors/successors with no lane restrictions.
6. Critical-path behavior remains deterministic and includes milestone IDs with `0` duration contribution.
7. Dependency connector-line work remains deferred to later phases.

## Inputs

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/phases/4/RESEARCH.md`
- Existing implementation files in `src/App.tsx`, `src/components`, `src/helpers`, and test suites.

## Deliverables

1. Milestone authoring/editing support in modal with explicit kind selection.
2. Invariant enforcement helpers so milestone dates always satisfy `start === end`.
3. Milestone-specific timeline rendering and interaction rules.
4. Regression-safe dependency and critical-path behavior with milestone participation.
5. Automated verification updates for milestone-specific paths.

## Implementation Breakdown

### Wave 1 - Invariant Guardrails (Foundation)

1. Update `src/helpers/taskModel.ts` to coerce milestone dates to zero-duration during normalization.
2. Add helper coverage in `src/helpers/__tests__/taskModel.test.ts` for:
   - milestone date coercion
   - legacy fallback behavior for missing `kind`
   - dependency cleanup unaffected by milestone coercion
3. Ensure all initial/seed task loading paths continue through normalization.

### Wave 2 - Milestone Authoring UX

1. Extend `src/components/TaskModal.tsx`:
   - add kind selector (`task` / `milestone`)
   - enforce milestone end-date behavior by syncing `end` to `start`
   - provide clear inline helper text for zero-duration rule
2. Update submit semantics so create/edit always emit valid milestone shape when `kind === "milestone"`.
3. Preserve dependency selection/validation behavior for milestone entries.

### Wave 3 - Timeline Rendering + Interaction Rules

1. Update `src/components/TaskBar.tsx` milestone presentation:
   - marker-style milestone treatment
   - milestone label/tooltip clarity
   - suppress resize handle for milestones
2. Update `src/components/GanttLane.tsx` sizing/placement logic to render milestone markers consistently in week view and clipped ranges.
3. Update `src/App.tsx` interaction logic:
   - dragging milestones preserves `start === end`
   - milestone resize attempts are blocked/no-op
   - undo/redo snapshots remain atomic

### Wave 4 - Critical Path + Regression Coverage

1. Extend `src/helpers/__tests__/criticalPath.test.ts` for milestone predecessor/successor chain cases.
2. Confirm critical-path total-day math remains correct when milestones appear between standard tasks.
3. Run full regression suite to ensure dependency authoring and phase-3 critical-path behavior remain stable.

## Verification Loop

### Automated Checks

1. `npm run lint`
2. `npm run test`
3. `npm run build`

### Manual UAT Scenarios

1. Create milestone in modal and verify `start === end` is enforced.
2. Edit existing task -> convert to milestone and verify date constraint is retained.
3. Attempt milestone resize on timeline and verify no duration expansion occurs.
4. Drag milestone across days/lanes and verify both `start` and `end` move together.
5. Create dependency task -> milestone -> task and verify validation and persistence.
6. Verify milestone appears in critical-path ordering with zero duration contribution.
7. Verify undo/redo correctness for milestone create/edit/move operations.
8. Verify desktop and mobile layouts remain usable with milestone rendering present.

## Verification Loop Results

### Automated

1. `npm run lint`: pass
2. `npm run test`: pass (`4` files, `20` tests)
3. `npm run build`: pass

### Manual UAT

1. Pending for formal verification pass (`$gsd-verify-work 4`).

## Exit Criteria Status

1. Milestone create/edit support: `met`
2. `start === end` invariant across all mutation paths: `met`
3. Milestone marker rendering in timeline: `met`
4. Dependency participation as predecessor/successor: `met`
5. Critical-path integration remains deterministic: `met`
6. Lint/test/build pass: `met`
7. Manual UAT milestone scenarios pass: `pending`

## Handoff

Primary execution command:

1. `$gsd-verify-work 4`
