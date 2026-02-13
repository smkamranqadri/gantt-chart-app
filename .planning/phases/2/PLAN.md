# PLAN: Phase 2 - Dependency Authoring UX

## Phase Metadata

- Milestone: `Gantt Solo Pro`
- Phase ID: `2`
- Phase Name: `Dependency Authoring UX`
- Owner: `codex`
- Status: `completed`
- Last Updated: `2026-02-14`

## Objective

Enable users to create, edit, and remove task dependencies directly in the UI with immediate validation and keyboard-accessible workflows, while preserving existing drag/resize/week navigation behavior.

## Locked Decisions

1. Dependency authoring lives inside `TaskModal`.
2. Existing task editing opens from task-bar double-click.
3. Dependency picker is searchable multi-select.
4. Cross-lane dependencies are allowed.
5. Candidate pool includes all board tasks.
6. Invalid selections are blocked immediately with inline messaging.
7. Submit remains disabled while dependency state is invalid.
8. Undo/redo captures one atomic state change per modal submit.
9. Visual scope is dependency indicators/badges only (no connector lines).

## Deliverables

1. Modal create/edit mode support with dependency management.
2. Dependency authoring helper layer (`dependencyAuthoring.ts`) for deterministic filtering/validation.
3. Task edit entry from task-bar double-click.
4. Dependency indicators in timeline cards and tooltip metadata.
5. Test coverage for dependency authoring helper logic.

## Implementation Breakdown

### Wave 1 - Modal Refactor + Edit Entry

1. Refactored `TaskModal` to support `create` and `edit` modes.
2. Added modal context in `App` (`modalMode`, `editingTaskId`, `modalSession`).
3. Added task edit trigger from `TaskBar` double-click routed via `GanttLane` to `App`.
4. Guarded drag start against double-click intent (`event.detail > 1`).

### Wave 2 - Dependency Authoring UX

1. Added searchable dependency selection list in `TaskModal`.
2. Added selected dependency chips with remove interaction.
3. Added immediate dependency validation during selection.
4. Added inline dependency validation messaging and submit disabling.

### Wave 3 - Submit Semantics + Indicators + Undo

1. Added one submit handler in `App` for create/edit task persistence.
2. Applied one `pushHistory(...)` call per modal submit.
3. Added dependency count badge (`Deps: N`) to task bars.
4. Added dependency summary in task hover tooltip.

### Wave 4 - Test Coverage

1. Added helper tests in `src/helpers/__tests__/dependencyAuthoring.test.ts`.
2. Preserved Phase 1 tests and ensured all suites pass.

## Verification Loop Results

### Automated

1. `npm run lint`: pass
2. `npm run test`: pass
3. `npm run build`: pass

### Manual UAT Checklist Alignment

1. Dependency create/edit/remove paths are implemented and test-covered at helper level.
2. Immediate invalid-selection blocking is implemented with inline feedback.
3. Keyboard-accessible form controls remain intact in modal.
4. Existing interaction paths (drag/resize/week navigation) compile and pass regression gates.
5. Browser-level walkthrough remains recommended for full UX sign-off in verification step.

## Exit Criteria Status

1. Dependency create/edit/remove available through modal: `met`
2. Invalid operations prevented with clear messaging: `met`
3. Keyboard-accessible authoring flow: `met`
4. Dependency indicators visible on tasks: `met`
5. Lint/tests/build passing: `met`
6. Planning/state artifacts updated for Phase 2: `met`

## Handoff

Next verification command:

1. `$gsd-verify-work 2`
