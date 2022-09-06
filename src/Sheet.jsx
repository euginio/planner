import { useState } from 'react'
import { DEBUGG_MODE } from './App'
import TaskList from './TaskList'

function Sheet({ name }) {
   const listNames = ['todos', 'backlog', 'done', 'deleted']
   const [taskMovement, setTaskMovement] = useState({})
   const [activeList, setActiveList] = useState(listNames[0])

   const sheetHandlers = {
      taskMoved: () => setTaskMovement({}),
      add: (taskListName, task) =>
         setTaskMovement({ targetTaskList: taskListName, taskToMove: { ...task, focus: false } }),
      focusedOnMe: taskListName => setTaskMovement(taskListName),
   }

   function handleKeyDown(e) {
      if (e.altKey && ['PageDown', 'PageUp'].includes(e.key)) {
         const activeListIdx = listNames.findIndex(l => l == activeList)
         if (e.key === 'PageDown' && activeListIdx < listNames.length - 1) {
            setActiveList(listNames[activeListIdx + 1])
         } else if (e.key === 'PageUp' && activeListIdx > 0) {
            setActiveList(listNames[activeListIdx - 1])
         }
      }
   }

   return (
      <div onKeyDown={handleKeyDown}>
         <h2>Sheet {name}</h2>
         <TaskList
            activeList={activeList}
            sheetName={name}
            name='todos'
            taskMovement={taskMovement}
            sheetHandlers={sheetHandlers}
         ></TaskList>

         <TaskList
            activeList={activeList}
            sheetName={name}
            name='backlog'
            taskMovement={taskMovement}
            sheetHandlers={sheetHandlers}
         ></TaskList>
         {
            <TaskList
               activeList={activeList}
               sheetName={name}
               name='done'
               taskMovement={taskMovement}
               sheetHandlers={sheetHandlers}
            ></TaskList>
         }
         {DEBUGG_MODE && (
            <TaskList
               activeList={activeList}
               sheetName={name}
               name='deleted'
               taskMovement={taskMovement}
               sheetHandlers={sheetHandlers}
            ></TaskList>
         )}
      </div>
   )
}

export default Sheet
