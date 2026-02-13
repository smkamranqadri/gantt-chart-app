# PROJECT: Gantt Solo Pro

## Baseline

The current repository is a working Gantt Chart proof of concept built with React + TypeScript + Vite + TailwindCSS. Existing capabilities include week-based timeline rendering, drag and resize interactions, cross-lane movement, task creation modal, undo/redo, and deployment artifacts for static hosting.

## Milestone Objective

Upgrade the current timeline editor into a dependency-aware solo planning experience by introducing dependency links, milestone task semantics, critical-path visibility, and desktop-first interaction polish.

## Target User

Solo builders who need a lightweight but expressive timeline planner for personal project execution.

## In Scope

- Task dependency relationships with cycle and self-link protections.
- Milestone task type with zero-duration behavior on timeline.
- Critical-path computation and visual highlighting.
- Dependency connectors rendered in desktop viewport.
- Drag/resize/edit behavior compatible with dependency constraints.
- Desktop-first interaction polish while preserving usable mobile review/edit flows.

## Out of Scope

- Backend services and APIs.
- Authentication and authorization.
- Multi-user collaboration.
- Cloud sync.
- File import/export flows.
- Persistence beyond runtime memory.

## Success Criteria

Milestone is complete at "feature demo complete": all targeted dependency, milestone, and critical-path features work together in one manual end-to-end walkthrough without blocking defects.

## Constraints

- Frontend-only implementation on current React + TypeScript stack.
- No local/file/cloud persistence for this milestone.
- Preserve existing lane taxonomy (`backend`, `frontend`, `qa`).
- Maintain current quality gates (`npm run build` and `npm run lint`).

## Risks

- Dependency graph logic can introduce cycle/ordering bugs that are not obvious visually.
- Critical-path calculations can regress after drag/resize updates if graph recomputation is incomplete.
- Dependency connectors may become visually noisy in dense task layouts.
- In-memory-only model can reduce user confidence due to data loss on refresh.

## Immediate Next Command

`$gsd-plan-phase`
