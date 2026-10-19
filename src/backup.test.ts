import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBackup, importBackup } from './backup'

const listNames = ['todos', 'backlog']
const task = {
   id: 1,
   focus: false,
   text: 'Write report',
   done: false,
   size: 1,
   impact: 1,
   indentation: 0,
}

describe('plan backups', () => {
   beforeEach(() => {
      localStorage.clear()
   })

   it('exports all plans and their saved task lists in a versioned backup', () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem('Today.todos', JSON.stringify([task]))

      const backup = JSON.parse(createBackup(localStorage, ['Today'], listNames))

      expect(backup).toMatchObject({
         format: 'daymark-backup',
         version: 1,
         plans: [
            {
               name: 'Today',
               lists: { todos: [task], backlog: [] },
            },
         ],
      })
      expect(Number.isNaN(Date.parse(backup.exportedAt))).toBe(false)
   })

   it('replaces matching plans while keeping unrelated plans', () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today', 'Later']))
      localStorage.setItem('Today.todos', JSON.stringify([{ ...task, text: 'Old task' }]))
      localStorage.setItem('Later.todos', JSON.stringify([{ ...task, text: 'Keep this' }]))
      const backup = JSON.stringify({
         format: 'daymark-backup',
         version: 1,
         exportedAt: '2026-10-14T00:00:00.000Z',
         plans: [
            { name: 'Today', lists: { todos: [task], backlog: [] } },
            { name: 'New', lists: { todos: [], backlog: [] } },
         ],
      })

      const sheets = importBackup(backup, localStorage, ['Today', 'Later'], listNames)

      expect(sheets).toEqual(['Today', 'Later', 'New'])
      expect(JSON.parse(localStorage.getItem('Today.todos') || '[]')).toEqual([task])
      expect(JSON.parse(localStorage.getItem('Today.backlog') || '[]')).toEqual([])
      expect(JSON.parse(localStorage.getItem('Later.todos') || '[]')[0].text).toBe('Keep this')
      expect(JSON.parse(localStorage.getItem('New.todos') || '[]')).toEqual([])
      expect(JSON.parse(localStorage.getItem('App.Sheets') || '[]')).toEqual(sheets)
   })

   it('rejects invalid backups without changing stored plans', () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem('Today.todos', JSON.stringify([task]))
      const originalSheets = localStorage.getItem('App.Sheets')
      const originalTasks = localStorage.getItem('Today.todos')

      expect(() => importBackup('{bad json', localStorage, ['Today'], listNames)).toThrow(
         'not valid JSON'
      )
      expect(() =>
         importBackup(
            JSON.stringify({
               format: 'daymark-backup',
               version: 1,
               plans: [
                  {
                     name: 'Today',
                     lists: { todos: [{ text: 'Malformed task' }], backlog: [] },
                  },
               ],
            }),
            localStorage,
            ['Today'],
            listNames
         )
      ).toThrow('valid task list')
      expect(() =>
         importBackup(
            JSON.stringify({
               format: 'daymark-backup',
               version: 1,
               plans: [{ name: 'Today', lists: { todos: [task] } }],
            }),
            localStorage,
            ['Today'],
            listNames
         )
      ).toThrow('missing task list')

      expect(localStorage.getItem('App.Sheets')).toBe(originalSheets)
      expect(localStorage.getItem('Today.todos')).toBe(originalTasks)
   })

   it('rejects duplicate plan names before writing anything', () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem('Today.todos', JSON.stringify([task]))
      const backup = JSON.stringify({
         format: 'daymark-backup',
         version: 1,
         plans: [
            { name: 'New', lists: { todos: [], backlog: [] } },
            { name: 'New', lists: { todos: [], backlog: [] } },
         ],
      })

      expect(() => importBackup(backup, localStorage, ['Today'], listNames)).toThrow(
         'duplicate plan name "New"'
      )
      expect(localStorage.getItem('App.Sheets')).toBe(JSON.stringify(['Today']))
      expect(localStorage.getItem('Today.todos')).toBe(JSON.stringify([task]))
      expect(localStorage.getItem('New.todos')).toBeNull()
   })

   it('rejects task lists that violate task invariants at the backup boundary', () => {
      const invalidLists = [
         [{ ...task, id: 0 }],
         [{ ...task, id: 1.5 }],
         [{ ...task, size: 0 }],
         [{ ...task, indentation: -1 }],
         [{ ...task, focus: true }, { ...task, id: 2, focus: true }],
         [task, { ...task, text: 'Second task' }],
      ]

      for (const todos of invalidLists) {
         const backup = JSON.stringify({
            format: 'daymark-backup',
            version: 1,
            plans: [{ name: 'Today', lists: { todos, backlog: [] } }],
         })

         expect(() => importBackup(backup, localStorage, [], listNames)).toThrow(
            'valid task list'
         )
         expect(localStorage.getItem('App.Sheets')).toBeNull()
         expect(localStorage.getItem('Today.todos')).toBeNull()
      }
   })

   it('rolls back all stored values when a write fails midway through import', () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem('Today.todos', JSON.stringify([{ ...task, text: 'Original' }]))
      localStorage.setItem('Today.backlog', JSON.stringify([]))
      const originalSheets = localStorage.getItem('App.Sheets')
      const originalTodos = localStorage.getItem('Today.todos')
      const originalBacklog = localStorage.getItem('Today.backlog')
      const backup = JSON.stringify({
         format: 'daymark-backup',
         version: 1,
         plans: [
            { name: 'Today', lists: { todos: [task], backlog: [] } },
            { name: 'New', lists: { todos: [], backlog: [] } },
         ],
      })
      const setItem = vi.fn((key: string, value: string) => {
         localStorage.setItem(key, value)
      })
      let failed = false
      const storage = {
         getItem: (key: string) => localStorage.getItem(key),
         setItem: (key: string, value: string) => {
            if (key === 'New.backlog' && !failed) {
               failed = true
               throw new Error('quota exceeded')
            }
            setItem(key, value)
         },
         removeItem: (key: string) => localStorage.removeItem(key),
      } as Storage

      expect(() => importBackup(backup, storage, ['Today'], listNames)).toThrow(
         'Import failed'
      )
      expect(localStorage.getItem('App.Sheets')).toBe(originalSheets)
      expect(localStorage.getItem('Today.todos')).toBe(originalTodos)
      expect(localStorage.getItem('Today.backlog')).toBe(originalBacklog)
      expect(localStorage.getItem('New.todos')).toBeNull()
      expect(localStorage.getItem('New.backlog')).toBeNull()
   })
})
