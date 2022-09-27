import { useEffect, useMemo, useState } from 'react'
import NavigableList from './NavigableList'

// @param {itemActions} determines the posible actions for this list (add, editable, navigable, completable, sizeable, sortable)
const List = ({
   sheetName,
   name,
   listConfig,
   sheetHandlers,
   taskMovement,
   isActive,
   activateHandler,
}) => {
   const [list, setList] = useState([])

   const LS_LIST_KEY = useMemo(() => sheetName + '.' + name, [sheetName, name])
   const defaultNewTask = useMemo(
      () => ({ focus: true, text: '', done: false, size: 1, impact: 1 }),
      []
   )
   const listMovements = listConfig.listMovements

   useEffect(() => {
      let loadedList = JSON.parse(localStorage.getItem(LS_LIST_KEY))
      if (!loadedList) loadedList = [{ id: 1, ...defaultNewTask }]

      setList(loadedList)
   }, [LS_LIST_KEY])

   useEffect(() => {
      if (list.length) localStorage.setItem(LS_LIST_KEY, JSON.stringify(list))
   }, [list, LS_LIST_KEY])

   useEffect(() => {
      if (!isActive) unFocusAll()
      else if (!list.find(i => i.focus === true)) navigableHandlers.focusOnFirst()
   }, [isActive])

   useEffect(() => {
      if (taskMovement?.targetTaskList === name) {
         //is a new task for me, adding it...
         taskMovement.tasksToMove.forEach(t => {
            // taskMovement.position: -1 = last; 0 = first; other = that position
            let id = null
            if (taskMovement.position === -1) id = list[list.length - 1].id
            if (taskMovement.position > 0) id = list[taskMovement.position].id
            addTask(id, 1, t)
         })
         sheetHandlers.taskMoved()
      }
   }, [taskMovement, name])

   // clearCompletedTo, removeTo, postponeTo, promoteTo
   const handleInputKeyDown = e => {
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault() // prevents put prompt at begining
         e.stopPropagation()
      }
      const id = list.find(i => i.focus)?.id || list[0].id
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
      handleOnItemClick: id => {
         focusOn(id)
         activateHandler(name)
      },
   }

   const addTask = (aboveId, positions = 1, taskToAdd) => {
      setList(prevlist => {
         const maxTaskId = prevlist.length ? Math.max(...prevlist.map(t => t.id)) : 0
         let newTask = taskToAdd ? taskToAdd : defaultNewTask
         newTask = { ...newTask, id: maxTaskId + 1 }
         let listcp = [...prevlist]
         if (aboveId) {
            listcp.find(t => t.id === aboveId).focus = false
            const aboveTaskIdx = listcp.findIndex(t => t.id === aboveId)
            listcp.splice(aboveTaskIdx + positions, 0, newTask)
         } else {
            listcp.unshift(newTask)
         }
         return listcp
      })
   }

   const navigableHandlers = {
      addTask: (aboveId, positions) => addTask(aboveId, positions),
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

   const deleteItem = id => migrateToListById(id, listMovements.removeTo, 0)
   const postpone = id => migrateToListById(id, listMovements.postponeTo, 0)
   const promote = id => migrateToListById(id, listMovements.promoteTo, -1)

   const migrateToListById = (id, targetList, position) => {
      if (!targetList) return
      sheetHandlers.add([list.find(task => task.id === id)], targetList, position)
      remove(id)
   }

   const clearCompleted = () => {
      sheetHandlers.add(
         list.filter(t => t.done),
         listMovements.clearCompletedTo
      )
      const listcp = [...list.filter(t => !t.done)]
      setList(listcp)
   }

   const move = (id, positions) => {
      const currentIndex = list.findIndex(t => t.id === id)
      const newIndexToMove = currentIndex + positions
      if (list[newIndexToMove]) {
         const listcp = [...list]
         const currentItem = listcp.find(t => t.id === id)
         listcp[currentIndex] = listcp[newIndexToMove]
         listcp[newIndexToMove] = currentItem
         setList(listcp)
      } else {
         if (newIndexToMove < 0) promote(id)
         else if (newIndexToMove > list.length - 1) postpone(id)
      }
   }
   const isBottomItem = id => list.findIndex(t => t.id === id) === list.length - 1
   const remove = id => {
      if (isBottomItem(id)) {
         navigableHandlers.focusUp(id)
      } else {
         navigableHandlers.focusDown(id)
      }
      const listcp = [...list]
      const updatedlist = listcp.filter(i => i.id !== id)
      setList(updatedlist)
   }

   const slideFocus = (id, positions) => {
      const startIdx = list.findIndex(td => td.id === id)
      const newIdxToFocus = startIdx + positions
      if (newIdxToFocus >= 0 && newIdxToFocus < list.length) focusOn(list[newIdxToFocus].id)
   }

   const focusOn = id => {
      unFocusAll()
      let listcp = [...list]
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
         {listConfig.listMovements.clearCompletedTo && (
            <button onClick={clearCompleted}>Clear complete</button>
         )}
      </div>
   )
}

export default List
