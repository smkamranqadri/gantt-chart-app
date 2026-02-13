import { describe, expect, it } from 'vitest'
import type { LegacyTask } from '../../types/gantt'
import { normalizeTask, normalizeTasks } from '../taskModel'

describe('taskModel normalization', () => {
  it('applies defaults and removes invalid dependency ids', () => {
    const legacyTasks: LegacyTask[] = [
      {
        id: 'task-a',
        title: 'Task A',
        laneId: 'backend',
        start: '2026-02-02',
        end: '2026-02-03',
        dependsOn: ['task-a', 'task-b', 'unknown', 'task-b'],
      },
      {
        id: 'task-b',
        title: 'Task B',
        laneId: 'frontend',
        start: '2026-02-02',
        end: '2026-02-04',
        kind: 'milestone',
      },
    ]

    const normalized = normalizeTasks(legacyTasks)

    expect(normalized[0]).toEqual({
      id: 'task-a',
      title: 'Task A',
      laneId: 'backend',
      start: '2026-02-02',
      end: '2026-02-03',
      kind: 'task',
      dependsOn: ['task-b'],
    })

    expect(normalized[1]).toEqual({
      id: 'task-b',
      title: 'Task B',
      laneId: 'frontend',
      start: '2026-02-02',
      end: '2026-02-04',
      kind: 'milestone',
      dependsOn: [],
    })
  })

  it('does not mutate original task objects', () => {
    const legacyTasks: LegacyTask[] = [
      {
        id: 'task-a',
        title: 'Task A',
        laneId: 'backend',
        start: '2026-02-02',
        end: '2026-02-03',
      },
    ]

    const snapshot = JSON.parse(JSON.stringify(legacyTasks))
    const normalized = normalizeTasks(legacyTasks)

    expect(legacyTasks).toEqual(snapshot)
    expect(normalized[0]).not.toBe(legacyTasks[0])
  })

  it('normalizes a single task with explicit known ids', () => {
    const legacyTask: LegacyTask = {
      id: 'task-a',
      title: 'Task A',
      laneId: 'qa',
      start: '2026-02-05',
      end: '2026-02-05',
      dependsOn: ['task-b', 'task-z'],
    }

    const normalized = normalizeTask(legacyTask, new Set(['task-a', 'task-b']))

    expect(normalized.dependsOn).toEqual(['task-b'])
    expect(normalized.kind).toBe('task')
  })
})
