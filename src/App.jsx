import { useEffect } from 'react'
import { useRef, useState } from 'react'
import TodoList from './TodoList'

const LS_TODOS_KEY = 'todoApp.todos'
const LS_BACKLOG_KEY = 'todoApp.backlog'
const LS_DONE_KEY = 'todoApp.done'
const LS_DELETED_KEY = 'todoApp.deleted'
const DEBUGG_MODE = false

function App() {
   const [todos, setTodos] = useState([])
   const [backlog, setBacklog] = useState([])
   const [deletedTasks, setDeletedTasks] = useState([])
   const [done, setDone] = useState([])
   // const inputTextRef = useRef()

   useEffect(() => {
      const loadedTodos = JSON.parse(localStorage.getItem(LS_TODOS_KEY))
      if (loadedTodos) setTodos(loadedTodos)
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
   }, [])

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

   const SheetHandlers = {
      handleMoveToBacklog: id => {
         const todoscp = [...todos]
         setBacklog([...backlog, todos.find(task => task.id == id)])
         const updatedTodos = todoscp.filter(task => task.id !== id)
         setTodos(updatedTodos)
      },
      addToDeleted: task => {
         setDeletedTasks(deletedTasks => [...deletedTasks, task])
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
         <TodoList
            name='today'
            todos={todos}
            todosSetter={setTodos}
            SheetHandlers={SheetHandlers}
            debug={DEBUGG_MODE}
         ></TodoList>
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
         <h3>Backlog</h3>
         {/* <TodoList todos={backlog}></TodoList> */}
         {DEBUGG_MODE && (
            <>
               <h3>Removed</h3>
               {/* <TodoList todos={deletedTasks}></TodoList> */}
            </>
         )}
         <h3>DONE</h3>
         {/* <TodoList todos={done}></TodoList> */}
      </span>
   )
}

export default App
