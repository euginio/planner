import { useEffect, useMemo, useState } from 'react'
import NavigableList from './NavigableList'
import { ListConf, TaskMovement } from './Sheet'

export interface TaskI {
   focus: boolean
   text: string
   done: boolean
   size: number
   impact: number
}
export interface Task extends TaskI {
   id: number
}

// @param {itemActions} determines the posible actions for this list (add, editable, navigable, completable, sizeable, sortable)
const List = ({
   sheetName,
   name,
   listConfig,
   sheetHandlers,
   taskMovement,
   isActive,
   activateHandler,
}: {
   sheetName: string
   name: string
   listConfig: ListConf
   sheetHandlers: { [key: string]: (...a: any) => void }
   taskMovement: TaskMovement
   isActive: boolean
   activateHandler: (a: string) => void
}) => {
   const defaultNewTask: TaskI = useMemo(
      () => ({ focus: false, text: '', done: false, size: 1, impact: 1 }),
      []
   )
   const LS_LIST_KEY = useMemo(() => sheetName + '.' + name, [sheetName, name])
   let loadedList: Task[] = useMemo(() => {
      let loadedListdd = JSON.parse(localStorage.getItem(LS_LIST_KEY) || '[]')
      if (!loadedListdd.length) loadedListdd = [{ ...defaultNewTask, id: 1 }]
      return loadedListdd
   }, [])

   const [list, setList] = useState<Task[]>(loadedList)

   const listMovements = listConfig.listMovements

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
            let id = undefined
            if (taskMovement.position === -1) id = list[list.length - 1].id
            if (taskMovement.position > 0) id = list[taskMovement.position].id
            addTask(id, 1, t)
         })
         sheetHandlers.taskMoved()
      }
   }, [taskMovement, name])

   // clearCompletedTo, removeTo, postponeTo, promoteTo
   const handleInputKeyDown = (e: React.KeyboardEvent) => {
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault() // prevents put prompt at begining
         e.stopPropagation()
      }
      const task = list.find(i => i.focus)!
      if (
         listMovements.removeTo &&
         (e.key === 'Backspace' || e.key === 'Delete') &&
         (e.altKey || !task.text)
      ) {
         deleteItem(task.id)
         e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
      }
      if (e.altKey) {
         if (listMovements.postponeTo && e.key === 'ArrowRight') {
            postpone(task.id)
            e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
         }
         if (listMovements.promoteTo && e.key === 'ArrowLeft') {
            promote(task.id)
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

   const setItemAttr = (id: number, attr: string, value: any) => {
      let listcp = [...list]
      //@ts-ignore
      listcp.find(i => i.id === id)[attr] = value
      setList(listcp)
   }

   const itemHandlers: { [key: string]: (...a: any) => void } = {
      setSize: (id: number, value: number) => setItemAttr(id, 'size', value),
      setText: (id: number, value: string) => setItemAttr(id, 'text', value),
      setDone: (id: number, value: boolean) => setItemAttr(id, 'done', value),
      handleOnItemClick: (id: number) => {
         focusOn(id)
         activateHandler(name)
      },
   }

   const addTask = (aboveId?: number, positions?: number, taskToAdd?: Task) => {
      setList(prevlist => {
         const maxTaskId = prevlist.length ? Math.max(...prevlist.map(t => t.id || -1)) : 0
         let newTask = {
            ...(taskToAdd ? taskToAdd : { ...defaultNewTask, focus: true }),
            id: maxTaskId + 1,
         }
         let listcp = [...prevlist]
         if (aboveId) {
            listcp.find(t => t.id === aboveId)!.focus = false
            const aboveTaskIdx = listcp.findIndex(t => t.id === aboveId)
            listcp.splice(aboveTaskIdx + (positions || 1), 0, newTask)
         } else {
            listcp.unshift(newTask)
         }
         return listcp
      })
   }

   const navigableHandlers: { [key: string]: (...a: any) => void } = {
      addTask: (aboveId: number, positions: number) => addTask(aboveId, positions),
      moveUp: (id: number) => exchange(id, -1),
      moveDown: (id: number) => exchange(id, 1),
      focusOnFirst: () => {
         if (list.length) focusOn(list[0].id)
      },
      focusOnLast: () => {
         if (list.length) focusOn(list[list.length - 1].id)
      },
      focusUp: (id: number) => slideFocus(id, -1),
      focusDown: (id: number) => slideFocus(id, 1),
   }

   const deleteItem = (id: number) => migrateToListById(id, 0, listMovements.removeTo)
   const postpone = (id: number) => migrateToListById(id, 0, listMovements.postponeTo)
   const promote = (id: number) => migrateToListById(id, -1, listMovements.promoteTo)

   const migrateToListById = (id: number, position: number, targetList?: string | null) => {
      if (targetList === undefined) return //null allowed as target list
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

   const exchange = (id: number, positions: number) => {
      const currentIndex = list.findIndex(t => t.id === id)
      const newIndexToMove = currentIndex + positions
      if (list[newIndexToMove]) {
         const listcp = [...list]
         const currentItem = listcp.find(t => t.id === id)!
         //this swap items,
         listcp[currentIndex] = listcp[newIndexToMove]
         listcp[newIndexToMove] = currentItem
         setList(listcp)
      } else {
         if (newIndexToMove < 0) promote(id)
         else if (newIndexToMove > list.length - 1) postpone(id)
      }
   }
   const isBottomItem = (id: number) => list.findIndex(t => t.id === id) === list.length - 1
   const remove = (id: number) => {
      if (isBottomItem(id)) {
         navigableHandlers.focusUp(id)
      } else {
         navigableHandlers.focusDown(id)
      }
      const listcp = [...list]
      const updatedlist = listcp.filter(i => i.id !== id)
      setList(updatedlist)
   }

   const slideFocus = (id: number, positions: number) => {
      const startIdx = list.findIndex(td => td.id === id)
      const newIdxToFocus = startIdx + positions
      if (newIdxToFocus >= 0 && newIdxToFocus < list.length) focusOn(list[newIdxToFocus].id)
   }

   const focusOn = (id: number) => {
      unFocusAll()
      let listcp = [...list]
      listcp.find(i => i.id === id)!.focus = true
      setList(listcp)
   }

   return (
      <div onKeyDown={handleInputKeyDown}>
         <NavigableList
            list={list}
            name={name}
            navigableHandlers={navigableHandlers}
            itemHandlers={itemHandlers}
            itemActions={listConfig.itemsNavigation}
         ></NavigableList>
         {listMovements.clearCompletedTo && (
            <button onClick={clearCompleted}>Clear complete</button>
         )}
      </div>
   )
}

export default List
