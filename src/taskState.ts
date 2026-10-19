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
