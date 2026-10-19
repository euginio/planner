import type { Task } from './stories/List'

export type EditableTaskField = 'indentation' | 'size' | 'text' | 'done'

export function updateTaskField<K extends EditableTaskField>(
   tasks: Task[],
   id: number,
   field: K,
   value: Task[K]
): Task[] {
   if (!tasks.some(task => task.id === id)) return tasks
   return tasks.map(task => (task.id === id ? { ...task, [field]: value } : task))
}

export function clearTaskFocus(tasks: Task[]): Task[] {
   if (!tasks.some(task => task.focus)) return tasks
   return tasks.map(task => (task.focus ? { ...task, focus: false } : task))
}

export function focusTask(tasks: Task[], id: number): Task[] {
   if (!tasks.some(task => task.id === id)) return tasks
   if (tasks.every(task => task.focus === (task.id === id))) return tasks
   return tasks.map(task =>
      task.focus === (task.id === id) ? task : { ...task, focus: task.id === id }
   )
}

export function insertTask(
   tasks: Task[],
   taskToInsert: Task,
   fromId?: number,
   position: number = 1
): Task[] {
   if (fromId === undefined) {
      return position === -1 ? [...tasks, taskToInsert] : [taskToInsert, ...tasks]
   }

   const fromIndex = tasks.findIndex(task => task.id === fromId)
   if (fromIndex < 0) return tasks

   const sourceTask = tasks[fromIndex]
   const nextTasks = [...tasks]
   nextTasks[fromIndex] = { ...sourceTask, focus: false }
   nextTasks.splice(fromIndex + position, 0, {
      ...taskToInsert,
      indentation: sourceTask.indentation,
   })
   return nextTasks
}

export function removeTaskAndFocusNeighbor(tasks: Task[], id: number): Task[] {
   const removedIndex = tasks.findIndex(task => task.id === id)
   if (removedIndex < 0) return tasks

   const remainingTasks = tasks.filter(task => task.id !== id)
   if (remainingTasks.length === 0) return remainingTasks

   const nextFocusIndex = Math.min(removedIndex, remainingTasks.length - 1)
   return focusTask(remainingTasks, remainingTasks[nextFocusIndex].id)
}
