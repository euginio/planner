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
