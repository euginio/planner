import { beforeEach, describe, expect, it } from 'vitest'
import {
   migrateStorage,
   STORAGE_SCHEMA_VERSION,
   STORAGE_SCHEMA_VERSION_KEY,
} from './storageMigrations'

const validTask = {
   id: 1,
   focus: true,
   text: 'Keep this task',
   done: false,
   size: 1,
   impact: 1,
   indentation: 0,
}

describe('local storage migrations', () => {
   beforeEach(() => localStorage.clear())

   it('marks valid unversioned plan data as the current schema without rewriting it', () => {
      const originalTasks = JSON.stringify([validTask])
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem('Today.todos', originalTasks)

      migrateStorage(localStorage)

      expect(localStorage.getItem(STORAGE_SCHEMA_VERSION_KEY)).toBe(
         JSON.stringify(STORAGE_SCHEMA_VERSION)
      )
      expect(localStorage.getItem('Today.todos')).toBe(originalTasks)
      expect(localStorage.getItem('Today.done')).toBeNull()
   })

   it('leaves a malformed plan index untouched and does not mark it migrated', () => {
      const malformed = '{broken'
      localStorage.setItem('App.Sheets', malformed)

      expect(() => migrateStorage(localStorage)).toThrow('Could not parse saved data')
      expect(localStorage.getItem('App.Sheets')).toBe(malformed)
      expect(localStorage.getItem(STORAGE_SCHEMA_VERSION_KEY)).toBeNull()
   })

   it('does not rewrite or hide malformed task data during the index migration', () => {
      const malformed = '[{"id":"invalid"}]'
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem('Today.todos', malformed)

      expect(() => migrateStorage(localStorage)).not.toThrow()
      expect(localStorage.getItem('Today.todos')).toBe(malformed)
      expect(localStorage.getItem(STORAGE_SCHEMA_VERSION_KEY)).toBe('1')
   })

   it('refuses a newer schema without changing stored values', () => {
      localStorage.setItem(STORAGE_SCHEMA_VERSION_KEY, JSON.stringify(STORAGE_SCHEMA_VERSION + 1))
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      const originalPlans = localStorage.getItem('App.Sheets')

      expect(() => migrateStorage(localStorage)).toThrow('newer schema')
      expect(localStorage.getItem('App.Sheets')).toBe(originalPlans)
      expect(localStorage.getItem(STORAGE_SCHEMA_VERSION_KEY)).toBe(
         JSON.stringify(STORAGE_SCHEMA_VERSION + 1)
      )
   })
})
