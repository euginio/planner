import { useEffect, useState } from 'react'
import Task from './Task'
import TaskInfo from './TaskInfo'

const List = ({ sheetName, name }) => {
   const LS_LIST_KEY = sheetName + '.' + name

   let loadedList = JSON.parse(localStorage.getItem(LS_LIST_KEY))
   if (loadedList) {
      loadedList[loadedList.length - 1].focus = true
   } else {
      loadedList = [{ id: 1, focus: true }]
   }
   const [list, setList] = useState(loadedList)

   useEffect(() => {
      if (list.length) localStorage.setItem(LS_LIST_KEY, JSON.stringify(list))
   }, [list])

   // const remove = id => {
   //    if (listHandlers.isLastTask(id)) {
   //       listHandlers.focusUp(id)
   //    } else {
   //       listHandlers.focusDown(id)
   //    }
   //    const listcp = [...list]
   //    const updatedlist = listcp.filter(task => task.id !== id)
   //    setlist(updatedlist)
   // }

   // const listHandlers = {
   //    updateTask: task => {
   //       const listcp = [...list]
   //       let taskIdxToReplace = listcp.findIndex(td => td.id === task.id)
   //       listcp[taskIdxToReplace] = task
   //       setlist(listcp)
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
   //       const maxTaskId = list.length ? Math.max(...list.map(t => t.id)) : 0
   //       newTask.id = maxTaskId + 1

   //       if (aboveId) {
   //          let listcp = [...list]
   //          const aboveTaskIdx = listcp.findIndex(t => t.id === aboveId)
   //          listcp.splice(aboveTaskIdx + 1, 0, newTask)
   //          setlist(listcp)
   //       } else {
   //          setlist(prevlist => [...prevlist, newTask])
   //       }
   //    },
   //    isLastTask: id => list.findIndex(t => t.id === id) === list.length - 1,
   //    moveUp: id => {
   //       const listcp = [...list]
   //       const currentIndex = listcp.findIndex(t => t.id === id)
   //       const currentTask = listcp.find(t => t.id === id)
   //       currentTask.focus = true
   //       listcp[currentIndex] = listcp[currentIndex - 1]
   //       listcp[currentIndex - 1] = currentTask
   //       setlist(listcp)
   //    },
   //    moveDown: id => {
   //       const listcp = [...list]
   //       const currentIndex = listcp.findIndex(t => t.id === id)
   //       const currentTask = listcp.find(t => t.id === id)
   //       currentTask.focus = true
   //       listcp[currentIndex] = listcp[currentIndex + 1]
   //       listcp[currentIndex + 1] = currentTask
   //       setlist(listcp)
   //    },
   //    focusOn: id => {
   //       const listcp = [...list]
   //       const focusedTD = listcp.find(t => t.focus === true)
   //       if (focusedTD) focusedTD.focus = false
   //       listcp.find(td => td.id === id).focus = true
   //       setlist(listcp)
   //    },
   //    focusUp: id => {
   //       const listcp = [...list]
   //       const tdIdx = listcp.findIndex(td => td.id === id)
   //       if (tdIdx > 0) {
   //          listcp[tdIdx].focus = false
   //          listcp[tdIdx - 1].focus = true
   //       }
   //       setlist(listcp)
   //    },
   //    focusDown: id => {
   //       const listcp = [...list]
   //       const tdIdx = listcp.findIndex(td => td.id === id)
   //       if (tdIdx < list.length - 1) {
   //          listcp[tdIdx].focus = false
   //          listcp[tdIdx + 1].focus = true
   //       }
   //       setlist(listcp)
   //    },
   //    focusOnFirst: () =>
   //       setlist(prevlist => {
   //          let listcp = [...prevlist]
   //          listcp[0].focus = true
   //          return listcp
   //       }),
   //    focusOnLast: () =>
   //       setlist(prevlist => {
   //          let listcp = [...prevlist]
   //          listcp[listcp.length - 1].focus = true
   //          return listcp
   //       }),
   //    deleteTask: id => {
   //       sheetHandlers.add(
   //          'deleted',
   //          list.find(task => task.id === id)
   //       )
   //       remove(id)
   //    },
   //    postpone: id => {
   //       sheetHandlers.add(
   //          'backlog',
   //          list.find(task => task.id === id)
   //       )
   //       remove(id)
   //    },
   //    promote: id => {
   //       sheetHandlers.add(
   //          'todos',
   //          list.find(task => task.id === id)
   //       )
   //       remove(id)
   //    },
   // }

   // const clearCompleted = () => {
   //    list.filter(t => t.done).forEach(t => sheetHandlers.add('done', t))
   //    const newlist = list.filter(t => !t.done)
   //    setlist(newlist)
   // }

   const quitFocus = id => {
      let listcp = [...list]
      listcp.find(t => t.id === id).focus = false
      setList(listcp)
   }
   const handleInputKeyDown = (e, id) => {
      if (e.key === 'Enter') {
         quitFocus(id)
         addTask(id)
      }
   }

   const addTask = aboveId => {
      const maxTaskId = list.length ? Math.max(...list.map(t => t.id)) : 0
      let newTask = { id: maxTaskId + 1, focus: true }

      if (aboveId) {
         let listcp = [...list]
         const aboveTaskIdx = listcp.findIndex(t => t.id === aboveId)
         listcp.splice(aboveTaskIdx + 1, 0, newTask)
         setList(listcp)
      } else {
         setList(prevlist => [...prevlist, newTask])
      }
   }

   const saveItem = (data, id) => {
      let listcp = list
      listcp.find(i => i.id === id).data = data
      setList(listcp)
   }

   return (
      <>
         <TaskInfo tasks={list}></TaskInfo>
         <h3>{name}</h3>
         <ul>
            {list.map(t => (
               <li onKeyDown={e => handleInputKeyDown(e, t.id)} key={t.id}>
                  <Task
                     focus={t.focus}
                     initialData={t.data}
                     saveHandler={task => saveItem(task, t.id)}
                  ></Task>
               </li>
            ))}
         </ul>
      </>
   )
}

export default List
