import { describe, expect, it } from 'vitest'
import { Task } from './stories/List'
import {
   clearTaskFocus,
   focusTask,
   insertTask,
   removeTaskAndFocusNeighbor,
   updateTaskField,
} from './taskState'

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

   it('clears focus without mutating task objects from the previous state', () => {
      const focusedTask = { ...task(1, 'Write report'), focus: true }
      const otherTask = task(2, 'Review notes')
      const previous = [focusedTask, otherTask]

      const updated = clearTaskFocus(previous)

      expect(updated).not.toBe(previous)
      expect(updated[0]).not.toBe(focusedTask)
      expect(updated[1]).toBe(otherTask)
      expect(focusedTask.focus).toBe(true)
      expect(updated.map(item => item.focus)).toEqual([false, false])
   })

   it('focuses a task without mutating the previous state', () => {
      const firstTask = task(1, 'Write report')
      const secondTask = task(2, 'Review notes')
      const previous = [firstTask, secondTask]

      const updated = focusTask(previous, 2)

      expect(updated).not.toBe(previous)
      expect(updated[0]).toBe(firstTask)
      expect(updated[1]).not.toBe(secondTask)
      expect(previous.map(item => item.focus)).toEqual([false, false])
      expect(updated.map(item => item.focus)).toEqual([false, true])
   })

   it('inserts after a task without mutating the source array or source task', () => {
      const sourceTask = { ...task(1, 'Parent task'), focus: true, indentation: 2 }
      const otherTask = task(2, 'Existing task')
      const previous = [sourceTask, otherTask]
      const insertedTask = { ...task(3, 'Child task'), focus: true }

      const updated = insertTask(previous, insertedTask, sourceTask.id, 1)

      expect(updated).not.toBe(previous)
      expect(updated.map(item => item.text)).toEqual([
         'Parent task',
         'Child task',
         'Existing task',
      ])
      expect(updated[0]).not.toBe(sourceTask)
      expect(updated[2]).toBe(otherTask)
      expect(updated[1].indentation).toBe(2)
      expect(sourceTask.focus).toBe(true)
      expect(previous).toEqual([sourceTask, otherTask])
   })

   it('removes a task and focuses its neighbor without mutating prior tasks', () => {
      const firstTask = { ...task(1, 'First task'), focus: true }
      const removedTask = task(2, 'Remove this')
      const nextTask = task(3, 'Next task')
      const previous = [firstTask, removedTask, nextTask]

      const updated = removeTaskAndFocusNeighbor(previous, 2)

      expect(updated.map(item => item.text)).toEqual(['First task', 'Next task'])
      expect(updated.map(item => item.focus)).toEqual([false, true])
      expect(previous.map(item => item.focus)).toEqual([true, false, false])
      expect(firstTask.focus).toBe(true)
      expect(nextTask.focus).toBe(false)
   })
})
