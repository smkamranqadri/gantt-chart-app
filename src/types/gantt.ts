export type LaneId = 'backend' | 'frontend' | 'qa'

export type Task = {
  id: string
  title: string
  laneId: LaneId
  start: string
  end: string
}
