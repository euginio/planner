import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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

   it('moves a postponed task from todos to backlog', async () => {
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
         ])
      )
      render(<App />)

      const taskInput = await screen.findByDisplayValue('Prepare presentation')
      fireEvent.keyDown(taskInput, { key: 'ArrowRight', altKey: true })

      await waitFor(() => {
         const backlog = JSON.parse(localStorage.getItem('Today.backlog') || '[]')
         expect(backlog.some((task: { text: string }) => task.text === 'Prepare presentation'))
            .toBe(true)
      })
      expect(JSON.parse(localStorage.getItem('Today.todos') || '[]')).toEqual([])
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
