import DummyList from './DummyList'

const NavigableList = ({ navigableHandlers, itemActions, list, ...params }) => {
   const handleNavigableInputKeyDown = e => {
      if (itemActions) {
         const id = list.find(i => i.focus).id
         if (e.key === 'Enter' && itemActions.add) {
            navigableHandlers.addTask(id)
         }
         if (itemActions) {
            if (e.key === 'ArrowUp') {
               if (e.altKey && itemActions.sortable) {
                  navigableHandlers.moveUp(id)
               } else {
                  // e.stopPropagation()
                  navigableHandlers.focusUp(id)
               }
               e.preventDefault() // prevents put prompt at begining
            }
            if (e.key === 'ArrowDown') {
               if (e.altKey && itemActions.sortable) {
                  navigableHandlers.moveDown(id)
               } else {
                  navigableHandlers.focusDown(id)
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
   }

   return (
      <div onKeyDown={e => handleNavigableInputKeyDown(e)}>
         <DummyList list={list} {...params} itemActions={itemActions}></DummyList>
      </div>
   )
}

export default NavigableList
