import { useEffect } from 'react'
import { useRef, useState } from 'react'
import { DEBUGG_MODE } from './App'
import TaskList from './TaskList'

function Sheet({ name }) {
   const [taskToMove, setTaskToMove] = useState({})
   // const [backlog, setBacklog] = useState([])
   // const [deletedTasks, setDeletedTasks] = useState([])
   // const [done, setDone] = useState([])

   // // Why I can't declare these param-dependent constants inside useEffect[param] ??
   // const LS_BACKLOG_KEY = name + '.backlog'
   // const LS_DONE_KEY = name + '.done'
   // const LS_DELETED_KEY = name + '.deleted'

   // useEffect(() => {
   //    if (backlog.length) localStorage.setItem(LS_BACKLOG_KEY, JSON.stringify(backlog))
   // }, [backlog])
   // useEffect(() => {
   //    if (deletedTasks.length) localStorage.setItem(LS_DELETED_KEY, JSON.stringify(deletedTasks))
   // }, [deletedTasks])
   // useEffect(() => {
   //    if (done.length) localStorage.setItem(LS_DONE_KEY, JSON.stringify(done))
   // }, [done])

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
