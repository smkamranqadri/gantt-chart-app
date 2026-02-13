import type { LegacyTask, TaskV2 } from '../types/gantt'

const dedupeDependencies = (dependencyIds: string[]) => {
  const seen = new Set<string>()

  return dependencyIds.filter((dependencyId) => {
    if (seen.has(dependencyId)) return false
    seen.add(dependencyId)
    return true
  })
}

export const normalizeTask = (
  task: LegacyTask,
  knownTaskIds: ReadonlySet<string>,
): TaskV2 => {
  const rawDependencies = task.dependsOn ?? []
  const dependencies = dedupeDependencies(
    rawDependencies.filter(
      (dependencyId) =>
        dependencyId !== task.id && knownTaskIds.has(dependencyId),
    ),
  )

  return {
    id: task.id,
    title: task.title,
    laneId: task.laneId,
    start: task.start,
    end: task.end,
    kind: task.kind ?? 'task',
    dependsOn: dependencies,
  }
}

export const normalizeTasks = (tasks: readonly LegacyTask[]): TaskV2[] => {
  const knownTaskIds = new Set(tasks.map((task) => task.id))
  return tasks.map((task) => normalizeTask(task, knownTaskIds))
}
