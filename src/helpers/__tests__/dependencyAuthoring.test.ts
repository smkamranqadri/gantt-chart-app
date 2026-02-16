import { describe, expect, it } from 'vitest'
import type { Task } from '../../types/gantt'
import {
  buildDependencyCandidates,
  validateDependencySelection,
} from '../dependencyAuthoring'

const createTask = (overrides: Partial<Task> & Pick<Task, 'id'>): Task => ({
  id: overrides.id,
  title: overrides.title ?? overrides.id,
  laneId: overrides.laneId ?? 'owais',
  start: overrides.start ?? '2026-02-02',
  end: overrides.end ?? '2026-02-02',
  kind: overrides.kind ?? 'task',
  dependsOn: overrides.dependsOn ?? [],
})

describe('dependencyAuthoring', () => {
  it('filters candidates by title or id and excludes self', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-a', title: 'API scaffolding' }),
      createTask({ id: 'task-b', title: 'Design review' }),
      createTask({ id: 'task-c', title: 'Regression pass' }),
    ]

    const titleMatches = buildDependencyCandidates({
      allTasks: tasks,
      currentTaskId: 'task-a',
      query: 'design',
    })
    const idMatches = buildDependencyCandidates({
      allTasks: tasks,
      currentTaskId: 'task-a',
      query: 'task-c',
    })

    expect(titleMatches.map((candidate) => candidate.id)).toEqual(['task-b'])
    expect(idMatches.map((candidate) => candidate.id)).toEqual(['task-c'])
  })

  it('sorts candidates deterministically by start date then id', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-c', start: '2026-02-03' }),
      createTask({ id: 'task-a', start: '2026-02-02' }),
      createTask({ id: 'task-b', start: '2026-02-02' }),
    ]

    const candidates = buildDependencyCandidates({
      allTasks: tasks,
      currentTaskId: null,
      query: '',
    })

    expect(candidates.map((candidate) => candidate.id)).toEqual([
      'task-a',
      'task-b',
      'task-c',
    ])
  })

  it('rejects self dependency and immediate cycle on selection', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-a', dependsOn: ['task-b'] }),
      createTask({ id: 'task-b', dependsOn: [] }),
    ]

    const selfValidation = validateDependencySelection({
      allTasks: tasks,
      currentTask: tasks[0],
      selectedDependencyIds: ['task-a'],
    })
    const cycleValidation = validateDependencySelection({
      allTasks: tasks,
      currentTask: tasks[1],
      selectedDependencyIds: ['task-a'],
    })

    expect(selfValidation.valid).toBe(false)
    expect(selfValidation.reason).toContain('cannot depend on itself')
    expect(cycleValidation.valid).toBe(false)
    expect(cycleValidation.reason?.toLowerCase()).toContain('cycle')
  })

  it('allows cross-lane dependency and detects missing targets', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-a', laneId: 'owais' }),
      createTask({ id: 'task-b', laneId: 'kamran' }),
    ]

    const crossLaneValidation = validateDependencySelection({
      allTasks: tasks,
      currentTask: tasks[1],
      selectedDependencyIds: ['task-a'],
    })
    const missingTargetValidation = validateDependencySelection({
      allTasks: tasks,
      currentTask: tasks[1],
      selectedDependencyIds: ['missing-task'],
    })

    expect(crossLaneValidation.valid).toBe(true)
    expect(missingTargetValidation.valid).toBe(false)
    expect(missingTargetValidation.reason).toContain('no longer exists')
  })
})
