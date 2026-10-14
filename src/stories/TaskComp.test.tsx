import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TaskComp from './TaskComp'
import { itemNavigationType } from './Sheet'

const allowedActions: itemNavigationType = {
   add: true,
   editable: true,
   completable: true,
   sizeable: true,
   sortable: true,
   indentable: true,
}

const createHandlers = () => ({
   setDone: vi.fn(),
   setIndentation: vi.fn(),
   setSize: vi.fn(),
   setText: vi.fn(),
   handleOnItemClick: vi.fn(),
})

const renderTask = (
   handlers = createHandlers(),
   overrides: Partial<React.ComponentProps<typeof TaskComp>> = {}
) => {
   const props: React.ComponentProps<typeof TaskComp> = {
      id: 1,
      focus: true,
      text: 'Plan report',
      done: false,
      size: 1,
      indentation: 0,
      impact: 1,
      handlers,
      allowedActions,
      ...overrides,
   }

   const result = render(<TaskComp {...props} />)
   return { ...result, handlers }
}

describe('TaskComp', () => {
   it('updates task text when the input changes', () => {
      const { handlers } = renderTask()

      fireEvent.change(screen.getByRole('textbox'), {
         target: { value: 'Write report' },
      })

      expect(handlers.setText).toHaveBeenCalledWith(1, 'Write report')
   })

   it('toggles completion with Alt+Enter when completion is allowed', () => {
      const { container, handlers } = renderTask()

      fireEvent.keyDown(container.querySelector('li')!, {
         key: 'Enter',
         altKey: true,
      })

      expect(handlers.setDone).toHaveBeenCalledWith(1, true)
   })

   it('indents and unindents with Tab and Shift+Tab', () => {
      const { container, handlers } = renderTask()
      const task = container.querySelector('li')!

      fireEvent.keyDown(task, { key: 'Tab' })
      fireEvent.keyDown(task, { key: 'Tab', shiftKey: true })

      expect(handlers.setIndentation).toHaveBeenNthCalledWith(1, 1, 1)
      expect(handlers.setIndentation).toHaveBeenNthCalledWith(2, 1, -1)
   })

   it('changes task size with Ctrl+ArrowUp and Ctrl+ArrowDown', () => {
      const { container, handlers } = renderTask(createHandlers(), { size: 2 })
      const task = container.querySelector('li')!

      fireEvent.keyDown(task, { key: 'ArrowUp', ctrlKey: true })
      fireEvent.keyDown(task, { key: 'ArrowDown', ctrlKey: true })

      expect(handlers.setSize).toHaveBeenNthCalledWith(1, 1, 3)
      expect(handlers.setSize).toHaveBeenNthCalledWith(2, 1, 1)
   })

   it('changes text case with Shift+ArrowUp and Shift+ArrowDown', () => {
      const { container, handlers } = renderTask()
      const task = container.querySelector('li')!

      fireEvent.keyDown(task, { key: 'ArrowUp', shiftKey: true })
      fireEvent.keyDown(task, { key: 'ArrowDown', shiftKey: true })

      expect(handlers.setText).toHaveBeenNthCalledWith(1, 1, 'PLAN REPORT')
      expect(handlers.setText).toHaveBeenNthCalledWith(2, 1, 'plan report')
   })
})
