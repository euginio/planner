import type { TaskI } from './List'

export interface TaskItemHandlers {
   setIndentation(id: number, value: number): void
   setSize(id: number, value: number): void
   setText(id: number, value: string): void
   setDone(id: number, value: boolean): void
   reorderTask(sourceId: number, targetId: number, insertAfter: boolean): void
   handleOnItemClick(id: number): void
}

export interface NavigableHandlers {
   addTask(aboveId: number, positions: number): void
   moveUp(id: number): void
   moveDown(id: number): void
   focusOnFirst(): void
   focusOnLast(): void
   focusUp(id: number): void
   focusDown(id: number): void
}

export interface SheetHandlers {
   taskMoved(): void
   add(items: TaskI[], targetTaskList: string | null, position?: number): void
}

export interface TaskListMovement {
   targetTaskList: string | null
   tasksToMove: TaskI[]
   position: number
}
