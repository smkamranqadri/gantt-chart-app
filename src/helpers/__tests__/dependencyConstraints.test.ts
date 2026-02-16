import { describe, expect, it } from 'vitest'
import type { Task } from '../../types/gantt'
import {
  evaluateInteractionCommit,
  getDependencyConstraintViolations,
  validateDependencySchedule,
} from '../dependencyConstraints'

const createTask = (overrides: Partial<Task> & Pick<Task, 'id'>): Task => ({
  id: overrides.id,
  title: overrides.title ?? overrides.id,
  laneId: overrides.laneId ?? 'owais',
  start: overrides.start ?? '2026-02-02',
  end: overrides.end ?? '2026-02-02',
  kind: overrides.kind ?? 'task',
  dependsOn: overrides.dependsOn ?? [],
})

describe('dependencyConstraints', () => {
  it('detects predecessor moved beyond successor start', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-02', end: '2026-02-06' }),
      createTask({
        id: 'task-b',
        start: '2026-02-05',
        end: '2026-02-08',
        dependsOn: ['task-a'],
      }),
    ]

    const violations = getDependencyConstraintViolations(tasks)

    expect(violations).toEqual([
      {
        predecessorId: 'task-a',
        successorId: 'task-b',
        predecessorEnd: '2026-02-06',
        successorStart: '2026-02-05',
      },
    ])
  })

  it('flags predecessor resize beyond successor start for changed task', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-02', end: '2026-02-06' }),
      createTask({
        id: 'task-b',
        start: '2026-02-05',
        end: '2026-02-08',
        dependsOn: ['task-a'],
      }),
    ]

    const validation = validateDependencySchedule({
      tasks,
      changedTaskId: 'task-a',
    })

    expect(validation.isValid).toBe(false)
    expect(validation.conflictingTaskIds).toEqual(['task-a', 'task-b'])
    expect(validation.reason).toContain('task-a ends on 2026-02-06')
  })

  it('allows schedule-preserving dependency edits', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-02', end: '2026-02-04' }),
      createTask({
        id: 'task-b',
        start: '2026-02-04',
        end: '2026-02-08',
        dependsOn: ['task-a'],
      }),
    ]

    const validation = validateDependencySchedule({
      tasks,
      changedTaskId: 'task-a',
    })

    expect(validation.isValid).toBe(true)
    expect(validation.reason).toBeNull()
    expect(validation.violations).toEqual([])
  })

  it('ignores unrelated violations for the currently changed task', () => {
    const tasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-02', end: '2026-02-02' }),
      createTask({ id: 'task-b', start: '2026-02-02', end: '2026-02-02' }),
      createTask({
        id: 'task-c',
        start: '2026-02-02',
        end: '2026-02-06',
      }),
      createTask({
        id: 'task-d',
        start: '2026-02-05',
        end: '2026-02-08',
        dependsOn: ['task-c'],
      }),
    ]

    const validation = validateDependencySchedule({
      tasks,
      changedTaskId: 'task-a',
    })

    expect(validation.isValid).toBe(true)
    expect(validation.violations).toEqual([])
    expect(validation.reason).toBeNull()
  })

  it('evaluates milestone dependencies with zero-duration semantics', () => {
    const validTasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-02', end: '2026-02-04' }),
      createTask({
        id: 'milestone-a',
        kind: 'milestone',
        start: '2026-02-04',
        end: '2026-02-04',
        dependsOn: ['task-a'],
      }),
    ]
    const invalidTasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-02', end: '2026-02-05' }),
      createTask({
        id: 'milestone-a',
        kind: 'milestone',
        start: '2026-02-04',
        end: '2026-02-04',
        dependsOn: ['task-a'],
      }),
    ]

    expect(
      validateDependencySchedule({
        tasks: validTasks,
        changedTaskId: 'milestone-a',
      }).isValid,
    ).toBe(true)
    expect(
      validateDependencySchedule({
        tasks: invalidTasks,
        changedTaskId: 'task-a',
      }).isValid,
    ).toBe(false)
  })

  it('does not record history when interaction is blocked', () => {
    const beforeTasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-02', end: '2026-02-04' }),
      createTask({
        id: 'task-b',
        start: '2026-02-05',
        end: '2026-02-08',
        dependsOn: ['task-a'],
      }),
    ]
    const afterTasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-03', end: '2026-02-06' }),
      createTask({
        id: 'task-b',
        start: '2026-02-05',
        end: '2026-02-08',
        dependsOn: ['task-a'],
      }),
    ]

    const result = evaluateInteractionCommit({
      beforeTasks,
      afterTasks,
      taskId: 'task-a',
    })

    expect(result.shouldApply).toBe(false)
    expect(result.shouldRecordHistory).toBe(false)
    expect(result.conflict?.isValid).toBe(false)
  })

  it('records history only for valid timeline changes', () => {
    const beforeTasks: Task[] = [
      createTask({ id: 'task-a', start: '2026-02-02', end: '2026-02-04' }),
      createTask({
        id: 'task-b',
        start: '2026-02-05',
        end: '2026-02-08',
        dependsOn: ['task-a'],
      }),
    ]
    const noChangeResult = evaluateInteractionCommit({
      beforeTasks,
      afterTasks: beforeTasks.map((task) => ({ ...task })),
      taskId: 'task-a',
    })
    const validChangeResult = evaluateInteractionCommit({
      beforeTasks,
      afterTasks: [
        createTask({ id: 'task-a', start: '2026-02-03', end: '2026-02-05' }),
        createTask({
          id: 'task-b',
          start: '2026-02-05',
          end: '2026-02-08',
          dependsOn: ['task-a'],
        }),
      ],
      taskId: 'task-a',
    })

    expect(noChangeResult.shouldApply).toBe(true)
    expect(noChangeResult.shouldRecordHistory).toBe(false)
    expect(validChangeResult.shouldApply).toBe(true)
    expect(validChangeResult.shouldRecordHistory).toBe(true)
  })
})
