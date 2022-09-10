import { useState } from 'react'
import { DEBUGG_MODE } from './App'
import List from './List'

function Sheet({ name }) {
   // const listNames = ['todos', 'backlog', 'done', 'deleted']
   // const [taskMovement, setTaskMovement] = useState({})
   // const [activeList, setActiveList] = useState(listNames[0])

   // const sheetHandlers = {
   //    taskMoved: () => setTaskMovement({}),
   //    add: (taskListName, task) =>
   //       setTaskMovement({ targetTaskList: taskListName, taskToMove: { ...task, focus: false } }),
   //    focusedOnMe: taskListName => setTaskMovement(taskListName),
   // }

   // function handleKeyDown(e) {
   //    if (e.altKey && ['PageDown', 'PageUp'].includes(e.key)) {
   //       const activeListIdx = listNames.findIndex(l => l == activeList)
   //       if (e.key === 'PageDown' && activeListIdx < listNames.length - 1) {
   //          setActiveList(listNames[activeListIdx + 1])
   //       } else if (e.key === 'PageUp' && activeListIdx > 0) {
   //          setActiveList(listNames[activeListIdx - 1])
   //       }
   //    }
   // }

   return (
      <>
         <h2>Sheet {name}</h2>
         <List sheetName={name} name='todos'></List>
      </>
   )
}

export default Sheet
