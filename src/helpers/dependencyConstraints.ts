import type { Task } from '../types/gantt'

export type DependencyConstraintViolation = {
  predecessorId: string
  successorId: string
  predecessorEnd: string
  successorStart: string
}

export type DependencyConstraintValidation = {
  isValid: boolean
  violations: DependencyConstraintViolation[]
  conflictingTaskIds: string[]
  reason: string | null
}

type ValidateDependencyScheduleInput = {
  tasks: readonly Task[]
  changedTaskId?: string | null
  taskLabelById?: ReadonlyMap<string, string>
}

type EvaluateInteractionCommitInput = {
  beforeTasks: readonly Task[]
  afterTasks: readonly Task[]
  taskId: string
  taskLabelById?: ReadonlyMap<string, string>
}

const sortViolations = (
  left: DependencyConstraintViolation,
  right: DependencyConstraintViolation,
) => {
  if (left.successorStart !== right.successorStart) {
    return left.successorStart.localeCompare(right.successorStart)
  }
  if (left.successorId !== right.successorId) {
    return left.successorId.localeCompare(right.successorId)
  }
  return left.predecessorId.localeCompare(right.predecessorId)
}

const formatViolationReason = (
  violation: DependencyConstraintViolation,
  taskLabelById?: ReadonlyMap<string, string>,
) => {
  const predecessorLabel =
    taskLabelById?.get(violation.predecessorId) ?? violation.predecessorId
  const successorLabel =
    taskLabelById?.get(violation.successorId) ?? violation.successorId

  return `${predecessorLabel} ends on ${violation.predecessorEnd}, after ${successorLabel} starts on ${violation.successorStart}.`
}

export const getDependencyConstraintViolations = (
  tasks: readonly Task[],
): DependencyConstraintViolation[] => {
  const taskById = new Map(tasks.map((task) => [task.id, task]))
  const violations: DependencyConstraintViolation[] = []

  tasks.forEach((successor) => {
    successor.dependsOn.forEach((dependencyId) => {
      const predecessor = taskById.get(dependencyId)
      if (!predecessor) return
      if (predecessor.end <= successor.start) return

      violations.push({
        predecessorId: predecessor.id,
        successorId: successor.id,
        predecessorEnd: predecessor.end,
        successorStart: successor.start,
      })
    })
  })

  return violations.sort(sortViolations)
}

export const validateDependencySchedule = ({
  tasks,
  changedTaskId = null,
  taskLabelById,
}: ValidateDependencyScheduleInput): DependencyConstraintValidation => {
  const allViolations = getDependencyConstraintViolations(tasks)
  const relevantViolations =
    changedTaskId === null
      ? allViolations
      : allViolations.filter(
          (violation) =>
            violation.predecessorId === changedTaskId ||
            violation.successorId === changedTaskId,
        )
  const conflictingTaskIds = Array.from(
    new Set(
      relevantViolations.flatMap((violation) => [
        violation.predecessorId,
        violation.successorId,
      ]),
    ),
  )

  return {
    isValid: relevantViolations.length === 0,
    violations: relevantViolations,
    conflictingTaskIds,
    reason:
      relevantViolations.length > 0
        ? formatViolationReason(relevantViolations[0], taskLabelById)
        : null,
  }
}

export const didTaskTimelineChange = ({
  beforeTasks,
  afterTasks,
  taskId,
}: {
  beforeTasks: readonly Task[]
  afterTasks: readonly Task[]
  taskId: string
}) => {
  const beforeTask = beforeTasks.find((task) => task.id === taskId)
  const afterTask = afterTasks.find((task) => task.id === taskId)
  if (!beforeTask || !afterTask) return false

  return (
    beforeTask.start !== afterTask.start ||
    beforeTask.end !== afterTask.end ||
    beforeTask.laneId !== afterTask.laneId
  )
}

export const evaluateInteractionCommit = ({
  beforeTasks,
  afterTasks,
  taskId,
  taskLabelById,
}: EvaluateInteractionCommitInput) => {
  const timelineChanged = didTaskTimelineChange({
    beforeTasks,
    afterTasks,
    taskId,
  })
  if (!timelineChanged) {
    return {
      shouldApply: true,
      shouldRecordHistory: false,
      conflict: null,
    }
  }

  const constraintValidation = validateDependencySchedule({
    tasks: afterTasks,
    changedTaskId: taskId,
    taskLabelById,
  })
  if (!constraintValidation.isValid) {
    return {
      shouldApply: false,
      shouldRecordHistory: false,
      conflict: constraintValidation,
    }
  }

  return {
    shouldApply: true,
    shouldRecordHistory: true,
    conflict: null,
  }
}
