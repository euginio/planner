import { useEffect } from 'react'
import { useRef, useState } from 'react'
import { DEBUGG_MODE } from './App'
import TaskList from './TaskList'

function Sheet({ name }) {
   const [todos, setTodos] = useState([])
   const [backlog, setBacklog] = useState([])
   const [deletedTasks, setDeletedTasks] = useState([])
   const [done, setDone] = useState([])

   // Why I can't declare these param-dependent constants inside useEffect[param] ??
   const LS_TODOS_KEY = name + '.todos'
   const LS_BACKLOG_KEY = name + '.backlog'
   const LS_DONE_KEY = name + '.done'
   const LS_DELETED_KEY = name + '.deleted'

   useEffect(() => {
      const loadedTodos = JSON.parse(localStorage.getItem(LS_TODOS_KEY))
      if (loadedTodos) {
         setTodos(loadedTodos)
      } else {
         setTodos([
            {
               text: '',
               done: false,
               focus: true,
               size: 1,
               id: 1,
            },
         ])
      }
      const loadedBacklog = JSON.parse(localStorage.getItem(LS_BACKLOG_KEY))
      if (loadedBacklog) setBacklog(loadedBacklog)
      const loadedDeleted = JSON.parse(localStorage.getItem(LS_DELETED_KEY))
      if (loadedDeleted) setDeletedTasks(loadedDeleted)
      const loadedDone = JSON.parse(localStorage.getItem(LS_DONE_KEY))
      if (loadedDone) setDone(loadedDone)

      //just one update db
      // if (loadedTodos) {
      //    loadedTodos.forEach(t => {
      //       t.text = t.name
      //       delete t.name
      //       t.size = t.size || 1
      //    })
      //    setTodos(loadedTodos)
      // }
   }, [name])

   useEffect(() => {
      if (todos.length) localStorage.setItem(LS_TODOS_KEY, JSON.stringify(todos))
   }, [todos])
   useEffect(() => {
      if (backlog.length) localStorage.setItem(LS_BACKLOG_KEY, JSON.stringify(backlog))
   }, [backlog])
   useEffect(() => {
      if (deletedTasks.length) localStorage.setItem(LS_DELETED_KEY, JSON.stringify(deletedTasks))
   }, [deletedTasks])
   useEffect(() => {
      if (done.length) localStorage.setItem(LS_DONE_KEY, JSON.stringify(done))
   }, [done])

   const sheetHandlers = {
      handleMoveToBacklog: id => {
         const taskToAdd = todos.find(task => task.id == id)
         const maxBacklogTaskId = backlog.length ? Math.max(...backlog.map(t => t.id)) : 0
         setBacklog([...backlog, { ...taskToAdd, id: maxBacklogTaskId + 1 }])

         const todoscp = [...todos]
         const updatedTodos = todoscp.filter(task => task.id !== id)
         setTodos(updatedTodos)
      },
      addToDeleted: task => {
         setDeletedTasks(deletedTasks => [...deletedTasks, task])
      },
      postpone: todoTask => {
         const maxBacklogTaskId = backlog.length ? Math.max(...backlog.map(t => t.id)) : 0
         setBacklog([{ ...todoTask, id: maxBacklogTaskId + 1, focus: false }, ...backlog])
      },
   }
   const clearCompleted = () => {
      const newDone = todos.filter(t => t.done)
      setDone(prevDone => [...done, ...newDone])
      const newTodos = todos.filter(t => !t.done)
      setTodos(newTodos)
   }
   return (
      <span>
         <h2>Sheet {name}</h2>
         <p>
            {todos
               .filter(t => !t.done)
               .map(t => t.size)
               .reduce((prev, curr) => prev + curr, 0)}{' '}
            pending{' '}
            {todos
               .filter(t => t.done)
               .map(t => t.size)
               .reduce((prev, curr) => prev + curr, 0)}{' '}
            done{' '}
         </p>
         <TaskList
            name='todo'
            tasks={todos}
            tasksSetter={setTodos}
            sheetHandlers={sheetHandlers}
         ></TaskList>
         <button onClick={clearCompleted}>Clear complete</button>

         <TaskList
            name='backlog'
            tasks={backlog}
            tasksSetter={setBacklog}
            sheetHandlers={sheetHandlers}
         ></TaskList>
         {DEBUGG_MODE && (
            <>
               {
                  <TaskList
                     name='deleted'
                     tasks={deletedTasks}
                     tasksSetter={setDeletedTasks}
                     sheetHandlers={sheetHandlers}
                  ></TaskList>
               }
            </>
         )}
         {
            <TaskList
               name='done'
               tasks={done}
               tasksSetter={setDone}
               sheetHandlers={sheetHandlers}
            ></TaskList>
         }
      </span>
   )
}

export default Sheet
