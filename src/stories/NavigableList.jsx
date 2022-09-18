import DummyList from './DummyList'

const NavigableList = ({ navigableHandlers, itemActions, list, ...params }) => {
   const handleNavigableInputKeyDown = e => {
      if (itemActions) {
         const id = list.find(i => i.focus).id
         if (e.key === 'Enter' && itemActions.add) {
            navigableHandlers.addTask(id, e.target.selectionStart ? 1 : 0)
         }
         if (itemActions) {
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
   }

   return (
      <div onKeyDown={e => handleNavigableInputKeyDown(e)}>
         <DummyList list={list} {...params} allowedActions={itemActions}></DummyList>
      </div>
   )
}

export default NavigableList
