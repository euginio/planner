import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const emptyBackupLists = {
   todos: [],
   backlog: [],
   someday: [],
   fixed: [],
   microHabits: [],
   done: [],
   deleted: [],
}
const automaticBackupDateKey = 'App.LastAutomaticBackupDate'
const localDateKey = (date: Date) =>
   `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
   ).padStart(2, '0')}`

describe('App', () => {
   beforeEach(() => {
      localStorage.clear()
      localStorage.setItem(automaticBackupDateKey, localDateKey(new Date()))
   })

   it('creates and opens a plan', () => {
      render(<App />)

      const input = screen.getByRole('textbox', { name: 'New plan name' })
      fireEvent.change(input, { target: { value: 'Today' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
      expect(localStorage.getItem('App.Sheets')).toBe(JSON.stringify(['Today']))

      fireEvent.click(screen.getByRole('button', { name: 'Today' }))
      expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
   })

   it('keeps each plan’s tasks separate when switching plans quickly', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today', 'Later']))
      localStorage.setItem(
         'Today.todos',
         JSON.stringify([
            {
               id: 1,
               focus: true,
               text: 'Plan today',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      localStorage.setItem(
         'Later.todos',
         JSON.stringify([
            {
               id: 1,
               focus: false,
               text: 'Plan later',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      render(<App />)

      const todayInput = await screen.findByDisplayValue('Plan today')
      fireEvent.change(todayInput, { target: { value: 'Updated today' } })
      fireEvent.keyDown(todayInput, { key: 'PageDown', ctrlKey: true })

      expect(await screen.findByRole('heading', { level: 1, name: 'Later' })).toBeInTheDocument()
      expect(await screen.findByDisplayValue('Plan later')).toBeInTheDocument()
      await waitFor(() => {
         expect(JSON.parse(localStorage.getItem('Today.todos') || '[]')[0].text).toBe(
            'Updated today'
         )
      })
      expect(JSON.parse(localStorage.getItem('Later.todos') || '[]')[0].text).toBe('Plan later')
   })

   it('preserves malformed plan data and offers backup recovery', async () => {
      const malformedPlans = '{not json'
      localStorage.setItem('App.Sheets', malformedPlans)
      render(<App />)

      expect(await screen.findByRole('alert')).toHaveTextContent(
         'Import a backup to recover your plans.'
      )
      expect(localStorage.getItem('App.Sheets')).toBe(malformedPlans)
      expect(screen.getByRole('textbox', { name: 'New plan name' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Export backup' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Import backup' })).toBeEnabled()
   })

   it('preserves a malformed task list instead of replacing it with an empty list', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      const malformedTasks = JSON.stringify([{ id: 'invalid', text: 'Keep this raw data' }])
      localStorage.setItem('Today.todos', malformedTasks)
      render(<App />)

      await waitFor(() => {
         expect(screen.getAllByRole('alert').some(alert =>
            alert.textContent?.includes('The saved list was left unchanged.')
         )).toBe(true)
      })
      expect(localStorage.getItem('Today.todos')).toBe(malformedTasks)
   })

   it('ignores list keyboard shortcuts when a list has no focused task', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem(
         'Today.fixed',
         JSON.stringify([
            {
               id: 1,
               focus: false,
               text: 'Reference task',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      render(<App />)

      const copyAllButton = await screen.findByRole('button', { name: 'Copy All' })
      expect(() => fireEvent.keyDown(copyAllButton, { key: 'Delete' })).not.toThrow()
      expect(JSON.parse(localStorage.getItem('Today.fixed') || '[]')[0].text).toBe(
         'Reference task'
      )
   })

   it('reports when task changes cannot be saved', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      const originalSetItem = localStorage.setItem.bind(localStorage)
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
         key,
         value
      ) {
         if (key === 'Today.todos') throw new Error('Storage is full')
         originalSetItem(key, value)
      })

      try {
         render(<App />)
         expect(await screen.findByRole('alert')).toHaveTextContent(
            'Your latest task changes may not be saved.'
         )
         expect(screen.getByRole('alert')).toHaveTextContent('Storage is full')
      } finally {
         setItemSpy.mockRestore()
      }
   })

   it('focuses the first task after opening a plan with no saved tasks', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      render(<App />)

      const taskInput = await screen.findByPlaceholderText('Write a task...')

      expect(taskInput).toHaveFocus()
   })

   it('loads saved tasks, focuses one, and keeps edits after reopening the app', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem(
         'Today.todos',
         JSON.stringify([
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
      )
      const { unmount } = render(<App />)

      const taskInput = await screen.findByDisplayValue('Write report')
      expect(taskInput).toHaveFocus()
      fireEvent.change(taskInput, { target: { value: 'Review report' } })
      expect(JSON.parse(localStorage.getItem('Today.todos') || '[]')[0].text).toBe(
         'Review report'
      )

      unmount()
      render(<App />)

      const reloadedTaskInput = await screen.findByDisplayValue('Review report')
      expect(reloadedTaskInput).toHaveFocus()
   })

   it('persists an empty task list after removing its last task', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem(
         'Today.todos',
         JSON.stringify([
            {
               id: 1,
               focus: true,
               text: '',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      render(<App />)

      const taskInput = await screen.findByPlaceholderText('Write a task...')
      fireEvent.keyDown(taskInput, { key: 'Backspace' })

      expect(localStorage.getItem('Today.todos')).toBe('[]')
   })

   it('persists deletion of the last plan', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem(
         'Today.todos',
         JSON.stringify([
            {
               id: 1,
               focus: false,
               text: 'Old task',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      render(<App />)

      fireEvent.click(await screen.findByRole('button', { name: 'All plans' }))
      fireEvent.click(screen.getByRole('button', { name: 'Delete Today plan' }))

      expect(localStorage.getItem('App.Sheets')).toBe('[]')
      expect(localStorage.getItem('Today.todos')).toBeNull()
   })

   it('imports a backup, replacing matching plans and preserving other plans', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today', 'Later']))
      localStorage.setItem(
         'Today.todos',
         JSON.stringify([
            {
               id: 1,
               focus: false,
               text: 'Old task',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      localStorage.setItem(
         'Later.todos',
         JSON.stringify([
            {
               id: 1,
               focus: false,
               text: 'Keep this task',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      const backupContent = JSON.stringify({
         format: 'daymark-backup',
         version: 1,
         exportedAt: '2026-10-14T00:00:00.000Z',
         plans: [
            {
               name: 'Today',
               lists: {
                  ...emptyBackupLists,
                  todos: [
                     {
                        id: 1,
                        focus: false,
                        text: 'Restored task',
                        done: false,
                        size: 1,
                        impact: 1,
                        indentation: 0,
                     },
                  ],
               },
            },
            { name: 'New plan', lists: { ...emptyBackupLists } },
         ],
      })
      const backup = new File(
         [backupContent],
         'daymark-backup.json',
         { type: 'application/json' }
      )
      Object.defineProperty(backup, 'text', {
         value: async () => backupContent,
      })
      const { container } = render(<App />)

      fireEvent.change(container.querySelector('input[type="file"]')!, {
         target: { files: [backup] },
      })

      expect(await screen.findByRole('status')).toHaveTextContent(
         'Matching plans were replaced; other plans were kept.'
      )
      expect(JSON.parse(localStorage.getItem('App.Sheets') || '[]')).toEqual([
         'Today',
         'Later',
         'New plan',
      ])
      expect(JSON.parse(localStorage.getItem('Today.todos') || '[]')[0].text).toBe(
         'Restored task'
      )
      expect(JSON.parse(localStorage.getItem('Later.todos') || '[]')[0].text).toBe(
         'Keep this task'
      )
      expect(screen.getByRole('button', { name: 'New plan' })).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Today' }))
      expect(await screen.findByDisplayValue('Restored task')).toBeInTheDocument()
   })

   it('downloads a backup file when export is requested', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      const createObjectURL = vi.fn(() => 'blob:daymark-backup')
      const revokeObjectURL = vi.fn()
      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

      try {
         render(<App />)
         fireEvent.click(await screen.findByRole('button', { name: 'Export backup' }))

         expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
         expect(click).toHaveBeenCalledOnce()
         expect(click.mock.contexts[0]).toMatchObject({
            download: expect.stringMatching(/^daymark-backup-\d{4}-\d{2}-\d{2}\.json$/),
            href: 'blob:daymark-backup',
         })
         expect(revokeObjectURL).toHaveBeenCalledWith('blob:daymark-backup')
         expect(screen.getByRole('status')).toHaveTextContent('Backup download started.')
      } finally {
         click.mockRestore()
         vi.unstubAllGlobals()
      }
   })

   it('automatically downloads one backup per local day when plans are opened', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.removeItem(automaticBackupDateKey)
      const createObjectURL = vi.fn(() => 'blob:daily-backup')
      const revokeObjectURL = vi.fn()
      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

      try {
         const { unmount } = render(<App />)
         expect(await screen.findByRole('status')).toHaveTextContent(
            'Daily backup download started.'
         )

         expect(createObjectURL).toHaveBeenCalledOnce()
         expect(click).toHaveBeenCalledOnce()
         expect(localStorage.getItem(automaticBackupDateKey)).toBe(localDateKey(new Date()))

         unmount()
         render(<App />)

         expect(createObjectURL).toHaveBeenCalledOnce()
         expect(click).toHaveBeenCalledOnce()
      } finally {
         click.mockRestore()
         vi.unstubAllGlobals()
      }
   })

   it('does not create an automatic backup when there are no plans', async () => {
      localStorage.removeItem(automaticBackupDateKey)
      const createObjectURL = vi.fn(() => 'blob:daily-backup')
      vi.stubGlobal('URL', { createObjectURL })

      try {
         render(<App />)
         await screen.findByRole('button', { name: 'Export backup' })

         expect(createObjectURL).not.toHaveBeenCalled()
         expect(localStorage.getItem(automaticBackupDateKey)).toBeNull()
      } finally {
         vi.unstubAllGlobals()
      }
   })

   it('reorders tasks by dragging a task handle within its list', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem(
         'Today.todos',
         JSON.stringify([
            {
               id: 1,
               focus: true,
               text: 'First task',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
            {
               id: 2,
               focus: false,
               text: 'Second task',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      let targetElement: Element | null = null
      const originalElementFromPoint = Object.getOwnPropertyDescriptor(
         document,
         'elementFromPoint'
      )
      Object.defineProperty(document, 'elementFromPoint', {
         configurable: true,
         value: () => targetElement,
      })

      try {
         render(<App />)
         const targetTask = (await screen.findByText('Second task')).closest('li')!
         targetElement = targetTask
         Object.defineProperty(targetTask, 'getBoundingClientRect', {
            value: () => ({ top: 50, height: 40 }),
         })
         const dragHandle = screen.getByRole('button', { name: 'Reorder First task' })
         const dispatchPointerEvent = (
            type: string,
            values: Record<string, number>
         ) => {
            const event = new Event(type, { bubbles: true, cancelable: true })
            Object.entries(values).forEach(([key, value]) =>
               Object.defineProperty(event, key, { value })
            )
            fireEvent(dragHandle, event)
         }
         dispatchPointerEvent('pointerdown', { pointerId: 5, button: 0 })
         dispatchPointerEvent('pointermove', { pointerId: 5, clientX: 0, clientY: 90 })
         dispatchPointerEvent('pointerup', { pointerId: 5 })

         await waitFor(() => {
            const tasks = JSON.parse(localStorage.getItem('Today.todos') || '[]')
            expect(tasks.map((task: { text: string }) => task.text)).toEqual([
               'Second task',
               'First task',
            ])
         })
         expect(screen.getByDisplayValue('First task')).toHaveFocus()
      } finally {
         if (originalElementFromPoint) {
            Object.defineProperty(document, 'elementFromPoint', originalElementFromPoint)
         } else {
            Reflect.deleteProperty(document, 'elementFromPoint')
         }
      }
   })

   it('reports an invalid backup without replacing saved plans', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem(
         'Today.todos',
         JSON.stringify([
            {
               id: 1,
               focus: false,
               text: 'Keep this task',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      const invalidBackup = new File(['not json'], 'invalid.json', {
         type: 'application/json',
      })
      Object.defineProperty(invalidBackup, 'text', {
         value: async () => 'not json',
      })
      const { container } = render(<App />)

      fireEvent.change(container.querySelector('input[type="file"]')!, {
         target: { files: [invalidBackup] },
      })

      expect(await screen.findByRole('alert')).toHaveTextContent(
         'Could not import backup: The selected file is not valid JSON.'
      )
      expect(JSON.parse(localStorage.getItem('App.Sheets') || '[]')).toEqual(['Today'])
      expect(JSON.parse(localStorage.getItem('Today.todos') || '[]')[0].text).toBe(
         'Keep this task'
      )
   })

   it('moves the first and last todos tasks to backlog and keeps source focus', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem(
         'Today.todos',
         JSON.stringify([
            {
               id: 1,
               focus: true,
               text: 'Prepare presentation',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
            {
               id: 2,
               focus: false,
               text: 'Keep this task',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
            {
               id: 3,
               focus: false,
               text: 'Postpone last task',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      localStorage.setItem(
         'Today.backlog',
         JSON.stringify([
            {
               id: 1,
               focus: false,
               text: 'Existing backlog task',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      render(<App />)

      const taskInput = await screen.findByDisplayValue('Prepare presentation')
      fireEvent.keyDown(taskInput, { key: 'ArrowRight', altKey: true })

      await waitFor(() => {
         const backlog = JSON.parse(localStorage.getItem('Today.backlog') || '[]')
         expect(backlog.map((task: { text: string }) => task.text)).toEqual([
            'Prepare presentation',
            'Existing backlog task',
         ])
      })
      let todos = JSON.parse(localStorage.getItem('Today.todos') || '[]')
      expect(todos.map((task: { text: string }) => task.text)).toEqual([
         'Keep this task',
         'Postpone last task',
      ])
      expect(screen.getByDisplayValue('Keep this task')).toHaveFocus()

      fireEvent.click(screen.getByText('Postpone last task'))
      fireEvent.keyDown(screen.getByDisplayValue('Postpone last task'), {
         key: 'ArrowRight',
         altKey: true,
      })

      await waitFor(() => {
         const backlog = JSON.parse(localStorage.getItem('Today.backlog') || '[]')
         expect(backlog.map((task: { text: string }) => task.text)).toEqual([
            'Postpone last task',
            'Prepare presentation',
            'Existing backlog task',
         ])
      })
      todos = JSON.parse(localStorage.getItem('Today.todos') || '[]')
      expect(todos.map((task: { text: string }) => task.text)).toEqual(['Keep this task'])
      expect(screen.getByDisplayValue('Keep this task')).toHaveFocus()
   })

   it.each(['fixed', 'microHabits'])(
      'does not move a task from %s with Alt+ArrowRight',
      async listName => {
         localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
         localStorage.setItem(
            `Today.${listName}`,
            JSON.stringify([
               {
                  id: 1,
                  focus: false,
                  text: 'Keep this task here',
                  done: false,
                  size: 1,
                  impact: 1,
                  indentation: 0,
               },
            ])
         )
         render(<App />)

         const listPanel = screen.getByRole('region', { name: `${listName} task list` })
         const showButton = within(listPanel).queryByRole('button', { name: 'show' })
         if (showButton) fireEvent.click(showButton)
         fireEvent.click(await within(listPanel).findByText('Keep this task here'))
         const taskInput = await screen.findByDisplayValue('Keep this task here')

         fireEvent.keyDown(taskInput, { key: 'ArrowRight', altKey: true })

         await waitFor(() => {
            expect(
               JSON.parse(localStorage.getItem(`Today.${listName}`) || '[]').map(
                  (task: { text: string }) => task.text
               )
            ).toEqual(['Keep this task here'])
            expect(
               JSON.parse(localStorage.getItem('Today.someday') || '[]').map(
                  (task: { text: string }) => task.text
               )
            ).not.toContain('Keep this task here')
         })
      }
   )

   it.each(['fixed', 'microHabits'])(
      'does not render drag handles in %s',
      async listName => {
         localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
         localStorage.setItem(
            `Today.${listName}`,
            JSON.stringify([
               {
                  id: 1,
                  focus: false,
                  text: 'Task without drag',
                  done: false,
                  size: 1,
                  impact: 1,
                  indentation: 0,
               },
            ])
         )
         render(<App />)

         const listPanel = screen.getByRole('region', { name: `${listName} task list` })
         const showButton = within(listPanel).queryByRole('button', { name: 'show' })
         if (showButton) fireEvent.click(showButton)
         await within(listPanel).findByText('Task without drag')

         expect(
            within(listPanel).queryByRole('button', { name: 'Reorder Task without drag' })
         ).not.toBeInTheDocument()
      }
   )

   it('promotes the first backlog task and keeps focus on the remaining task', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem(
         'Today.todos',
         JSON.stringify([
            {
               id: 1,
               focus: false,
               text: 'Existing todos task',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      localStorage.setItem(
         'Today.backlog',
         JSON.stringify([
            {
               id: 1,
               focus: false,
               text: 'Promote this task',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
            {
               id: 2,
               focus: false,
               text: 'Keep in backlog',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      render(<App />)

      const backlogList = screen.getByRole('region', { name: 'backlog task list' })
      fireEvent.click(within(backlogList).getByRole('button', { name: 'show' }))
      fireEvent.click(await screen.findByText('Promote this task'))
      const taskInput = screen.getByDisplayValue('Promote this task')
      expect(taskInput).toHaveFocus()

      fireEvent.keyDown(taskInput, { key: 'ArrowLeft', altKey: true })

      await waitFor(() => {
         const todos = JSON.parse(localStorage.getItem('Today.todos') || '[]')
         expect(todos.map((task: { text: string }) => task.text)).toEqual([
            'Existing todos task',
            'Promote this task',
         ])
      })
      const backlog = JSON.parse(localStorage.getItem('Today.backlog') || '[]')
      expect(backlog.map((task: { text: string }) => task.text)).toEqual(['Keep in backlog'])
      expect(screen.getByDisplayValue('Keep in backlog')).toHaveFocus()
   })

   it('archives completed tasks beneath a dated parent task', async () => {
      localStorage.setItem('App.Sheets', JSON.stringify(['Today']))
      localStorage.setItem(
         'Today.todos',
         JSON.stringify([
            {
               id: 1,
               focus: true,
               text: 'Prepare presentation',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
            {
               id: 2,
               focus: false,
               text: 'Review notes',
               done: false,
               size: 1,
               impact: 1,
               indentation: 0,
            },
            {
               id: 3,
               focus: false,
               text: 'Send follow-up',
               done: true,
               size: 1,
               impact: 1,
               indentation: 0,
            },
         ])
      )
      render(<App />)

      const taskInput = await screen.findByDisplayValue('Prepare presentation')
      fireEvent.keyDown(taskInput, { key: 'Enter', altKey: true })
      fireEvent.click(screen.getByRole('button', { name: 'Clear complete' }))

      await waitFor(() => {
         const archived = JSON.parse(localStorage.getItem('Today.done') || '[]')
         const archivedTasks = archived.filter((task: { text: string }) => task.text)
         expect(archivedTasks).toHaveLength(3)
         expect(archivedTasks[1].text).toBe('Prepare presentation')
         expect(archivedTasks[2].text).toBe('Send follow-up')
      })
      const remaining = JSON.parse(localStorage.getItem('Today.todos') || '[]')
      expect(remaining.map((task: { text: string }) => task.text)).toEqual(['Review notes'])
      const archived = JSON.parse(localStorage.getItem('Today.done') || '[]')
      const archivedTasks = archived.filter((task: { text: string }) => task.text)
      expect(archivedTasks[0].text).toMatch(/^\w+ \d{1,2}\/\d{1,2}\/\d{4}$/)
      expect(archivedTasks[1]).toMatchObject({ done: false, indentation: 1 })
   })
})
