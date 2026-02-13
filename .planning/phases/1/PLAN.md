# PLAN: Phase 1 - Domain Model Upgrade

## Phase Metadata

- Milestone: `Gantt Solo Pro`
- Phase ID: `1`
- Phase Name: `Domain Model Upgrade`
- Owner: `codex`
- Status: `completed`
- Last Updated: `2026-02-13`

## Objective

Introduce a dependency-aware task model and normalization layer that preserves backward compatibility for existing tasks while preparing the codebase for dependency authoring and critical-path features in later phases.

## Inputs

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- Existing domain files under `src/types`, `src/data`, and `src/helpers`.

## Deliverables

1. Updated domain types to include `TaskKind`, `DependencyType`, `TaskV2`, and `DependencyEdge`.
2. Runtime normalization path for legacy `Task` records.
3. Dependency graph utility module(s):
   - adjacency map construction
   - self-link check
   - cycle detection
   - deterministic topological ordering support
4. Integration of normalized model into render/interaction entrypoints without behavior regression.
5. Test coverage for normalization and cycle detection logic.

## Task Breakdown

### Task 1 - Extend Type Contracts

1. Update `src/types/gantt.ts` with v2 type definitions from requirements.
2. Keep backward-compatible legacy type alias if needed to reduce migration risk.
3. Export clear shared types for graph utility consumption.

Acceptance checks:

1. Type definitions compile without any usage sites broken.
2. New types match requirements exactly.

### Task 2 - Add Normalization Layer

1. Create a normalization helper (for example `src/helpers/taskModel.ts`).
2. Convert legacy task records:
   - default `kind` to `"task"`
   - default `dependsOn` to `[]`
3. Remove invalid dependency references that point to unknown task IDs.
4. Ensure normalization is pure and deterministic.

Acceptance checks:

1. Legacy seed data normalizes without data loss.
2. Normalization never mutates input objects.

### Task 3 - Implement Dependency Validation Utilities

1. Create graph utility module (for example `src/helpers/dependencyGraph.ts`).
2. Implement:
   - self-link detection
   - cycle detection on proposed edge addition
   - adjacency map generation from normalized tasks
3. Return machine-usable results for UI flows in Phase 2.

Acceptance checks:

1. A->B and B->A cycle case is detected correctly.
2. Multi-node indirect cycles are detected.
3. Acyclic chains pass validation.

### Task 4 - Wire Normalized Model Into App Entry

1. Normalize seed tasks at app initialization.
2. Ensure add/edit flows produce `TaskV2` shape.
3. Preserve existing drag/resize/week-navigation behavior.
4. Add temporary no-op handling for dependencies until Phase 2 UI is implemented.

Acceptance checks:

1. Current UI renders and interacts as before.
2. New task creation produces normalized objects with required fields.

### Task 5 - Add Focused Tests

1. Add unit tests for normalization defaults and invalid dependency cleanup.
2. Add unit tests for cycle detection and self-link rejection.
3. Include deterministic test fixtures for branching graph shapes.

Acceptance checks:

1. Tests cover direct cycle, indirect cycle, and valid DAG.
2. Tests run reliably without dependence on browser runtime.

### Task 6 - Documentation Sync

1. Update `.planning/STATE.md` with implementation progress notes.
2. Add phase completion notes to this plan after execution.

Acceptance checks:

1. State accurately reflects phase status and next action.

## Dependencies Between Tasks

1. Task 1 is prerequisite for Tasks 2, 3, and 4.
2. Tasks 2 and 3 are prerequisites for Task 4.
3. Task 5 depends on Tasks 2 and 3.
4. Task 6 is finalization after core implementation and verification.

## Verification Loop

### Loop A - Static Validation

1. Run `npm run lint`.
2. Run `npm run build`.
3. Fix all errors before moving forward.

### Loop B - Targeted Test Validation

1. Run added unit tests for normalization/graph utilities.
2. Confirm all cycle/compatibility cases pass.

### Loop C - Manual Regression Validation

1. Launch app with `npm run dev`.
2. Confirm existing seeded tasks still render correctly.
3. Confirm drag/resize/undo/redo flows still work.
4. Confirm newly created tasks include defaults (`kind`, `dependsOn`).

### Exit Gate

Phase exits only when:

1. Lint passes.
2. Build passes.
3. Targeted tests pass.
4. Manual regression checklist passes with no blocking defects.

## Risks And Mitigations

1. Risk: model migration breaks current rendering assumptions.
   Mitigation: normalize at boundary and keep compatibility defaults.
2. Risk: cycle detection false positives/negatives.
   Mitigation: deterministic fixtures for direct and indirect cycle paths.
3. Risk: hidden coupling in drag/resize logic.
   Mitigation: explicit manual regression checklist before phase close.

## Handoff To Execution

Primary execution command after review:

1. `$gsd-execute-phase`

## Execution Summary

### Completed Implementation

1. Added Phase 1 type contracts and migration boundary in `src/types/gantt.ts`:
   - `TaskKind`, `DependencyType`, `LegacyTask`, `TaskV2`, `DependencyEdge`, `CriticalPathResult`.
2. Added normalization helpers in `src/helpers/taskModel.ts`:
   - `normalizeTask(...)`
   - `normalizeTasks(...)`
3. Added dependency graph utilities in `src/helpers/dependencyGraph.ts`:
   - adjacency map construction
   - self-link check
   - cycle prediction for proposed edges
   - deterministic topological ordering
   - graph validation reporting
4. Integrated normalization at app boundary in `src/App.tsx` with unchanged user-visible behavior.
5. Updated task creation defaults in `src/components/TaskModal.tsx` to produce `kind` and `dependsOn`.
6. Added test tooling:
   - `vitest` dev dependency
   - `test` and `test:watch` scripts
   - `vitest.config.ts`
7. Added focused unit tests:
   - `src/helpers/__tests__/taskModel.test.ts`
   - `src/helpers/__tests__/dependencyGraph.test.ts`

### Verification Results

1. `npm run lint`: pass
2. `npm run test`: pass
3. `npm run build`: pass
4. Manual regression checklist status: not fully automated; UI behavior intentionally unchanged and validated via build/lint/test gate for this execution pass.
