import { describe, expect, it } from 'vitest'
import { Task } from './stories/List'
import { updateTaskField } from './taskState'

const task = (id: number, text: string): Task => ({
   id,
   focus: false,
   text,
   done: false,
   size: 1,
   impact: 1,
   indentation: 0,
})

describe('task state updates', () => {
   it('updates a task without mutating the prior list or task object', () => {
      const firstTask = task(1, 'Write report')
      const secondTask = task(2, 'Review notes')
      const previous = [firstTask, secondTask]

      const updated = updateTaskField(previous, 1, 'text', 'Send report')

      expect(updated).not.toBe(previous)
      expect(updated[0]).not.toBe(firstTask)
      expect(updated[1]).toBe(secondTask)
      expect(firstTask.text).toBe('Write report')
      expect(previous).toEqual([firstTask, secondTask])
      expect(updated[0].text).toBe('Send report')
   })

   it('leaves the list unchanged when the task ID is missing', () => {
      const previous = [task(1, 'Write report')]

      const updated = updateTaskField(previous, 2, 'done', true)

      expect(updated).toBe(previous)
      expect(updated).toEqual(previous)
      expect(updated[0]).toBe(previous[0])
   })
})
