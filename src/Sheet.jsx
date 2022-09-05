import { useEffect } from 'react'
import { useRef, useState } from 'react'
import { DEBUGG_MODE } from './App'
import TaskList from './TaskList'

function Sheet({ name }) {
   const sheets = ['todos', 'backlog', 'done', 'deleted']
   const [taskMovement, setTaskMovement] = useState({})
   const [activeList, setActiveList] = useState(sheets[0])

   const sheetHandlers = {
      taskMoved: () => setTaskMovement({}),
      add: (taskListName, task) =>
         setTaskMovement({ targetTaskList: taskListName, taskToMove: { ...task, focus: false } }),
   }

   function handleKeyDown(e) {
      if (e.altKey) {
         if (e.key === 'PageDown') {
            console.log('pressing' + e.key)
         } else {
         }
      }
   }
   return (
      <div onKeyDown={handleKeyDown}>
         <h2>Sheet {name}</h2>
         <TaskList
            sheetName={name}
            name='todos'
            taskMovement={taskMovement}
            sheetHandlers={sheetHandlers}
         ></TaskList>

         <TaskList
            sheetName={name}
            name='backlog'
            taskMovement={taskMovement}
            sheetHandlers={sheetHandlers}
         ></TaskList>
         {
            <TaskList
               sheetName={name}
               name='done'
               taskMovement={taskMovement}
               sheetHandlers={sheetHandlers}
            ></TaskList>
         }
         {DEBUGG_MODE && (
            <TaskList
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
