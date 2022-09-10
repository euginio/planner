import { useEffect, useState } from 'react'
import OldTask from './OldTask'
import TaskInfo from './TaskInfo'

const OldTaskList = ({ sheetName, name, taskMovement, sheetHandlers, activeList }) => {
   const LS_TASKS_KEY = sheetName + '.' + name
   const [tasks, setTasks] = useState([])

   useEffect(() => {
      const loadedTasks = JSON.parse(localStorage.getItem(LS_TASKS_KEY))
      if (loadedTasks) setTasks(loadedTasks)
      else
         setTasks([
            {
               text: '',
               done: false,
               focus: true,
               size: 1,
               id: 1,
            },
         ])

      //just one update db
      // if (loadedTasks) {
      //    loadedTasks.forEach(t => {
      //       t.text = t.name
      //       delete t.name
      //       t.size = t.size || 1
      //    })
      //    setTasks(loadedTasks)
      // }
   }, [sheetName, name, LS_TASKS_KEY])

   useEffect(() => {
      if (tasks.length) localStorage.setItem(LS_TASKS_KEY, JSON.stringify(tasks))
   }, [tasks, LS_TASKS_KEY])

   useEffect(() => {
      if (tasks.length) {
         setTasks(prevTasks =>
            prevTasks.map(t => {
               return { ...t, focus: false }
            })
         )
         if (activeList === name) {
            listHandlers.focusOnFirst()
         }
      }
   }, [activeList, tasks.length, name])

   useEffect(() => {
      if (taskMovement.targetTaskList === name) {
         //is a new task for me, adding it...
         listHandlers.addTask(null, taskMovement.taskToMove)
         sheetHandlers.taskMoved()
      }
   }, [taskMovement, name])

   const remove = id => {
      if (listHandlers.isLastTask(id)) {
         listHandlers.focusUp(id)
      } else {
         listHandlers.focusDown(id)
      }
      const taskscp = [...tasks]
      const updatedTasks = taskscp.filter(task => task.id !== id)
      setTasks(updatedTasks)
   }

   const listHandlers = {
      updateTask: task => {
         const taskscp = [...tasks]
         let taskIdxToReplace = taskscp.findIndex(td => td.id === task.id)
         taskscp[taskIdxToReplace] = task
         setTasks(taskscp)
      },
      addTask: (
         aboveId,
         newTask = {
            text: '',
            done: false,
            focus: true,
            size: 1,
         }
      ) => {
         const maxTaskId = tasks.length ? Math.max(...tasks.map(t => t.id)) : 0
         newTask.id = maxTaskId + 1

         if (aboveId) {
            let taskscp = [...tasks]
            const aboveTaskIdx = taskscp.findIndex(t => t.id === aboveId)
            taskscp.splice(aboveTaskIdx + 1, 0, newTask)
            setTasks(taskscp)
         } else {
            setTasks(prevTasks => [...prevTasks, newTask])
         }
      },
      isLastTask: id => tasks.findIndex(t => t.id === id) === tasks.length - 1,
      moveUp: id => {
         const taskscp = [...tasks]
         const currentIndex = taskscp.findIndex(t => t.id === id)
         const currentTask = taskscp.find(t => t.id === id)
         currentTask.focus = true
         taskscp[currentIndex] = taskscp[currentIndex - 1]
         taskscp[currentIndex - 1] = currentTask
         setTasks(taskscp)
      },
      moveDown: id => {
         const taskscp = [...tasks]
         const currentIndex = taskscp.findIndex(t => t.id === id)
         const currentTask = taskscp.find(t => t.id === id)
         currentTask.focus = true
         taskscp[currentIndex] = taskscp[currentIndex + 1]
         taskscp[currentIndex + 1] = currentTask
         setTasks(taskscp)
      },
      focusOn: id => {
         const taskscp = [...tasks]
         const focusedTD = taskscp.find(t => t.focus === true)
         if (focusedTD) focusedTD.focus = false
         taskscp.find(td => td.id === id).focus = true
         setTasks(taskscp)
      },
      focusUp: id => {
         const taskscp = [...tasks]
         const tdIdx = taskscp.findIndex(td => td.id === id)
         if (tdIdx > 0) {
            taskscp[tdIdx].focus = false
            taskscp[tdIdx - 1].focus = true
         }
         setTasks(taskscp)
      },
      focusDown: id => {
         const taskscp = [...tasks]
         const tdIdx = taskscp.findIndex(td => td.id === id)
         if (tdIdx < tasks.length - 1) {
            taskscp[tdIdx].focus = false
            taskscp[tdIdx + 1].focus = true
         }
         setTasks(taskscp)
      },
      focusOnFirst: () =>
         setTasks(prevTasks => {
            let taskscp = [...prevTasks]
            taskscp[0].focus = true
            return taskscp
         }),
      focusOnLast: () =>
         setTasks(prevTasks => {
            let taskscp = [...prevTasks]
            taskscp[taskscp.length - 1].focus = true
            return taskscp
         }),
      deleteTask: id => {
         sheetHandlers.add(
            'deleted',
            tasks.find(task => task.id === id)
         )
         remove(id)
      },
      postpone: id => {
         sheetHandlers.add(
            'backlog',
            tasks.find(task => task.id === id)
         )
         remove(id)
      },
      promote: id => {
         sheetHandlers.add(
            'todos',
            tasks.find(task => task.id === id)
         )
         remove(id)
      },
   }

   const clearCompleted = () => {
      tasks.filter(t => t.done).forEach(t => sheetHandlers.add('done', t))
      const newTasks = tasks.filter(t => !t.done)
      setTasks(newTasks)
   }

   return (
      <>
         <TaskInfo tasks={tasks}></TaskInfo>
         <h3>{name}</h3>
         <ul>
            {tasks.map(t => (
               <OldTask key={t.id} task={t} listHandlers={listHandlers}></OldTask>
            ))}
         </ul>
         <button onClick={clearCompleted}>Clear complete</button>
      </>
   )
}

export default OldTaskList
