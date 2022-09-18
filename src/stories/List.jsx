import { useEffect, useMemo, useState } from 'react'
import NavigableList from './NavigableList'

// @param {itemActions} determines the posible actions for this list (add, editable, navigable, completable, sizeable, sortable)
const List = ({ sheetName, name, listConfig, sheetHandlers, taskMovement }) => {
   const [list, setList] = useState([])

   const active = useMemo(() => listConfig.focus, [listConfig.focus])
   const LS_LIST_KEY = useMemo(() => sheetName + '.' + name, [sheetName, name])

   const listMovements = listConfig.listMovements

   useEffect(() => {
      let loadedList = JSON.parse(localStorage.getItem(LS_LIST_KEY))
      if (!loadedList)
         loadedList = [{ id: 1, focus: true, text: '', done: false, size: 1, relevance: 1 }]

      setList(loadedList)
   }, [LS_LIST_KEY])

   useEffect(() => {
      if (list.length) localStorage.setItem(LS_LIST_KEY, JSON.stringify(list))
   }, [list, LS_LIST_KEY])

   useEffect(() => {
      if (!active) unFocusAll()
      else navigableHandlers.focusOnFirst()
   }, [active])

   useEffect(() => {
      if (taskMovement?.targetTaskList === name) {
         //is a new task for me, adding it...
         addTask(null, taskMovement.taskToMove)
         sheetHandlers.taskMoved()
      }
   }, [taskMovement, name])

   // clearCompletedTo, removeTo, postponeTo, promoteTo
   const handleInputKeyDown = e => {
      const id = list.find(i => i.focus).id
      if (
         listMovements.removeTo &&
         (e.key === 'Backspace' || e.key === 'Delete') &&
         (e.altKey || !list.find(i => i.id === id).text)
      ) {
         deleteItem(id)
         e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
      }
      if (e.altKey) {
         if (listMovements.postponeTo && e.key === 'ArrowRight') {
            postpone(id)
            e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
         }
         if (listMovements.promoteTo && e.key === 'ArrowLeft') {
            promote(id)
            e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
         }
      }
   }

   const unFocusAll = () => {
      if (list.length) {
         let listcp = [...list]
         listcp.forEach(i => (i.focus = false))
         setList(listcp)
      }
   }

   const setItemAttr = (id, attr, value) => {
      let listcp = [...list]
      listcp.find(i => i.id === id)[attr] = value
      setList(listcp)
   }

   const itemHandlers = {
      setSize: (id, value) => setItemAttr(id, 'size', value),
      setText: (id, value) => setItemAttr(id, 'text', value),
      setDone: (id, value) => setItemAttr(id, 'done', value),
      handleOnItemClick: id => focusOn(id),
   }

   const addTask = (aboveId, taskToAdd) => {
      const maxTaskId = list.length ? Math.max(...list.map(t => t.id)) : 0
      let newTask = taskToAdd ? taskToAdd : { focus: true }
      newTask = { ...newTask, id: maxTaskId + 1 }
      if (aboveId) {
         let listcp = [...list]
         const aboveTaskIdx = listcp.findIndex(t => t.id === aboveId)
         listcp.splice(aboveTaskIdx + 1, 0, newTask)
         setList(listcp)
      } else {
         setList(prevlist => [...prevlist, newTask])
      }
   }

   const navigableHandlers = {
      addTask: aboveId => addTask(aboveId),
      moveUp: id => move(id, -1),
      moveDown: id => move(id, 1),
      focusOnFirst: () => {
         if (list.length) focusOn(list[0].id)
      },
      focusOnLast: () => {
         if (list.length) focusOn(list[list.length - 1].id)
      },
      focusUp: id => slideFocus(id, -1),
      focusDown: id => slideFocus(id, 1),
   }

   const deleteItem = id => migrateToList(id, listMovements.removeTo)
   const postpone = id => migrateToList(id, listMovements.postponeTo)
   const promote = id => migrateToList(id, listMovements.promoteTo)

   const migrateToList = (id, targetList) => {
      sheetHandlers.add(
         list.find(task => task.id === id),
         targetList
      )
      remove(id)
   }

   const move = (id, positions) => {
      const listcp = [...list]
      const currentIndex = listcp.findIndex(t => t.id === id)
      if (listcp[currentIndex + positions]) {
         const currentItem = listcp.find(t => t.id === id)
         listcp[currentIndex] = listcp[currentIndex + positions]
         listcp[currentIndex + positions] = currentItem
         setList(listcp)
      }
   }
   const isLastItem = id => list.findIndex(t => t.id === id) === list.length - 1
   const remove = id => {
      if (isLastItem(id)) {
         navigableHandlers.focusUp(id)
      } else {
         navigableHandlers.focusDown(id)
      }
      const listcp = [...list]
      const updatedlist = listcp.filter(i => i.id !== id)
      setList(updatedlist)
   }

   const slideFocus = (id, positions) => {
      const tdIdx = list.findIndex(td => td.id === id)
      if (
         (positions < 0 && tdIdx + positions >= 0) ||
         (positions > 0 && tdIdx + positions < list.length)
      )
         focusOn(list[tdIdx + positions].id)
   }

   const focusOn = id => {
      let listcp = [...list]
      unFocusAll()
      listcp.find(i => i.id === id).focus = true
      setList(listcp)
   }

   return (
      <div onKeyDown={e => handleInputKeyDown(e)}>
         <NavigableList
            list={list}
            name={name}
            navigableHandlers={navigableHandlers}
            itemHandlers={itemHandlers}
            itemActions={listConfig.itemsNavigation}
         ></NavigableList>
      </div>
   )
}

export default List
