import { useEffect, useMemo, useState } from 'react'
import { helper } from '../helper'
import NavigableList from './NavigableList'
import { ListConf, TaskMovement } from './Sheet'

export interface TaskI {
   focus: boolean
   text: string
   done: boolean
   size: number
   impact: number
   indentation: number
   parent?: TaskI
}
export interface Task extends TaskI {
   id: number
}

const defaultNewTask: TaskI = {
   focus: false,
   text: '',
   done: false,
   size: 1,
   impact: 1,
   indentation: 0,
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
   const listActions = listConfig.listActions

   const [list, setList] = useState<Task[]>([])
   const [visible, setVisible] = useState<boolean>(!!listConfig.listLook.visible)

   const LS_LIST_KEY = useMemo(() => sheetName + '.' + name, [sheetName, name])

   useEffect(() => {
      let loadedList = JSON.parse(localStorage.getItem(LS_LIST_KEY) || '[]')
      if (!loadedList.length) loadedList = [{ ...defaultNewTask, id: 1 }]
      setList(loadedList)
   }, [LS_LIST_KEY])

   useEffect(() => {
      if (list.length) localStorage.setItem(LS_LIST_KEY, JSON.stringify(list))
   }, [list])

   useEffect(() => {
      if (!isActive) unFocusAll()
      else if (!list.find(i => i.focus === true)) navigableHandlers.focusOnFirst()
   }, [isActive])

   useEffect(() => {
      if (taskMovement?.targetTaskList === name) {
         //are new tasks for me, adding it...
         let id: number | undefined = undefined
         taskMovement.tasksToMove.reverse().forEach(t => {
            // taskMovement.position: -1 = last; 0 = first; other = that position
            if (taskMovement.position > 0) id = list[taskMovement.position].id
            addTask(id, !isNaN(taskMovement.position) ? taskMovement.position : 1, t)
         })
         sheetHandlers.taskMoved()
      }
   }, [taskMovement, name])

   const handleInputKeyDown = (e: React.KeyboardEvent) => {
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault() // prevents put prompt at begining
         e.stopPropagation()
      }
      const task = list.find(i => i.focus)!
      if (
         listActions.removeTo !== undefined &&
         (e.key === 'Backspace' || e.key === 'Delete') &&
         (e.altKey || !task.text)
      ) {
         deleteItem(task.id)
         e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
      }
      if (e.altKey) {
         if (listActions.postponeTo && e.key === 'ArrowRight') {
            postpone(task.id)
            e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
         }
         if (listActions.promoteTo && e.key === 'ArrowLeft') {
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
      setIndentation: (id: number, value: number) => setItemAttr(id, 'indentation', value),
      setSize: (id: number, value: number) => setItemAttr(id, 'size', value),
      setText: (id: number, value: string) => setItemAttr(id, 'text', value),
      setDone: (id: number, value: boolean) => setItemAttr(id, 'done', value),
      handleOnItemClick: (id: number) => {
         focusOn(id)
         activateHandler(name)
      },
   }

   const addTask = (fromId?: number, positions: number = 1, taskToAdd?: TaskI) => {
      setList(prevlist => {
         const maxTaskId = prevlist.length ? Math.max(...prevlist.map(t => t.id || -1)) : 0
         let newTask = {
            ...(taskToAdd
               ? {
                    ...taskToAdd,
                    indentation: taskToAdd.parent
                       ? taskToAdd.parent.indentation + 1
                       : taskToAdd.indentation,
                 }
               : { ...defaultNewTask, focus: true }),
            id: maxTaskId + 1,
         }
         let listcp = [...prevlist]
         if (fromId) {
            let fromTask = listcp.find(t => t.id === fromId)!
            fromTask.focus = false
            const aboveTaskIdx = listcp.findIndex(t => t.id === fromId)
            listcp.splice(aboveTaskIdx + positions, 0, {
               ...newTask,
               indentation: fromTask.indentation,
            })
         } else {
            if (positions === -1) listcp.push(newTask)
            else listcp.unshift(newTask)
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

   const deleteItem = (id: number) => migrateToListById(id, 0, listActions.removeTo)
   const postpone = (id: number) => migrateToListById(id, 0, listActions.postponeTo)
   const promote = (id: number) => migrateToListById(id, -1, listActions.promoteTo)

   const migrateToListById = (id: number, position: number, targetList?: string | null) => {
      if (targetList === undefined) return //null allowed as target list
      const taskToMove = list.find(task => task.id === id)
      if (taskToMove?.text) sheetHandlers.add([taskToMove], targetList, position)
      remove(id)
   }

   const clearCompleted = () => {
      if (listActions.clearCompletedTo === undefined) return //null allowed as target list
      const parentLabel = helper.getWeekDay() + ' ' + new Date().toLocaleDateString()
      const parentTask = { ...defaultNewTask, text: parentLabel }
      sheetHandlers.add(
         [
            parentTask,
            ...list.filter(t => t.done).map(t => ({ ...t, parent: parentTask, done: false })),
         ],
         listActions.clearCompletedTo,
         -1
      )
      const listcp = [...list.filter(t => !t.done)]
      setList(listcp)
   }
   const copyAllMarked = () => {
      sheetHandlers.add(
         list
            .filter(t => t.done)
            .map(t => ({ ...t, done: false }))
            .reverse(),
         listActions.copyAllTo,
         -1
      )
   }
   const resetCompleted = () => {
      setList(list.map(t => ({ ...t, done: false })))
   }

   const exchange = (id: number, positions: number) => {
      const currentIndex = list.findIndex(t => t.id === id)
      const targetIndexToMove = currentIndex + positions
      const targetItem = list[targetIndexToMove]
      if (targetItem) {
         const listcp = [...list]
         const currentItem = listcp.find(t => t.id === id)!
         //this swap items,
         listcp[currentIndex] = targetItem
         listcp[targetIndexToMove] = { ...currentItem, indentation: targetItem.indentation } //copy indentation of target item
         setList(listcp)
      } else {
         if (targetIndexToMove < 0) promote(id)
         else if (targetIndexToMove > list.length - 1) postpone(id)
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
   const toggleVisibility = () => setVisible(!visible)

   return (
      <div onKeyDown={handleInputKeyDown} className='itemList'>
         <NavigableList
            list={list}
            name={name}
            navigableHandlers={navigableHandlers}
            itemHandlers={itemHandlers}
            listConfig={listConfig}
            visible={visible || isActive}
         ></NavigableList>
         {visible && listActions.clearCompletedTo && (
            <button onClick={clearCompleted}>Clear complete</button>
         )}
         {visible && listActions.resetCompleted && (
            <button onClick={resetCompleted}>Reset Completed</button>
         )}
         {listActions.copyAllTo && <button onClick={copyAllMarked}>Copy All</button>}
         <button onClick={toggleVisibility}>{visible ? 'hide' : 'show'}</button>
      </div>
   )
}

export default List
