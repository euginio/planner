import { useEffect, useState } from 'react'
import IsolatedTask from './IsolatedTask'
import TaskInfo from './TaskInfo'

const IsolatedTaskList = ({ sheetName, name }) => {
   const LS_TASKS_KEY = sheetName + '.' + name

   let loadedTasks = JSON.parse(localStorage.getItem(LS_TASKS_KEY))
   if (loadedTasks) {
      loadedTasks[loadedTasks.length - 1].focus = true
   } else {
      loadedTasks = [{ id: 1, focus: true }]
   }
   const [tasks, setTasks] = useState(loadedTasks)

   useEffect(() => {
      if (tasks.length) localStorage.setItem(LS_TASKS_KEY, JSON.stringify(tasks))
   }, [tasks])

   // const remove = id => {
   //    if (listHandlers.isLastTask(id)) {
   //       listHandlers.focusUp(id)
   //    } else {
   //       listHandlers.focusDown(id)
   //    }
   //    const taskscp = [...tasks]
   //    const updatedTasks = taskscp.filter(task => task.id !== id)
   //    setTasks(updatedTasks)
   // }

   // const listHandlers = {
   //    updateTask: task => {
   //       const taskscp = [...tasks]
   //       let taskIdxToReplace = taskscp.findIndex(td => td.id === task.id)
   //       taskscp[taskIdxToReplace] = task
   //       setTasks(taskscp)
   //    },
   //    addTask: (
   //       aboveId,
   //       newTask = {
   //          text: '',
   //          done: false,
   //          focus: true,
   //          size: 1,
   //       }
   //    ) => {
   //       const maxTaskId = tasks.length ? Math.max(...tasks.map(t => t.id)) : 0
   //       newTask.id = maxTaskId + 1

   //       if (aboveId) {
   //          let taskscp = [...tasks]
   //          const aboveTaskIdx = taskscp.findIndex(t => t.id === aboveId)
   //          taskscp.splice(aboveTaskIdx + 1, 0, newTask)
   //          setTasks(taskscp)
   //       } else {
   //          setTasks(prevTasks => [...prevTasks, newTask])
   //       }
   //    },
   //    isLastTask: id => tasks.findIndex(t => t.id === id) === tasks.length - 1,
   //    moveUp: id => {
   //       const taskscp = [...tasks]
   //       const currentIndex = taskscp.findIndex(t => t.id === id)
   //       const currentTask = taskscp.find(t => t.id === id)
   //       currentTask.focus = true
   //       taskscp[currentIndex] = taskscp[currentIndex - 1]
   //       taskscp[currentIndex - 1] = currentTask
   //       setTasks(taskscp)
   //    },
   //    moveDown: id => {
   //       const taskscp = [...tasks]
   //       const currentIndex = taskscp.findIndex(t => t.id === id)
   //       const currentTask = taskscp.find(t => t.id === id)
   //       currentTask.focus = true
   //       taskscp[currentIndex] = taskscp[currentIndex + 1]
   //       taskscp[currentIndex + 1] = currentTask
   //       setTasks(taskscp)
   //    },
   //    focusOn: id => {
   //       const taskscp = [...tasks]
   //       const focusedTD = taskscp.find(t => t.focus === true)
   //       if (focusedTD) focusedTD.focus = false
   //       taskscp.find(td => td.id === id).focus = true
   //       setTasks(taskscp)
   //    },
   //    focusUp: id => {
   //       const taskscp = [...tasks]
   //       const tdIdx = taskscp.findIndex(td => td.id === id)
   //       if (tdIdx > 0) {
   //          taskscp[tdIdx].focus = false
   //          taskscp[tdIdx - 1].focus = true
   //       }
   //       setTasks(taskscp)
   //    },
   //    focusDown: id => {
   //       const taskscp = [...tasks]
   //       const tdIdx = taskscp.findIndex(td => td.id === id)
   //       if (tdIdx < tasks.length - 1) {
   //          taskscp[tdIdx].focus = false
   //          taskscp[tdIdx + 1].focus = true
   //       }
   //       setTasks(taskscp)
   //    },
   //    focusOnFirst: () =>
   //       setTasks(prevTasks => {
   //          let taskscp = [...prevTasks]
   //          taskscp[0].focus = true
   //          return taskscp
   //       }),
   //    focusOnLast: () =>
   //       setTasks(prevTasks => {
   //          let taskscp = [...prevTasks]
   //          taskscp[taskscp.length - 1].focus = true
   //          return taskscp
   //       }),
   //    deleteTask: id => {
   //       sheetHandlers.add(
   //          'deleted',
   //          tasks.find(task => task.id === id)
   //       )
   //       remove(id)
   //    },
   //    postpone: id => {
   //       sheetHandlers.add(
   //          'backlog',
   //          tasks.find(task => task.id === id)
   //       )
   //       remove(id)
   //    },
   //    promote: id => {
   //       sheetHandlers.add(
   //          'todos',
   //          tasks.find(task => task.id === id)
   //       )
   //       remove(id)
   //    },
   // }

   // const clearCompleted = () => {
   //    tasks.filter(t => t.done).forEach(t => sheetHandlers.add('done', t))
   //    const newTasks = tasks.filter(t => !t.done)
   //    setTasks(newTasks)
   // }

   const quitFocus = id => {
      let taskscp = [...tasks]
      taskscp.find(t => t.id === id).focus = false
      setTasks(taskscp)
   }
   const handleInputKeyDown = (e, id) => {
      if (e.key === 'Enter') {
         quitFocus(id)
         addTask(id)
      }
   }

   const addTask = aboveId => {
      const maxTaskId = tasks.length ? Math.max(...tasks.map(t => t.id)) : 0
      let newTask = { id: maxTaskId + 1, focus: true }

      if (aboveId) {
         let taskscp = [...tasks]
         const aboveTaskIdx = taskscp.findIndex(t => t.id === aboveId)
         taskscp.splice(aboveTaskIdx + 1, 0, newTask)
         setTasks(taskscp)
      } else {
         setTasks(prevTasks => [...prevTasks, newTask])
      }
   }

   return (
      <>
         <TaskInfo tasks={tasks}></TaskInfo>
         <h3>{name}</h3>
         <ul>
            {tasks.map(t => (
               <li onKeyDown={e => handleInputKeyDown(e, t.id)} key={t.id}>
                  <IsolatedTask focus={t.focus} initialData={t.data}></IsolatedTask>
               </li>
            ))}
         </ul>
      </>
   )
}

export default IsolatedTaskList
