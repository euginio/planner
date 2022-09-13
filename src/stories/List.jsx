import { useEffect, useMemo, useState } from 'react'
import Task from './Task'

import TaskInfo from './TaskInfo'

const List = ({ sheetName, name }) => {
   const [list, setList] = useState([])
   const LS_LIST_KEY = useMemo(() => sheetName + '.' + name, [sheetName, name])

   useEffect(() => {
      let loadedList = JSON.parse(localStorage.getItem(LS_LIST_KEY))
      if (loadedList) {
         loadedList[loadedList.length - 1].focus = true
      } else {
         loadedList = [{ id: 1, focus: true, text: '', done: false, size: 1, relevance: 1 }]
      }
      setList(loadedList)
   }, [LS_LIST_KEY])

   useEffect(() => {
      if (list.length) localStorage.setItem(LS_LIST_KEY, JSON.stringify(list))
   }, [list, LS_LIST_KEY])

   // const listHandlers = {
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
   //    setList(newlist)
   // }

   const deleteTask = id => {
      // sheetHandlers.add(
      //    'deleted',
      //    list.find(task => task.id === id)
      // )
      remove(id)
   }

   const remove = id => {
      if (isLastTask(id)) {
         focusUp(id)
      } else {
         focusDown(id)
      }
      const listcp = [...list]
      const updatedlist = listcp.filter(task => task.id !== id)
      setList(updatedlist)
   }

   const isLastTask = id => list.findIndex(t => t.id === id) === list.length - 1

   const focusOnFirst = () => focusOn(list[0].id)
   const focusOnLast = () => focusOn(list[list.length - 1].id)

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
      if (e.key === 'ArrowUp') {
         if (e.altKey) {
            moveUp(id)
         } else {
            // e.stopPropagation()
            focusUp(id)
         }
         e.preventDefault() // prevents put prompt at begining
      }
      if (e.key === 'ArrowDown') {
         if (e.altKey) {
            moveDown(id)
         } else {
            focusDown(id)
         }
      }
      if (e.ctrlKey) {
         if (e.key === 'End') {
            focusOnLast(id)
            e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
         }
         if (e.key === 'Home') {
            focusOnFirst(id)
            e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
         }
      }
      if (
         (e.key === 'Backspace' || e.key === 'Delete') &&
         (e.altKey || !list.find(i => i.id === id).text)
      ) {
         deleteTask(id)
         e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
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

   const listHandler = {
      setSize: (id, value) => {
         let listcp = [...list]
         listcp.find(i => i.id === id).size = value
         setList(listcp)
      },
      setText: (id, value) => {
         let listcp = [...list]
         listcp.find(i => i.id === id).text = value
         setList(listcp)
      },

      setDone: (id, value) => {
         let listcp = [...list]
         listcp.find(i => i.id === id).done = value
         setList(listcp)
      },
   }

   const moveUp = id => {
      const listcp = [...list]
      const currentIndex = listcp.findIndex(t => t.id === id)
      const currentTask = listcp.find(t => t.id === id)
      currentTask.focus = true
      listcp[currentIndex] = listcp[currentIndex - 1]
      listcp[currentIndex - 1] = currentTask
      setList(listcp)
   }
   const moveDown = id => {
      const listcp = [...list]
      const currentIndex = listcp.findIndex(t => t.id === id)
      const currentTask = listcp.find(t => t.id === id)
      currentTask.focus = true
      listcp[currentIndex] = listcp[currentIndex + 1]
      listcp[currentIndex + 1] = currentTask
      setList(listcp)
   }

   const focusUp = id => changeFocus(id, -1, tdIdx => tdIdx > 0)

   const focusDown = id => changeFocus(id, 1, tdIdx => tdIdx < list.length - 1)

   const changeFocus = (id, addingValue, condition) => {
      const tdIdx = list.findIndex(td => td.id === id)
      if (condition(tdIdx)) focusOn(list[tdIdx + addingValue].id)
   }

   const focusOn = id => {
      let listcp = [...list]
      listcp.find(i => i.focus).focus = false
      listcp.find(i => i.id === id).focus = true
      setList(listcp)
   }
   const handleOnClick = id => focusOn(id)

   return (
      <>
         <TaskInfo tasks={list}></TaskInfo>
         <h3>{name}</h3>
         <ul>
            {list.map(t => (
               <li
                  onKeyDown={e => handleInputKeyDown(e, t.id)}
                  key={t.id}
                  onClick={() => handleOnClick(t.id)}
               >
                  <Task editable={t.focus} {...t} handlers={listHandler}></Task>
               </li>
            ))}
         </ul>
         {/* <button onClick={clearCompleted}>Clear complete</button> */}
      </>
   )
}

export default List
