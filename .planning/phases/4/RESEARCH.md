# RESEARCH: Phase 4 - Milestone Rendering + Timeline Rules

## Metadata

- Milestone: `Gantt Solo Pro`
- Phase ID: `4`
- Phase Name: `Milestone Rendering + Timeline Rules`
- Research Date: `2026-02-14`
- Researcher: `codex`
- Confidence: `high`

## Summary

Phase 4 can be implemented without new dependencies. The existing domain model already supports `kind: "milestone"` and the critical-path engine already treats milestones as zero-duration items, so the main work is enforcing the milestone date invariant (`start === end`) across all mutation paths and making milestone visuals/interaction rules explicit in the UI.

The highest-risk area is invariant drift: if one mutation path allows a milestone to keep different `start` and `end` values, later dependency and critical-path outputs become inconsistent. The implementation should enforce milestone rules at model normalization, modal submit, and drag/resize interaction boundaries.

## Codebase Findings

1. `src/types/gantt.ts` already includes `TaskKind = "task" | "milestone"`.
2. `src/helpers/criticalPath.ts` already assigns milestone duration `0` via `getTaskDurationDays`.
3. `src/components/TaskModal.tsx` currently does not expose a task-kind selector and defaults to `"task"` for new items.
4. `src/App.tsx` drag/resize flows do not currently branch on `task.kind`.
5. `src/components/TaskBar.tsx` always renders bar-style tasks with a resize handle; there is no milestone-specific visual treatment.
6. Existing test coverage does not validate milestone invariant enforcement during normalization and UI-driven updates.

## Risks And Pitfalls

1. Milestone invariant drift if `start` and `end` are not coerced at every write boundary.
2. Resize interactions can silently violate milestone behavior unless milestone resize is explicitly blocked.
3. Marker rendering can become visually ambiguous in dense lanes if milestone treatment is too similar to standard tasks.
4. Converting a task to milestone during edit can affect critical-path output and must be deterministic.

## Recommended Strategy

1. Enforce milestone invariants in three places:
   - normalization boundary (`normalizeTask`)
   - modal submit path
   - drag/resize interaction commits
2. Introduce milestone-focused authoring UX:
   - explicit kind selector in modal
   - automatic `end = start` sync for milestones
   - prevent milestone resizing
3. Add dedicated milestone timeline treatment (marker-style render) while preserving dependency badges and critical-path cues.
4. Extend tests for milestone normalization and critical-path behavior with milestone predecessor/successor participation.

## Out Of Scope Confirmations

1. Dependency connector-line rendering remains out of scope for Phase 4.
2. Persistence, backend, and multi-user behavior remain out of scope for this milestone.

## Primary Recommendation

Implement milestone handling as an invariant-first slice: first guarantee `start === end` everywhere, then layer UI rendering/interaction affordances on top. This minimizes regression risk and keeps Phase 4 aligned with existing dependency and critical-path behavior.
