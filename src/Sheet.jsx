import { useEffect } from 'react'
import { useRef, useState } from 'react'
import { DEBUGG_MODE } from './App'
import TaskList from './TaskList'

function Sheet({ name }) {
   const [taskToMove, setTaskToMove] = useState({})

   const sheetHandlers = {
      taskToMoveUsed: () => setTaskToMove({}),
      add: (taskListName, task) =>
         setTaskToMove({ targetTaskList: taskListName, taskToMove: { ...task, focus: false } }),
   }

   return (
      <span>
         <h2>Sheet {name}</h2>
         <TaskList
            sheetName={name}
            name='todos'
            taskToMove={taskToMove}
            sheetHandlers={sheetHandlers}
         ></TaskList>

         <TaskList
            sheetName={name}
            name='backlog'
            taskToMove={taskToMove}
            sheetHandlers={sheetHandlers}
         ></TaskList>
         {DEBUGG_MODE && (
            <TaskList
               sheetName={name}
               name='deleted'
               taskToMove={taskToMove}
               sheetHandlers={sheetHandlers}
            ></TaskList>
         )}
         {
            <TaskList
               sheetName={name}
               name='done'
               taskToMove={taskToMove}
               sheetHandlers={sheetHandlers}
            ></TaskList>
         }
      </span>
   )
}

export default Sheet
