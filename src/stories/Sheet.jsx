// import { useState } from 'react'
// import { DEBUGG_MODE } from './App'
import List from './List'
import './Sheet.css'

function Sheet({ name }) {
   const listNames = ['todos', 'backlog', 'done', 'deleted']
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
         <List focus={true} key='todos' sheetName={name} name='todos'></List>
         <List key='backlog' sheetName={name} name='backlog'></List>
         <List key='done' sheetName={name} name='done'></List>
         <List key='deleted' sheetName={name} name='deleted'></List>
      </>
   )
}

export default Sheet
