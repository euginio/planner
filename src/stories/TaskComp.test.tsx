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
   reorderTask: vi.fn(),
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
      const { container, handlers } = renderTask(createHandlers(), { indentation: 1 })
      const task = container.querySelector('li')!

      fireEvent.keyDown(task, { key: 'Tab' })
      fireEvent.keyDown(task, { key: 'Tab', shiftKey: true })

      expect(handlers.setIndentation).toHaveBeenNthCalledWith(1, 1, 2)
      expect(handlers.setIndentation).toHaveBeenNthCalledWith(2, 1, 0)
   })

   it('does not unindent a task beyond the left edge', () => {
      const { container, handlers } = renderTask()
      const task = container.querySelector('li')!

      fireEvent.keyDown(task, { key: 'Tab', shiftKey: true })

      expect(handlers.setIndentation).not.toHaveBeenCalled()
   })

   it('reorders tasks by dragging the mobile handle over another task', () => {
      const handlers = createHandlers()
      let targetElement: Element | null = null
      const elementFromPoint = vi.fn(() => targetElement)
      const originalElementFromPoint = Object.getOwnPropertyDescriptor(
         document,
         'elementFromPoint'
      )
      Object.defineProperty(document, 'elementFromPoint', {
         configurable: true,
         value: elementFromPoint,
      })

      const firstProps: React.ComponentProps<typeof TaskComp> = {
         id: 1,
         focus: true,
         text: 'First task',
         done: false,
         size: 1,
         indentation: 0,
         impact: 1,
         handlers,
         allowedActions,
      }
      const secondProps = { ...firstProps, id: 2, focus: false, text: 'Second task' }
      try {
         render(
            <>
               <TaskComp {...firstProps} />
               <TaskComp {...secondProps} />
            </>
         )

         const secondTask = screen.getByText('Second task').closest('li')!
         targetElement = secondTask
         Object.defineProperty(secondTask, 'getBoundingClientRect', {
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
         dispatchPointerEvent('pointerdown', { pointerId: 7, button: 0 })
         dispatchPointerEvent('pointermove', { pointerId: 7, clientX: 0, clientY: 70 })
         dispatchPointerEvent('pointerup', { pointerId: 7 })

         expect(elementFromPoint).toHaveBeenCalledWith(0, 70)
         expect(handlers.reorderTask).toHaveBeenCalledWith(1, 2, false)
      } finally {
         if (originalElementFromPoint) {
            Object.defineProperty(document, 'elementFromPoint', originalElementFromPoint)
         } else {
            Reflect.deleteProperty(document, 'elementFromPoint')
         }
      }
   })

   it('does not show a drag handle when the list does not allow sorting', () => {
      renderTask(createHandlers(), {
         allowedActions: { ...allowedActions, sortable: false },
      })

      expect(screen.queryByRole('button', { name: 'Reorder Plan report' })).not.toBeInTheDocument()
   })

   it('does not show a drag handle when drag and drop is disabled for the list', () => {
      renderTask(createHandlers(), {
         allowedActions: { ...allowedActions, dragAndDrop: false },
      })

      expect(screen.queryByRole('button', { name: 'Reorder Plan report' })).not.toBeInTheDocument()
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
