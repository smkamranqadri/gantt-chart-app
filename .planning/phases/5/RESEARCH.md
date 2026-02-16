# RESEARCH: Phase 5 - Interaction Hardening

## Metadata

- Milestone: `Gantt Solo Pro`
- Phase ID: `5`
- Phase Name: `Interaction Hardening`
- Research Date: `2026-02-16`
- Researcher: `codex`
- Confidence: `high`

## Summary

Phase 5 should harden interaction safety and accessibility without adding external dependencies. The current implementation already supports drag, resize, dependency validation at modal submit, milestone invariants, and undo/redo; however, dependency ordering is not enforced during drag/resize and keyboard discoverability for editing remains weaker than pointer flow.

The highest-risk area is dependency-order drift after timeline interactions. A predecessor can currently be moved or resized past a successor boundary, which can produce a graph that is structurally valid but schedule-invalid for finish-to-start semantics. Hardening should add deterministic constraint checks, clear blocked-action feedback, and history semantics that keep undo/redo trustworthy.

## Codebase Findings

1. `src/App.tsx` applies drag movement on pointer move and commits task state directly, but does not validate timeline ordering against dependency edges during move/resize.
2. `src/App.tsx` currently pushes history at drag/resize start, which can create noisy undo points when interactions are canceled or blocked.
3. `src/helpers/dependencyAuthoring.ts` validates cycle/self/missing-target rules for dependency selection, but there is no helper for schedule-order constraints during timeline mutation.
4. `src/components/TaskBar.tsx` supports double-click pointer edit entry but has no equivalent keyboard-first affordance for opening edit mode.
5. `src/components/TaskModal.tsx` has focus trap and keyboard-friendly form controls, but dependency status messaging can be improved for assistive tech announcements.
6. Existing test coverage is strong for graph normalization/critical path helpers, but there is no focused coverage for drag/resize dependency-order conflicts and blocked-action history behavior.

## Risks And Pitfalls

1. Dependency order violations can silently regress schedule correctness if timeline edits bypass finish-to-start rules.
2. Undo/redo can become semantically unreliable if blocked or canceled interactions still record history snapshots.
3. Conflict messaging can be too subtle if feedback is only visual and not announced/accessibly described.
4. Keyboard-only users may miss edit entry or conflict states if task bars are not focusable/actionable.

## Recommended Strategy

1. Introduce a dedicated schedule-constraint helper (for example `src/helpers/dependencyConstraints.ts`) that validates finish-to-start ordering for both predecessors and successors after proposed move/resize mutations.
2. Enforce constraints at timeline interaction commit boundaries:
   - allow live preview while dragging
   - block invalid commit, restore prior snapshot, and emit explicit conflict feedback
   - only push history when a valid mutation commits
3. Add conflict affordances in UI:
   - visible warning surface describing blocked action
   - optional task highlighting for involved conflict nodes
   - clear message reset after next valid interaction
4. Harden keyboard and accessibility interaction:
   - focusable task-bar edit affordance (Enter/Space parity with double-click)
   - accessible status announcements for dependency/conflict errors
   - preserve visible focus and label relationships in modal controls
5. Add regression tests for constraint helper behavior and history integrity, then run full lint/test/build gate.

## Out Of Scope Confirmations

1. Backend and persistence remain out of scope.
2. Dependency connector-line visual redesign remains out of scope for this phase.
3. New task model fields are not required unless constraint helper needs transient internal metadata.

## Primary Recommendation

Implement Phase 5 as an invariant-first interaction hardening slice: add schedule-constraint validation and history safety before polishing keyboard and accessibility affordances. This keeps behavior correct under edge-case manipulations and aligns directly with Phase 5 roadmap goals.
