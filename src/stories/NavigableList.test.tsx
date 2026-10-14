import { fireEvent, render, screen } from '@testing-library/react'
import NavigableList from './NavigableList'
import { Task } from './List'
import { ListConf } from './Sheet'

const listConfig: ListConf = {
   listLook: { visible: true },
   listActions: {},
   itemsNavigation: {
      add: true,
      editable: true,
      completable: true,
      sizeable: true,
      sortable: true,
      indentable: true,
   },
}

const list: Task[] = [
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
]

const createHandlers = () => ({
   addTask: jest.fn(),
   moveUp: jest.fn(),
   moveDown: jest.fn(),
   focusUp: jest.fn(),
   focusDown: jest.fn(),
   focusOnFirst: jest.fn(),
   focusOnLast: jest.fn(),
})

const renderNavigableList = (navigableHandlers = createHandlers()) => {
   render(
      <NavigableList
         name='todos'
         navigableHandlers={navigableHandlers}
         listConfig={listConfig}
         list={list}
         itemHandlers={{
            setDone: jest.fn(),
            setIndentation: jest.fn(),
            setSize: jest.fn(),
            setText: jest.fn(),
            handleOnItemClick: jest.fn(),
         }}
         visible
      />
   )
   return { input: screen.getByDisplayValue('First task'), navigableHandlers }
}

describe('NavigableList', () => {
   it('moves focus through tasks with the arrow keys', () => {
      const { input, navigableHandlers } = renderNavigableList()

      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowUp' })

      expect(navigableHandlers.focusDown).toHaveBeenCalledWith(1)
      expect(navigableHandlers.focusUp).toHaveBeenCalledWith(1)
   })

   it('reorders tasks with Alt+ArrowUp and Alt+ArrowDown', () => {
      const { input, navigableHandlers } = renderNavigableList()

      fireEvent.keyDown(input, { key: 'ArrowUp', altKey: true })
      fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true })

      expect(navigableHandlers.moveUp).toHaveBeenCalledWith(1)
      expect(navigableHandlers.moveDown).toHaveBeenCalledWith(1)
   })

   it('jumps to the first or last task with Ctrl+Home and Ctrl+End', () => {
      const { input, navigableHandlers } = renderNavigableList()

      fireEvent.keyDown(input, { key: 'Home', ctrlKey: true })
      fireEvent.keyDown(input, { key: 'End', ctrlKey: true })

      expect(navigableHandlers.focusOnFirst).toHaveBeenCalledWith(1)
      expect(navigableHandlers.focusOnLast).toHaveBeenCalledWith(1)
   })

   it('adds a task before the current one when Enter is pressed at the start', () => {
      const { input, navigableHandlers } = renderNavigableList()
      ;(input as HTMLInputElement).setSelectionRange(0, 0)

      fireEvent.keyDown(input, { key: 'Enter' })

      expect(navigableHandlers.addTask).toHaveBeenCalledWith(1, 0)
   })
})
