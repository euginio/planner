import { useEffect, useMemo, useState } from 'react'
import DummyList from './DummyList'
import NavigableList from './NavigableList'

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

   // const postpone = id => {
   //    sheetHandlers.add(
   //       'backlog',
   //       list.find(task => task.id === id)
   //    )
   //    remove(id)
   // }
   // const promote = id => {
   //    sheetHandlers.add(
   //       'todos',
   //       list.find(task => task.id === id)
   //    )
   //    remove(id)
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

      // if (e.altKey) {
      //    if (e.key === 'ArrowRight') {
      //       postpone()
      //       e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
      //    }
      // }
      // if (e.altKey) {
      //    if (e.key === 'ArrowLeft') {
      //       promote()
      //       e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
      //    }
      // }
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

   const setItemAttr = (id, attr, value) => {
      let listcp = [...list]
      listcp.find(i => i.id === id)[attr] = value
      setList(listcp)
   }

   const listHandler = {
      setSize: (id, value) => setItemAttr(id, 'size', value),
      setText: (id, value) => setItemAttr(id, 'text', value),
      setDone: (id, value) => setItemAttr(id, 'done', value),
   }

   const move = (id, positions) => {
      const listcp = [...list]
      const currentIndex = listcp.findIndex(t => t.id === id)
      const currentTask = listcp.find(t => t.id === id)
      listcp[currentIndex] = listcp[currentIndex + positions]
      listcp[currentIndex + positions] = currentTask
      setList(listcp)
   }
   const moveUp = id => move(id, -1)
   const moveDown = id => move(id, 1)

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
   const handleOnItemClick = id => focusOn(id)

   return (
      <>
         <NavigableList
            {...{ list, name, handleInputKeyDown, handleOnItemClick, listHandler }}
         ></NavigableList>
      </>
   )
}

export default List
