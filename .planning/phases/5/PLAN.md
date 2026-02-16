# PLAN: Phase 5 - Interaction Hardening

## Phase Metadata

- Milestone: `Gantt Solo Pro`
- Phase ID: `5`
- Phase Name: `Interaction Hardening`
- Owner: `codex`
- Status: `completed`
- Last Updated: `2026-02-16`

## Objective

Harden drag/resize/dependency behavior and keyboard interaction flows so dependency ordering remains reliable, blocked actions are explicit, and undo/redo stays trustworthy under edge-case manipulations.

## Locked Decisions

1. Dependency ordering conflicts from drag/resize must be detected and surfaced (not silently accepted).
2. Keyboard-only users must be able to enter dependency/milestone edit flows without pointer-only affordances.
3. Blocked interactions must provide explicit visual feedback.
4. Undo/redo must remain atomic and predictable across compound interaction flows.
5. Accessibility improvements must be focused on controls and states modified in this phase.
6. Milestone invariant (`start === end`) enforcement from Phase 4 remains non-negotiable.
7. Existing deterministic dependency graph and critical-path behavior must not regress.

## Inputs

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/phases/5/RESEARCH.md`
- Existing implementation files in `src/App.tsx`, `src/components`, `src/helpers`, and current test suites.

## Deliverables

1. Schedule-order conflict detection for timeline move/resize mutations.
2. Clear blocked-action feedback in timeline UI with accessible messaging.
3. Keyboard-accessible edit entry and hardened dependency authoring controls.
4. Undo/redo semantics preserved for valid operations and protected from blocked-operation noise.
5. Regression coverage for dependency-order conflicts and interaction integrity.

## Implementation Breakdown

### Wave 1 - Dependency Constraint Engine (Foundation)

1. Add a new helper module (for example `src/helpers/dependencyConstraints.ts`) to evaluate finish-to-start schedule constraints after proposed task mutation.
2. Implement conflict result contracts that identify violating edge(s) and user-facing reason strings.
3. Add focused helper tests in `src/helpers/__tests__/dependencyConstraints.test.ts` for:
   - predecessor moved beyond successor start (blocked)
   - predecessor resize beyond successor start (blocked)
   - valid schedule-preserving move/resize (allowed)
   - milestone-involved constraints preserving zero-duration semantics

### Wave 2 - Drag/Resize Conflict Handling + Feedback

1. Integrate constraint helper checks into `src/App.tsx` move/resize commit paths.
2. Ensure invalid interactions restore pre-interaction task state and do not mutate persisted schedule.
3. Shift history snapshot behavior so only valid committed operations create undo checkpoints.
4. Add conflict-state UI feedback in app shell and/or lane/task rendering to show blocked reason and involved task context.
5. Ensure conflict feedback clears on successful follow-up interaction.

### Wave 3 - Keyboard Flow + Accessibility Hardening

1. Update `src/components/TaskBar.tsx` and `src/components/GanttLane.tsx` to provide keyboard parity for edit entry (Enter/Space) alongside existing double-click behavior.
2. Strengthen `src/components/TaskModal.tsx` accessible labels/status for dependency and conflict validation feedback (`aria-live` semantics preserved/improved).
3. Preserve or improve focus visibility and focus return behavior after modal submit/cancel and blocked-action resolution.
4. Validate milestone edit flow remains keyboard-usable while keeping milestone end-date lock behavior intact.

### Wave 4 - Undo/Redo Integrity + Regression Validation

1. Verify undo/redo behavior remains atomic for create/edit/move/resize interactions with constraints enabled.
2. Add/extend tests for blocked-action history behavior where invalid operations do not create extra undo states.
3. Run full regression suite to protect existing dependency-authoring, milestone, and critical-path behavior.
4. Document any residual UX caveats for Phase 6 demo-readiness polish.

## Verification Loop

### Automated Checks

1. `npm run lint`
2. `npm run test`
3. `npm run build`

### Manual UAT Scenarios

1. Drag predecessor beyond successor start and verify operation is blocked with explicit conflict message.
2. Resize predecessor beyond successor start and verify operation is blocked.
3. Perform valid drag/resize near dependency boundaries and verify allowed commit behavior.
4. Open task edit with keyboard-only interaction (no pointer) and save dependency changes.
5. Verify dependency validation and conflict status are announced/readable in modal messaging.
6. Verify milestone edit flow remains keyboard-usable and milestone end date stays locked.
7. Verify undo/redo restores valid move/resize edits correctly.
8. Verify blocked actions do not create noisy undo checkpoints.
9. Verify conflict highlight/message clears after next successful interaction.
10. Verify desktop and mobile review/edit flows remain usable after hardening updates.

## Verification Loop Results

### Automated

1. `npm run lint`: pass
2. `npm run test`: pass (`5` files, `27` tests)
3. `npm run build`: pass

### Manual UAT

1. Pending for formal verification (`$gsd-verify-work 5`).

## Exit Criteria Status

1. Drag/resize dependency conflict handling implemented: `met`
2. Keyboard-only dependency/milestone editing flow verified: `met`
3. Visual blocked-action affordances implemented: `met`
4. Undo/redo integrity across compound operations verified: `met`
5. Accessibility pass for modified controls/states completed: `met`
6. Automated gates (`lint`, `test`, `build`) passing: `met`
7. Manual interaction-hardening UAT scenarios passing: `pending`

## Handoff

Primary execution command:

1. `$gsd-verify-work 5`
