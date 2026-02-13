# REQUIREMENTS: Gantt Solo Pro

## Functional Requirements

1. Add dependency relationships between tasks with validation against self-links and cycles.
2. Support milestone items as zero-duration markers on the timeline.
3. Compute and highlight critical path based on dependency graph and durations.
4. Keep drag/resize/edit interactions compatible with dependency constraints.
5. Add visual dependency connectors in desktop viewport.
6. Preserve existing week navigation and lane behaviors.

## Non-Functional Requirements

1. No backend and no local/file persistence.
2. Desktop-first responsiveness; mobile remains usable for review/edit.
3. Accessible keyboard and focus behavior preserved for existing interactions.
4. Maintain current build/lint quality gate.

## Public Interfaces And Type Changes

Target type contracts:

```ts
type TaskKind = 'task' | 'milestone'

type DependencyType = 'finish_to_start'

type TaskV2 = {
  id: string
  title: string
  laneId: 'backend' | 'frontend' | 'qa'
  start: string
  end: string
  kind: TaskKind
  dependsOn: string[]
}

type DependencyEdge = {
  fromTaskId: string
  toTaskId: string
  type: DependencyType
}

type CriticalPathResult = {
  orderedTaskIds: string[]
  totalDays: number
}
```

Compatibility rule:

1. Existing `Task` items without `kind` or `dependsOn` are normalized at runtime to `kind: "task"` and `dependsOn: []`.

## Edge Cases And Failure Modes

1. Cycle creation attempt via direct or indirect dependencies must be blocked with explicit feedback.
2. Self-dependency (`taskA -> taskA`) must be rejected.
3. Missing dependency target (deleted or unknown task ID) must be removed or ignored safely during normalization.
4. Milestone dates must remain zero-duration (`start === end`) after edits.
5. Dragging/resizing a predecessor beyond successor start must surface a dependency conflict behavior.
6. Critical-path recomputation must run after add/edit/delete/move/resize/dependency updates.
7. Connector rendering must degrade gracefully when tasks are outside visible week or clipped.
8. Existing tasks without new fields must still render and remain editable.

## Acceptance Criteria

1. Creating dependency A->B succeeds and displays connector.
2. Attempting B->A when A->B exists is blocked as cycle.
3. Moving a task on critical path recomputes and updates highlighted path.
4. Milestone renders as a zero-duration marker and participates in dependency graph.
5. Dragging predecessor beyond successor start surfaces dependency conflict behavior.
6. Existing tasks without `kind`/`dependsOn` render and can be edited.
7. Desktop keyboard flow can add/edit dependencies without pointer-only requirements.
8. Mobile viewport supports review and basic edit without layout breakage.
