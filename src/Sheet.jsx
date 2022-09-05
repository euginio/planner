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
         const todoscp = [...todos]
         setBacklog([...backlog, todos.find(task => task.id == id)])
         const updatedTodos = todoscp.filter(task => task.id !== id)
         setTodos(updatedTodos)
      },
      addToDeleted: task => {
         setDeletedTasks(deletedTasks => [...deletedTasks, task])
      },
      postpone: todoTask => {
         setBacklog(prevBacklog => [...prevBacklog, todoTask])
      },
   }
   const clearCompleted = () => {
      const newTodos = todos.filter(t => !t.done)
      setTodos(newTodos)
      const done = todos.filter(t => t.done)
      setDone(done)
   }
   return (
      <span>
         <h2>Sheet {name}</h2>
         <TaskList
            name='todo'
            tasks={todos}
            tasksSetter={setTodos}
            sheetHandlers={sheetHandlers}
         ></TaskList>
         <button onClick={clearCompleted}>Clear complete</button>

         <p>
            {todos
               .filter(t => !t.done)
               .map(t => t.size)
               .reduce((prev, curr) => prev + curr, 0)}{' '}
            pending pomodoros{' '}
         </p>
         <p>
            {todos
               .filter(t => t.done)
               .map(t => t.size)
               .reduce((prev, curr) => prev + curr, 0)}{' '}
            done pomodoros{' '}
         </p>
         <TaskList name='backlog' tasks={backlog}></TaskList>
         {DEBUGG_MODE && <>{/* <TaskList name='deleted' tasks={deletedTasks}></TaskList> */}</>}
         {<TaskList name='done' tasks={done}></TaskList>}
      </span>
   )
}

export default Sheet
