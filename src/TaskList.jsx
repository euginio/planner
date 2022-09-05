import Task from './Task'

const TaskList = ({ name, tasks, tasksSetter, sheetHandlers }) => {
   const listHandlers = {
      updateTask: task => {
         const taskscp = [...tasks]
         let td = taskscp.find(td => td.id === task.id)
         td = task
         tasksSetter(taskscp)
      },
      addTask: aboveId => {
         const maxTaskId = tasks.length ? Math.max(...tasks.map(t => t.id)) : 0
         const newTask = {
            text: '',
            done: false,
            focus: true,
            size: 1,
            id: maxTaskId + 1,
         }
         if (aboveId) {
            let taskscp = [...tasks]
            const aboveTaskIdx = taskscp.findIndex(t => t.id == aboveId)
            newTask.focus = true
            taskscp.splice(aboveTaskIdx + 1, 0, newTask)
            tasksSetter(taskscp)
         } else {
            tasksSetter(prevTasks => [...prevTasks, newTask])
         }
      },
      isLastTask: id => tasks.findIndex(t => t.id == id) == tasks.length - 1,
      remove: id => {
         if (listHandlers.isLastTask(id)) {
            listHandlers.focusUp(id)
         } else {
            listHandlers.focusDown(id)
         }
         const taskscp = [...tasks]
         const updatedTasks = taskscp.filter(task => task.id !== id)
         tasksSetter(updatedTasks)
      },
      deleteTask: id => {
         sheetHandlers.addToDeleted(tasks.find(task => task.id == id))
         sheetHandlers.remove(id)
      },
      moveUp: id => {
         const taskscp = [...tasks]
         const currentIndex = taskscp.findIndex(t => t.id == id)
         const currentTask = taskscp.find(t => t.id == id)
         currentTask.focus = true
         taskscp[currentIndex] = taskscp[currentIndex - 1]
         taskscp[currentIndex - 1] = currentTask
         tasksSetter(taskscp)
      },
      moveDown: id => {
         const taskscp = [...tasks]
         const currentIndex = taskscp.findIndex(t => t.id == id)
         const currentTask = taskscp.find(t => t.id == id)
         currentTask.focus = true
         taskscp[currentIndex] = taskscp[currentIndex + 1]
         taskscp[currentIndex + 1] = currentTask
         tasksSetter(taskscp)
      },
      focusOn: id => {
         const taskscp = [...tasks]
         const focusedTD = taskscp.find(t => t.focus == true)
         if (focusedTD) focusedTD.focus = false
         taskscp.find(td => td.id === id).focus = true
         tasksSetter(taskscp)
      },
      focusUp: id => {
         const taskscp = [...tasks]
         const tdIdx = taskscp.findIndex(td => td.id === id)
         if (tdIdx > 0) {
            taskscp[tdIdx].focus = false
            taskscp[tdIdx - 1].focus = true
         }
         tasksSetter(taskscp)
      },
      focusDown: id => {
         const taskscp = [...tasks]
         const tdIdx = taskscp.findIndex(td => td.id === id)
         if (tdIdx < tasks.length - 1) {
            taskscp[tdIdx].focus = false
            taskscp[tdIdx + 1].focus = true
         }
         tasksSetter(taskscp)
      },
      focusOnFirst: () =>
         tasksSetter(prevTasks => {
            let taskscp = [...prevTasks]
            taskscp[0].focus = true
            return taskscp
         }),
      focusOnLast: () =>
         tasksSetter(prevTasks => {
            let taskscp = [...prevTasks]
            taskscp[taskscp.length - 1].focus = true
            return taskscp
         }),
      postpone: id => {
         sheetHandlers.postpone(tasks.find(t => t.id == id))
         listHandlers.remove(id)
      },
   }

   return (
      <>
         <h3>{name}</h3>
         <ul>
            {tasks.map(t => (
               <Task key={t.id} task={t} listHandlers={listHandlers}></Task>
            ))}
         </ul>
      </>
   )
}

export default TaskList
