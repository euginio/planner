import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
   beforeEach(() => {
      localStorage.clear()
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
      render(<App />)

      fireEvent.click(await screen.findByRole('button', { name: 'All plans' }))
      fireEvent.click(screen.getByRole('button', { name: 'Delete Today plan' }))

      expect(localStorage.getItem('App.Sheets')).toBe('[]')
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
         ])
      )
      render(<App />)

      const taskInput = await screen.findByDisplayValue('Prepare presentation')
      fireEvent.keyDown(taskInput, { key: 'Enter', altKey: true })
      fireEvent.click(screen.getByRole('button', { name: 'Clear complete' }))

      await waitFor(() => {
         const archived = JSON.parse(localStorage.getItem('Today.done') || '[]')
         const archivedTasks = archived.filter((task: { text: string }) => task.text)
         expect(archivedTasks).toHaveLength(2)
         expect(archivedTasks[1].text).toBe('Prepare presentation')
      })
      const remaining = JSON.parse(localStorage.getItem('Today.todos') || '[]')
      expect(remaining.map((task: { text: string }) => task.text)).toEqual(['Review notes'])
      const archived = JSON.parse(localStorage.getItem('Today.done') || '[]')
      const archivedTasks = archived.filter((task: { text: string }) => task.text)
      expect(archivedTasks[0].text).toMatch(/^\w+ \d{1,2}\/\d{1,2}\/\d{4}$/)
      expect(archivedTasks[1]).toMatchObject({ done: false, indentation: 1 })
   })
})
