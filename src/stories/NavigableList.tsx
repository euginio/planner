import DummyList from './DummyList'
import { Task } from './List'
import { itemNavigationType } from './Sheet'

const NavigableList = ({
   name,
   navigableHandlers,
   itemActions,
   list,
   itemHandlers,
}: {
   name: string
   navigableHandlers: { [key: string]: (...a: any) => void }
   itemActions: itemNavigationType
   list: Task[]
   itemHandlers: { [key: string]: (...a: any) => void }
}) => {
   const handleNavigableInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault() // prevents put prompt at begining
         e.stopPropagation()
      }
      if (itemActions) {
         const id = list.find(i => i.focus)!.id
         if (e.key === 'Enter' && itemActions.add) {
            navigableHandlers.addTask(id, (e.target as HTMLInputElement).selectionStart ? 1 : 0)
         }

         if (e.key === 'ArrowUp') {
            if (e.altKey && itemActions.sortable) {
               navigableHandlers.moveUp(id)
            } else {
               navigableHandlers.focusUp(id)
            }
            e.preventDefault() // prevents put prompt at begining
         }
         if (e.key === 'ArrowDown') {
            if (e.altKey && itemActions.sortable) {
               navigableHandlers.moveDown(id)
            } else {
               navigableHandlers.focusDown(id)
               // e.stopPropagation()
               e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
            }
         }
         if (e.ctrlKey) {
            if (e.key === 'End') {
               navigableHandlers.focusOnLast(id)
               e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
            }
            if (e.key === 'Home') {
               navigableHandlers.focusOnFirst(id)
               e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
            }
         }
      }
   }

   return (
      <div onKeyDown={handleNavigableInputKeyDown}>
         <DummyList
            list={list}
            name={name}
            itemHandlers={itemHandlers}
            allowedActions={itemActions}
         ></DummyList>
      </div>
   )
}

export default NavigableList
