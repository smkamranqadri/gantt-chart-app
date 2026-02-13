import { daysBetween } from './date'
import { topologicalSortTasks, validateTaskGraph } from './dependencyGraph'
import type { CriticalPathResult, Task } from '../types/gantt'

export type CriticalPathComputation = {
  result: CriticalPathResult | null
  warning: string | null
}

const compareTaskByStartThenId = (
  leftId: string,
  rightId: string,
  taskById: ReadonlyMap<string, Task>,
) => {
  const leftTask = taskById.get(leftId)
  const rightTask = taskById.get(rightId)

  if (!leftTask || !rightTask) return leftId.localeCompare(rightId)

  if (leftTask.start !== rightTask.start) {
    return leftTask.start.localeCompare(rightTask.start)
  }

  return leftId.localeCompare(rightId)
}

const comparePathTieBreak = (
  leftPath: readonly string[],
  rightPath: readonly string[],
  taskById: ReadonlyMap<string, Task>,
) => {
  const limit = Math.min(leftPath.length, rightPath.length)

  for (let index = 0; index < limit; index += 1) {
    const difference = compareTaskByStartThenId(
      leftPath[index],
      rightPath[index],
      taskById,
    )

    if (difference !== 0) return difference
  }

  return leftPath.length - rightPath.length
}

export const getTaskDurationDays = (task: Task) => {
  if (task.kind === 'milestone') return 0
  return Math.max(1, daysBetween(task.start, task.end) + 1)
}

export const computeCriticalPath = (
  tasks: readonly Task[],
): CriticalPathComputation => {
  if (tasks.length === 0) {
    return { result: null, warning: null }
  }

  const graphValidation = validateTaskGraph(tasks)
  if (!graphValidation.isValid) {
    return {
      result: null,
      warning:
        graphValidation.reasons[0] ??
        'Dependency graph is invalid for critical path computation.',
    }
  }

  const taskById = new Map(tasks.map((task) => [task.id, task]))
  const topoSortResult = topologicalSortTasks(tasks)

  const bestDurationById = new Map<string, number>()
  const bestPathById = new Map<string, string[]>()

  let bestOverallPath: string[] = []
  let bestOverallDuration = -1

  topoSortResult.orderedTaskIds.forEach((taskId) => {
    const task = taskById.get(taskId)
    if (!task) return

    let bestPredecessorDuration = 0
    let bestPredecessorPath: string[] | null = null

    task.dependsOn.forEach((predecessorId) => {
      if (!taskById.has(predecessorId)) return

      const candidateDuration = bestDurationById.get(predecessorId) ?? 0
      const candidatePath = bestPathById.get(predecessorId) ?? []

      const shouldUseCandidate =
        bestPredecessorPath === null ||
        candidateDuration > bestPredecessorDuration ||
        (candidateDuration === bestPredecessorDuration &&
          comparePathTieBreak(candidatePath, bestPredecessorPath, taskById) < 0)

      if (shouldUseCandidate) {
        bestPredecessorDuration = candidateDuration
        bestPredecessorPath = [...candidatePath]
      }
    })

    const currentDuration = bestPredecessorDuration + getTaskDurationDays(task)
    const currentPath = [...(bestPredecessorPath ?? []), task.id]

    bestDurationById.set(task.id, currentDuration)
    bestPathById.set(task.id, currentPath)

    const shouldUseAsOverall =
      currentDuration > bestOverallDuration ||
      (currentDuration === bestOverallDuration &&
        comparePathTieBreak(currentPath, bestOverallPath, taskById) < 0)

    if (shouldUseAsOverall) {
      bestOverallDuration = currentDuration
      bestOverallPath = currentPath
    }
  })

  if (bestOverallPath.length === 0) {
    return { result: null, warning: null }
  }

  return {
    result: {
      orderedTaskIds: bestOverallPath,
      totalDays: bestOverallDuration,
    },
    warning: null,
  }
}
