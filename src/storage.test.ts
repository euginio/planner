import { beforeEach, describe, expect, it } from 'vitest'
import { isSheetNameList, isTaskList, readStoredJson, writeStoredJson } from './storage'

describe('validated local storage access', () => {
   beforeEach(() => {
      localStorage.clear()
   })

   it('returns a fallback only when the value is not present', () => {
      expect(readStoredJson(localStorage, 'missing', [], isTaskList)).toEqual([])
   })

   it('rejects malformed JSON and unexpected data shapes', () => {
      localStorage.setItem('plans', '{broken')
      expect(() => readStoredJson(localStorage, 'plans', [], isSheetNameList)).toThrow(
         'Could not parse saved data "plans"'
      )

      localStorage.setItem('plans', JSON.stringify(['Today', 4]))
      expect(() => readStoredJson(localStorage, 'plans', [], isSheetNameList)).toThrow(
         'its format is invalid'
      )

      localStorage.setItem('tasks', JSON.stringify([{ id: 1, text: 'Incomplete' }]))
      expect(() => readStoredJson(localStorage, 'tasks', [], isTaskList)).toThrow(
         'its format is invalid'
      )
   })

   it('validates plan names and task records', () => {
      expect(isSheetNameList(['Today', 'Backlog'])).toBe(true)
      expect(isSheetNameList(['Today', 'Today'])).toBe(false)
      expect(
         isTaskList([
            {
               id: 1,
               focus: false,
               text: 'Write report',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      ).toBe(true)
   })

   it('rejects task records with duplicate IDs within a list', () => {
      const duplicateTasks = [
         {
            id: 1,
            focus: false,
            text: 'First task',
            done: false,
            size: 1,
            impact: 1,
            indentation: 0,
         },
         {
            id: 1,
            focus: false,
            text: 'Second task',
            done: false,
            size: 1,
            impact: 1,
            indentation: 0,
         },
      ]

      expect(isTaskList(duplicateTasks)).toBe(false)
      localStorage.setItem('Today.todos', JSON.stringify(duplicateTasks))
      expect(() =>
         readStoredJson(localStorage, 'Today.todos', [], isTaskList)
      ).toThrow('its format is invalid')
   })

   it('rejects invalid task IDs, sizes, indentation, and multiple focused tasks', () => {
      const validTask = {
         id: 1,
         focus: false,
         text: 'Task',
         done: false,
         size: 1,
         impact: 1,
         indentation: 0,
      }
      const invalidLists = [
         [{ ...validTask, id: 0 }],
         [{ ...validTask, id: 1.5 }],
         [{ ...validTask, size: 0 }],
         [{ ...validTask, size: 1.5 }],
         [{ ...validTask, indentation: -1 }],
         [{ ...validTask, indentation: 0.5 }],
         [{ ...validTask, focus: true }, { ...validTask, id: 2, focus: true }],
      ]

      for (const tasks of invalidLists) {
         expect(isTaskList(tasks)).toBe(false)
         localStorage.setItem('Today.todos', JSON.stringify(tasks))
         expect(() => readStoredJson(localStorage, 'Today.todos', [], isTaskList)).toThrow(
            'its format is invalid'
         )
      }
   })

   it('reports write failures instead of hiding them', () => {
      const storage: Storage = {
         length: 0,
         clear: () => {},
         getItem: () => null,
         key: () => null,
         removeItem: () => {},
         setItem: (_key, _value) => {
            throw new Error('Storage is full')
         },
      }

      expect(() => writeStoredJson(storage, 'Today.todos', [])).toThrow(
         'Could not save data "Today.todos": Storage is full'
      )
   })
})
