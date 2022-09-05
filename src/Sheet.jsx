import { useEffect } from 'react'
import { useRef, useState } from 'react'
import { DEBUGG_MODE } from './App'
import TaskList from './TaskList'

function Sheet({ name }) {
   const [taskToMove, setTaskToMove] = useState({})

   const sheetHandlers = {
      taskToMoveUsed: () => setTaskToMove({}),
      addToDeleted: task =>
         setTaskToMove({ targetTaskList: 'delete', taskToMove: { ...task, focus: false } }),
      addToBacklog: task =>
         setTaskToMove({ targetTaskList: 'backlog', taskToMove: { ...task, focus: false } }),
      addToTodos: task =>
         setTaskToMove({ targetTaskList: 'todos', taskToMove: { ...task, focus: false } }),
   }
   // const clearCompleted = () => {
   //    const newDone = todos.filter(t => t.done)
   //    setDone(prevDone => [...done, ...newDone])
   //    const newTodos = todos.filter(t => !t.done)
   //    setTodos(newTodos)
   // }

   return (
      <span>
         <h2>Sheet {name}</h2>
         <TaskList
            sheetName={name}
            name='todos'
            taskToMove={taskToMove}
            sheetHandlers={sheetHandlers}
         ></TaskList>
         {/* <button onClick={clearCompleted}>Clear complete</button> */}

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
