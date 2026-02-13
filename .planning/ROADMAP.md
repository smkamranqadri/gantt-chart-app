# ROADMAP: Gantt Solo Pro

## Phase 1: Domain Model Upgrade (ID: 1)

### Goal

Introduce dependency-aware task data model and normalization layer without breaking current task rendering and interactions.

### Implementation

1. Extend task domain model to include `kind` and `dependsOn`.
2. Add runtime normalization to preserve backward compatibility for existing tasks.
3. Introduce dependency graph utilities (adjacency, cycle checks, topological ordering).
4. Refactor task transforms/selectors to consume normalized `TaskV2`.
5. Add deterministic unit-level helper coverage for cycle detection and normalization.

### Verification

1. Build passes (`npm run build`).
2. Lint passes (`npm run lint`).
3. Manual scenarios pass:
   - Existing seeded tasks render unchanged.
   - Tasks missing `kind`/`dependsOn` normalize correctly.
   - Self-link and cycle detection utilities return expected outcomes.

### Exit Criteria

1. Model and compatibility layer are merged and stable.
2. Dependency validation primitives are ready for UI authoring in Phase 2.

## Phase 2: Dependency Authoring UX (ID: 2)

- Status: `completed`
- Completed On: `2026-02-14`

### Goal

Enable users to create, edit, and remove dependencies directly in UI with clear validation messaging.

### Implementation

1. Add dependency authoring controls in task modal/panel.
2. Implement create/remove dependency actions tied to cycle/self-link guards.
3. Add keyboard-accessible dependency editing workflow.
4. Add visual feedback for invalid dependency operations.
5. Ensure undo/redo includes dependency operations.

### Verification

1. Build passes (`npm run build`).
2. Lint passes (`npm run lint`).
3. Manual scenarios pass:
   - A->B creation succeeds.
   - B->A is blocked when A->B exists.
   - Removing dependency updates task graph and UI state.

### Exit Criteria

1. Dependency editing is fully usable by keyboard and pointer.
2. Invalid dependency operations are prevented and clearly communicated.

## Phase 3: Critical Path Engine + Visualization (ID: 3)

### Goal

Compute and visualize critical path with reliable updates after schedule and dependency changes.

### Implementation

1. Implement critical path algorithm over current dependency graph and durations.
2. Expose `CriticalPathResult` and memoized selectors for rendering.
3. Add visual styling for critical tasks and optional path summary.
4. Trigger recomputation on all graph/schedule mutations.
5. Add algorithm-focused tests for branching and tie cases.

### Verification

1. Build passes (`npm run build`).
2. Lint passes (`npm run lint`).
3. Manual scenarios pass:
   - Critical path appears for valid dependency chain.
   - Moving/resizing critical task recomputes highlighted path.
   - Non-critical edits do not incorrectly mark unrelated tasks.

### Exit Criteria

1. Critical-path logic is stable and visually understandable.
2. Recompute behavior is consistent across all mutation paths.

## Phase 4: Milestone Rendering + Timeline Rules (ID: 4)

### Goal

Support milestone items as first-class timeline entities with zero-duration constraints and dependency participation.

### Implementation

1. Add milestone creation/editing support (`kind: "milestone"`).
2. Enforce `start === end` for milestones across UI actions.
3. Add milestone-specific rendering treatment on timeline.
4. Ensure milestones can act as dependency predecessors/successors.
5. Integrate milestone behavior with critical-path calculations.

### Verification

1. Build passes (`npm run build`).
2. Lint passes (`npm run lint`).
3. Manual scenarios pass:
   - Milestone renders as zero-duration marker.
   - Milestone can be linked in dependency graph.
   - Edits do not violate milestone date constraints.

### Exit Criteria

1. Milestones behave consistently in model, UI, and graph logic.
2. Milestone dependency interactions are production-shape for demo.

## Phase 5: Interaction Hardening (ID: 5)

### Goal

Harden drag/resize/dependency behavior and keyboard flows for reliable desktop-first usage.

### Implementation

1. Add dependency conflict handling for drag/resize that violates ordering.
2. Improve keyboard interaction for dependency and milestone editing.
3. Add visual affordances for conflict states and blocked actions.
4. Ensure undo/redo integrity across compound operations.
5. Perform focused accessibility pass on modified controls and states.

### Verification

1. Build passes (`npm run build`).
2. Lint passes (`npm run lint`).
3. Manual scenarios pass:
   - Dragging predecessor beyond successor start surfaces conflict behavior.
   - Keyboard-only dependency updates succeed.
   - Undo/redo restores complex edits correctly.

### Exit Criteria

1. Core interactions remain stable under edge-case manipulations.
2. Accessibility and conflict handling meet milestone expectations.

## Phase 6: Demo Readiness (ID: 6)

### Goal

Prepare a polished, repeatable demonstration of milestone capabilities and verification outcomes.

### Implementation

1. Polish UI clarity for dependencies, milestones, and critical path.
2. Synchronize docs with implemented behavior and constraints.
3. Create final walkthrough script covering all acceptance scenarios.
4. Run full manual scenario checklist and record outcomes.
5. Triage and fix blocking defects discovered during walkthrough.

### Verification

1. Build passes (`npm run build`).
2. Lint passes (`npm run lint`).
3. Manual scenarios pass:
   - Complete acceptance checklist executes without blocker defects.
   - Desktop-first flows remain smooth with mobile basic-edit fallback intact.

### Exit Criteria

1. End-to-end feature demo completes successfully.
2. Milestone is marked done under "feature demo complete" definition.
