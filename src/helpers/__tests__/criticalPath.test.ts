import { describe, expect, it } from 'vitest'
import type { Task } from '../../types/gantt'
import { computeCriticalPath, getTaskDurationDays } from '../criticalPath'

const createTask = (overrides: Partial<Task> & Pick<Task, 'id'>): Task => ({
  id: overrides.id,
  title: overrides.title ?? overrides.id,
  laneId: overrides.laneId ?? 'owais',
  start: overrides.start ?? '2026-02-02',
  end: overrides.end ?? '2026-02-02',
  kind: overrides.kind ?? 'task',
  dependsOn: overrides.dependsOn ?? [],
})

describe('criticalPath', () => {
  it('computes critical path for a simple dependency chain', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-02', end: '2026-02-03' }),
      createTask({
        id: 'task-b',
        start: '2026-02-04',
        end: '2026-02-06',
        dependsOn: ['task-a'],
      }),
      createTask({
        id: 'task-c',
        start: '2026-02-07',
        end: '2026-02-07',
        dependsOn: ['task-b'],
      }),
    ]

    const result = computeCriticalPath(tasks)

    expect(result.warning).toBeNull()
    expect(result.result).toEqual({
      orderedTaskIds: ['task-a', 'task-b', 'task-c'],
      totalDays: 6,
    })
  })

  it('selects longest branch in a forked dependency graph', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-02', end: '2026-02-02' }),
      createTask({
        id: 'task-b',
        start: '2026-02-03',
        end: '2026-02-05',
        dependsOn: ['task-a'],
      }),
      createTask({
        id: 'task-c',
        start: '2026-02-03',
        end: '2026-02-04',
        dependsOn: ['task-a'],
      }),
      createTask({
        id: 'task-d',
        start: '2026-02-06',
        end: '2026-02-06',
        dependsOn: ['task-b'],
      }),
      createTask({
        id: 'task-e',
        start: '2026-02-06',
        end: '2026-02-09',
        dependsOn: ['task-c'],
      }),
    ]

    const result = computeCriticalPath(tasks)

    expect(result.warning).toBeNull()
    expect(result.result).toEqual({
      orderedTaskIds: ['task-a', 'task-c', 'task-e'],
      totalDays: 7,
    })
  })

  it('applies deterministic tie-break by earliest start then id', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-b', start: '2026-02-03', end: '2026-02-05' }),
      createTask({ id: 'task-a', start: '2026-02-03', end: '2026-02-05' }),
      createTask({ id: 'task-c', start: '2026-02-02', end: '2026-02-04' }),
    ]

    const result = computeCriticalPath(tasks)

    expect(result.warning).toBeNull()
    expect(result.result).toEqual({
      orderedTaskIds: ['task-c'],
      totalDays: 3,
    })
  })

  it('treats milestones as zero-duration tasks', () => {
    const milestone = createTask({
      id: 'milestone-a',
      kind: 'milestone',
      start: '2026-02-02',
      end: '2026-02-02',
    })
    const task = createTask({
      id: 'task-a',
      start: '2026-02-03',
      end: '2026-02-04',
      dependsOn: ['milestone-a'],
    })

    const result = computeCriticalPath([milestone, task])

    expect(getTaskDurationDays(milestone)).toBe(0)
    expect(result.result).toEqual({
      orderedTaskIds: ['milestone-a', 'task-a'],
      totalDays: 2,
    })
  })

  it('keeps milestones in the ordered critical path without adding duration', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-02', end: '2026-02-03' }),
      createTask({
        id: 'milestone-a',
        kind: 'milestone',
        start: '2026-02-04',
        end: '2026-02-04',
        dependsOn: ['task-a'],
      }),
      createTask({
        id: 'task-b',
        start: '2026-02-05',
        end: '2026-02-07',
        dependsOn: ['milestone-a'],
      }),
    ]

    const result = computeCriticalPath(tasks)

    expect(result.warning).toBeNull()
    expect(result.result).toEqual({
      orderedTaskIds: ['task-a', 'milestone-a', 'task-b'],
      totalDays: 5,
    })
  })

  it('returns warning and no result for cyclic graph', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-a', dependsOn: ['task-b'] }),
      createTask({ id: 'task-b', dependsOn: ['task-a'] }),
    ]

    const result = computeCriticalPath(tasks)

    expect(result.result).toBeNull()
    expect(result.warning?.toLowerCase()).toContain('cycle')
  })

  it('produces deterministic output for repeated runs', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-02', end: '2026-02-03' }),
      createTask({ id: 'task-b', start: '2026-02-02', end: '2026-02-03' }),
      createTask({
        id: 'task-c',
        start: '2026-02-04',
        end: '2026-02-05',
        dependsOn: ['task-a'],
      }),
      createTask({
        id: 'task-d',
        start: '2026-02-04',
        end: '2026-02-05',
        dependsOn: ['task-b'],
      }),
    ]

    const outputs = Array.from({ length: 5 }, () => computeCriticalPath(tasks))

    outputs.forEach((output) => {
      expect(output).toEqual({
        warning: null,
        result: {
          orderedTaskIds: ['task-a', 'task-c'],
          totalDays: 4,
        },
      })
    })
  })
})
