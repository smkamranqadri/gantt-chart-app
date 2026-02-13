import type { TaskV2 } from '../types/gantt'

export type ValidationResult = {
  isValid: boolean
  reasons: string[]
}

export type TopoSortResult = {
  orderedTaskIds: string[]
  hasCycle: boolean
  cycleNodeIds: string[]
}

const compareTaskOrder = (
  leftId: string,
  rightId: string,
  taskById: ReadonlyMap<string, TaskV2>,
) => {
  const leftTask = taskById.get(leftId)
  const rightTask = taskById.get(rightId)

  if (!leftTask || !rightTask) return leftId.localeCompare(rightId)

  if (leftTask.start !== rightTask.start) {
    return leftTask.start.localeCompare(rightTask.start)
  }

  return leftId.localeCompare(rightId)
}

export const buildAdjacencyMap = (
  tasks: readonly TaskV2[],
): Map<string, string[]> => {
  const taskIds = new Set(tasks.map((task) => task.id))
  const successors = new Map<string, Set<string>>()

  tasks.forEach((task) => {
    successors.set(task.id, new Set())
  })

  tasks.forEach((task) => {
    task.dependsOn.forEach((dependencyId) => {
      if (!taskIds.has(dependencyId)) return
      successors.get(dependencyId)?.add(task.id)
    })
  })

  return new Map(
    Array.from(successors.entries()).map(([taskId, nextIds]) => [
      taskId,
      Array.from(nextIds).sort((left, right) => left.localeCompare(right)),
    ]),
  )
}

export const isSelfDependency = (taskId: string, dependencyId: string) => {
  return taskId === dependencyId
}

const hasPath = (
  adjacency: ReadonlyMap<string, string[]>,
  startTaskId: string,
  targetTaskId: string,
) => {
  if (startTaskId === targetTaskId) return true

  const queue = [startTaskId]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const currentId = queue.shift()
    if (!currentId || visited.has(currentId)) continue
    visited.add(currentId)

    if (currentId === targetTaskId) return true

    const neighbors = adjacency.get(currentId) ?? []
    neighbors.forEach((neighborId) => {
      if (!visited.has(neighborId)) queue.push(neighborId)
    })
  }

  return false
}

export const wouldCreateCycle = (
  tasks: readonly TaskV2[],
  fromTaskId: string,
  toTaskId: string,
) => {
  if (isSelfDependency(fromTaskId, toTaskId)) return true

  const taskIds = new Set(tasks.map((task) => task.id))
  if (!taskIds.has(fromTaskId) || !taskIds.has(toTaskId)) return false

  const adjacency = buildAdjacencyMap(tasks)
  const nextIds = new Set(adjacency.get(fromTaskId) ?? [])
  nextIds.add(toTaskId)
  adjacency.set(fromTaskId, Array.from(nextIds))

  return hasPath(adjacency, toTaskId, fromTaskId)
}

export const topologicalSortTasks = (
  tasks: readonly TaskV2[],
): TopoSortResult => {
  const taskById = new Map(tasks.map((task) => [task.id, task]))
  const adjacency = buildAdjacencyMap(tasks)
  const indegree = new Map<string, number>()

  tasks.forEach((task) => {
    indegree.set(task.id, 0)
  })

  adjacency.forEach((nextIds) => {
    nextIds.forEach((nextId) => {
      indegree.set(nextId, (indegree.get(nextId) ?? 0) + 1)
    })
  })

  const queue = tasks
    .map((task) => task.id)
    .filter((taskId) => (indegree.get(taskId) ?? 0) === 0)
    .sort((left, right) => compareTaskOrder(left, right, taskById))

  const orderedTaskIds: string[] = []

  while (queue.length > 0) {
    const currentId = queue.shift()
    if (!currentId) continue

    orderedTaskIds.push(currentId)

    const nextIds = adjacency.get(currentId) ?? []
    nextIds.forEach((nextId) => {
      const nextIndegree = (indegree.get(nextId) ?? 0) - 1
      indegree.set(nextId, nextIndegree)

      if (nextIndegree === 0) {
        queue.push(nextId)
        queue.sort((left, right) => compareTaskOrder(left, right, taskById))
      }
    })
  }

  const hasCycle = orderedTaskIds.length !== tasks.length
  const cycleNodeIds = hasCycle
    ? tasks
        .map((task) => task.id)
        .filter((taskId) => (indegree.get(taskId) ?? 0) > 0)
        .sort((left, right) => compareTaskOrder(left, right, taskById))
    : []

  return {
    orderedTaskIds,
    hasCycle,
    cycleNodeIds,
  }
}

export const validateTaskGraph = (
  tasks: readonly TaskV2[],
): ValidationResult => {
  const reasons: string[] = []

  tasks.forEach((task) => {
    if (task.dependsOn.includes(task.id)) {
      reasons.push(`Task "${task.id}" contains a self dependency.`)
    }
  })

  const topoResult = topologicalSortTasks(tasks)
  if (topoResult.hasCycle) {
    reasons.push(
      `Dependency graph contains cycle(s) involving: ${topoResult.cycleNodeIds.join(
        ', ',
      )}`,
    )
  }

  return {
    isValid: reasons.length === 0,
    reasons,
  }
}
