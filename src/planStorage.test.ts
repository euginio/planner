import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deletePlan, PLAN_NAMES_STORAGE_KEY } from './planStorage'

describe('plan storage operations', () => {
   beforeEach(() => localStorage.clear())

   it('deletes a plan index entry and all task lists', () => {
      localStorage.setItem(PLAN_NAMES_STORAGE_KEY, JSON.stringify(['Today', 'Later']))
      localStorage.setItem('Today.todos', JSON.stringify([{ id: 1 }]))
      localStorage.setItem('Today.done', JSON.stringify([]))
      localStorage.setItem('Later.todos', JSON.stringify([{ id: 1 }]))

      expect(deletePlan(localStorage, 'Today', ['Today', 'Later'], ['todos', 'done'])).toEqual([
         'Later',
      ])
      expect(localStorage.getItem(PLAN_NAMES_STORAGE_KEY)).toBe(JSON.stringify(['Later']))
      expect(localStorage.getItem('Today.todos')).toBeNull()
      expect(localStorage.getItem('Today.done')).toBeNull()
      expect(localStorage.getItem('Later.todos')).not.toBeNull()
   })

   it('restores plan names and list data if deletion fails partway through', () => {
      localStorage.setItem(PLAN_NAMES_STORAGE_KEY, JSON.stringify(['Today']))
      localStorage.setItem('Today.todos', JSON.stringify([{ id: 1 }]))
      localStorage.setItem('Today.done', JSON.stringify([]))
      const removeItem = vi.fn((key: string) => localStorage.removeItem(key))
      let failed = false
      const storage = {
         getItem: (key: string) => localStorage.getItem(key),
         setItem: (key: string, value: string) => localStorage.setItem(key, value),
         removeItem: (key: string) => {
            if (key === 'Today.done' && !failed) {
               failed = true
               throw new Error('storage unavailable')
            }
            removeItem(key)
         },
      } as Storage

      expect(() => deletePlan(storage, 'Today', ['Today'], ['todos', 'done'])).toThrow(
         'Could not delete plan'
      )
      expect(localStorage.getItem(PLAN_NAMES_STORAGE_KEY)).toBe(JSON.stringify(['Today']))
      expect(localStorage.getItem('Today.todos')).toBe(JSON.stringify([{ id: 1 }]))
      expect(localStorage.getItem('Today.done')).toBe(JSON.stringify([]))
   })
})
