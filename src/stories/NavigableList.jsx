import DummyList from './DummyList'

const NavigableList = ({ navigableHandlers, list, ...params }) => {
   const handleNavigableInputKeyDown = e => {
      const id = list.find(i => i.focus).id
      if (e.key === 'Enter') {
         navigableHandlers.addTask(id)
      }
      if (e.key === 'ArrowUp') {
         if (e.altKey) {
            navigableHandlers.moveUp(id)
         } else {
            // e.stopPropagation()
            navigableHandlers.focusUp(id)
         }
         e.preventDefault() // prevents put prompt at begining
      }
      if (e.key === 'ArrowDown') {
         if (e.altKey) {
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
      if (
         (e.key === 'Backspace' || e.key === 'Delete') &&
         (e.altKey || !list.find(i => i.id === id).text)
      ) {
         navigableHandlers.deleteItem(id)
         e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
      }
   }

   return (
      <div onKeyDown={e => handleNavigableInputKeyDown(e)}>
         <DummyList list={list} {...params}></DummyList>
      </div>
   )
}

export default NavigableList
