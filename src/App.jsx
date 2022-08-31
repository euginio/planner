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
      // window.addEventListener('keypress', e => {

      // });
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

   // const handleAddTask = () => {
   //    const inputValue = inputTextRef.current.value
   //    if (!inputValue) return null
   //    taskHandlers.addTask(inputValue)
   //    inputTextRef.current.value = null
   //    inputTextRef.current.focus()
   // }

   // const handleKeyDown = e => {
   //    if (e.key === 'Enter') handleAddTask()
   // }

   const taskHandlers = {
      updateTask: task => {
         const todosCp = [...todos]
         let td = todosCp.find(td => td.id === task.id)
         td = task
         setTodos(todosCp)
      },
      addTask: aboveId => {
         const maxTaskId = todos.length ? Math.max(...todos.map(t => t.id)) : 0
         const newTask = {
            name: '',
            done: false,
            focus: true,
            size: 1,
            id: maxTaskId + 1,
         }
         if (aboveId) {
            let todoscp = [...todos]
            const aboveTaskIdx = todoscp.findIndex(t => t.id == aboveId)
            newTask.focus = true
            todoscp.splice(aboveTaskIdx + 1, 0, newTask)
            setTodos(todoscp)
         } else {
            setTodos(prevTodos => [...prevTodos, newTask])
         }
      },
      markAsDone: id => {
         const todosCp = [...todos]
         const td = todosCp.find(td => td.id === id)
         td.done = !td.done
         setTodos(todosCp)
      },
      handleDelete: id => {
         const todoscp = [...todos]
         setDeletedTasks([...deletedTasks, todos.find(task => task.id == id)])
         const updatedTodos = todoscp.filter(task => task.id !== id)
         setTodos(updatedTodos)
      },
      handleMoveToBacklog: id => {
         const todoscp = [...todos]
         setBacklog([...backlog, todos.find(task => task.id == id)])
         const updatedTodos = todoscp.filter(task => task.id !== id)
         setTodos(updatedTodos)
      },
      handleMoveUp: id => {
         const todoscp = [...todos]
         const currentIndex = todoscp.findIndex(t => t.id == id)
         const currentTask = todoscp.find(t => t.id == id)
         currentTask.focus = true
         todoscp[currentIndex] = todoscp[currentIndex - 1]
         todoscp[currentIndex - 1] = currentTask
         setTodos(todoscp)
      },
      handleMoveDown: id => {
         const todoscp = [...todos]
         const currentIndex = todoscp.findIndex(t => t.id == id)
         const currentTask = todoscp.find(t => t.id == id)
         currentTask.focus = true
         todoscp[currentIndex] = todoscp[currentIndex + 1]
         todoscp[currentIndex + 1] = currentTask
         setTodos(todoscp)
      },
      handleOnClick: id => {
         const todoscp = [...todos]
         const focusedTD = todoscp.find(t => t.focus == true)
         if (focusedTD) focusedTD.focus = false
         const td = todoscp.find(td => td.id === id)
         td.focus = true
         setTodos(todoscp)
      },
      updateText: (id, value) => {
         const todosCp = [...todos]
         const td = todosCp.find(td => td.id === id)
         td.name = value
         td.focus = false
         setTodos(todosCp)
      },
      focusUp: id => {
         const todoscp = [...todos]
         const tdIdx = todoscp.findIndex(td => td.id === id)
         if (tdIdx > 0) {
            todoscp[tdIdx].focus = false
            todoscp[tdIdx - 1].focus = true
         } else {
            todoscp[tdIdx].focus = true //I need to explicitly set it to focus=true cause updateText set focus false
         }
         setTodos(todoscp)
      },
      focusDown: id => {
         const todoscp = [...todos]
         const tdIdx = todoscp.findIndex(td => td.id === id)
         if (tdIdx < todos.length - 1) {
            todoscp[tdIdx].focus = false
            todoscp[tdIdx + 1].focus = true
         } else {
            todoscp[tdIdx].focus = true //I need to explicitly set it to focus=true cause updateText set focus false
         }
         setTodos(todoscp)
      },
   }

   const hadleClearCompleted = () => {
      const newTodos = todos.filter(t => !t.done)
      setTodos(newTodos)
      const done = todos.filter(t => t.done)
      setDone(done)
   }

   return (
      <span>
         <h3>TODO today</h3>
         <TodoList todos={todos} taskHandlers={taskHandlers} debug={DEBUGG_MODE}></TodoList>
         {/* <input ref={inputTextRef} autoFocus onKeyDown={handleKeyDown}></input>
         <button onClick={handleAddTask}>Add task</button> */}
         <button onClick={hadleClearCompleted}>Clear complete</button>
         <p>
            {todos
               .filter(t => !t.done)
               .map(t => t.size || 1)
               .reduce((prev, curr) => prev + curr, 0)}{' '}
            pending pomodoros{' '}
         </p>
         <p>
            {todos
               .filter(t => t.done)
               .map(t => t.size || 1)
               .reduce((prev, curr) => prev + curr, 0)}{' '}
            done pomodoros{' '}
         </p>
         <h3>Backlog</h3>
         <TodoList todos={backlog}></TodoList>
         {DEBUGG_MODE && (
            <>
               <h3>Removed</h3>
               <TodoList todos={deletedTasks}></TodoList>
            </>
         )}
         <h3>DONE</h3>
         <TodoList todos={done}></TodoList>
      </span>
   )
}

export default App
