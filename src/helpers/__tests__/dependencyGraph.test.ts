import { describe, expect, it } from 'vitest'
import type { TaskV2 } from '../../types/gantt'
import {
  buildAdjacencyMap,
  isSelfDependency,
  topologicalSortTasks,
  validateTaskGraph,
  wouldCreateCycle,
} from '../dependencyGraph'

const createTask = (
  overrides: Partial<TaskV2> & Pick<TaskV2, 'id'>,
): TaskV2 => ({
  id: overrides.id,
  title: overrides.title ?? overrides.id,
  laneId: overrides.laneId ?? 'owais',
  start: overrides.start ?? '2026-02-02',
  end: overrides.end ?? '2026-02-02',
  kind: overrides.kind ?? 'task',
  dependsOn: overrides.dependsOn ?? [],
})

describe('dependencyGraph', () => {
  it('builds successor adjacency from dependsOn edges', () => {
    const tasks: TaskV2[] = [
      createTask({ id: 'a' }),
      createTask({ id: 'b', dependsOn: ['a'] }),
      createTask({ id: 'c', dependsOn: ['a', 'b'] }),
    ]

    const adjacency = buildAdjacencyMap(tasks)

    expect(adjacency.get('a')).toEqual(['b', 'c'])
    expect(adjacency.get('b')).toEqual(['c'])
    expect(adjacency.get('c')).toEqual([])
  })

  it('detects direct and indirect cycles for proposed edges', () => {
    const tasks: TaskV2[] = [
      createTask({ id: 'a' }),
      createTask({ id: 'b', dependsOn: ['a'] }),
      createTask({ id: 'c', dependsOn: ['b'] }),
    ]

    expect(wouldCreateCycle(tasks, 'b', 'a')).toBe(true)
    expect(wouldCreateCycle(tasks, 'c', 'a')).toBe(true)
    expect(wouldCreateCycle(tasks, 'a', 'c')).toBe(false)
  })

  it('returns deterministic topological order by start date then id', () => {
    const tasks: TaskV2[] = [
      createTask({ id: 'a', start: '2026-02-03' }),
      createTask({ id: 'b', start: '2026-02-02' }),
      createTask({ id: 'c', start: '2026-02-02' }),
      createTask({ id: 'd', start: '2026-02-04', dependsOn: ['a', 'b', 'c'] }),
    ]

    const result = topologicalSortTasks(tasks)

    expect(result.hasCycle).toBe(false)
    expect(result.orderedTaskIds).toEqual(['b', 'c', 'a', 'd'])
  })

  it('flags existing graph cycles without mutating input', () => {
    const tasks: TaskV2[] = [
      createTask({ id: 'a', dependsOn: ['c'] }),
      createTask({ id: 'b', dependsOn: ['a'] }),
      createTask({ id: 'c', dependsOn: ['b'] }),
    ]

    const snapshot = JSON.parse(JSON.stringify(tasks))
    const validation = validateTaskGraph(tasks)

    expect(validation.isValid).toBe(false)
    expect(validation.reasons.join(' ')).toContain('cycle')
    expect(tasks).toEqual(snapshot)
  })

  it('identifies self dependency checks', () => {
    expect(isSelfDependency('task-a', 'task-a')).toBe(true)
    expect(isSelfDependency('task-a', 'task-b')).toBe(false)
  })
})
