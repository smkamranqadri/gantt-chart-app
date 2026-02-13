export type LaneId = 'backend' | 'frontend' | 'qa'

type TaskBase = {
  id: string
  title: string
  laneId: LaneId
  start: string
  end: string
}

export type TaskKind = 'task' | 'milestone'

export type DependencyType = 'finish_to_start'

export type LegacyTask = TaskBase & {
  kind?: TaskKind
  dependsOn?: string[]
}

export type TaskV2 = TaskBase & {
  kind: TaskKind
  dependsOn: string[]
}

export type DependencyEdge = {
  fromTaskId: string
  toTaskId: string
  type: DependencyType
}

export type CriticalPathResult = {
  orderedTaskIds: string[]
  totalDays: number
}

export type Task = TaskV2
