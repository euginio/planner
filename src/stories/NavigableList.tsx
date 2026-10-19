import DummyList from './DummyList'
import { Task } from './List'
import { ListConf } from './Sheet'
import type { NavigableHandlers, TaskItemHandlers } from './handlers'

const NavigableList = ({
   name,
   navigableHandlers,
   listConfig,
   list,
   itemHandlers,
   visible,
}: {
   name: string
   navigableHandlers: NavigableHandlers
   listConfig: ListConf
   list: Task[]
   itemHandlers: TaskItemHandlers
   visible: boolean
}) => {
   const itemActions = listConfig.itemsNavigation
   const handleNavigableInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault()
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
            e.preventDefault()
         }
         if (e.key === 'ArrowDown') {
            if (e.altKey && itemActions.sortable) {
               navigableHandlers.moveDown(id)
            } else {
               navigableHandlers.focusDown(id)
               e.preventDefault()
            }
         }
         if (e.ctrlKey) {
            if (e.key === 'End') {
               navigableHandlers.focusOnLast()
               e.preventDefault()
            }
            if (e.key === 'Home') {
               navigableHandlers.focusOnFirst()
               e.preventDefault()
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
            listConfig={listConfig}
            visible={visible}
         ></DummyList>
      </div>
   )
}

export default NavigableList
