import { useEffect, useMemo, useState } from 'react'
import { helper } from '../helper'
import NavigableList from './NavigableList'
import type { ListConf } from './Sheet'
import { isTaskList, readStoredJson, writeStoredJson } from '../storage'
import { updateTaskField } from '../taskState'
import type { EditableTaskField } from '../taskState'
import type {
   NavigableHandlers,
   SheetHandlers,
   TaskItemHandlers,
   TaskListMovement,
} from './handlers'
import '../styles/List.css'

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

const List = ({
   sheetName,
   name,
   listConfig,
   sheetHandlers,
   taskMovement,
   isActive,
   activateHandler,
   onStorageError,
}: {
   sheetName: string
   name: string
   listConfig: ListConf
   sheetHandlers: SheetHandlers
   taskMovement: TaskListMovement | undefined
   isActive: boolean
   activateHandler: (a: string) => void
   onStorageError: (key: string, message?: string) => void
}) => {
   const listActions = listConfig.listActions
   const canPostpone =
      !!listActions.postponeTo &&
      !['fixed', 'microHabits'].includes(name) &&
      !['fixed', 'microHabits'].includes(listActions.postponeTo)

   const [list, setList] = useState<Task[]>([])
   const [loadedListKey, setLoadedListKey] = useState<string>()
   const [loadError, setLoadError] = useState<string>()
   const [visible, setVisible] = useState<boolean>(!!listConfig.listLook.visible)

   const LS_LIST_KEY = useMemo(() => sheetName + '.' + name, [sheetName, name])

   useEffect(() => {
      try {
         const savedList = readStoredJson(localStorage, LS_LIST_KEY, [], isTaskList)
         const loadedList = savedList.length ? savedList : [{ ...defaultNewTask, id: 1 }]
         if (isActive && !loadedList.some(task => task.focus)) {
            loadedList[0] = { ...loadedList[0], focus: true }
         }
         setList(loadedList)
         setLoadedListKey(LS_LIST_KEY)
         setLoadError(undefined)
         onStorageError(LS_LIST_KEY)
      } catch (error) {
         const message = error instanceof Error ? error.message : String(error)
         setLoadError(message)
         onStorageError(LS_LIST_KEY, `${message} The saved list was left unchanged.`)
      }
   }, [LS_LIST_KEY])

   useEffect(() => {
      if (loadedListKey === LS_LIST_KEY) {
         try {
            writeStoredJson(localStorage, LS_LIST_KEY, list)
            onStorageError(LS_LIST_KEY)
         } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            onStorageError(LS_LIST_KEY, `${message} Your latest task changes may not be saved.`)
         }
      }
   }, [list, LS_LIST_KEY, loadedListKey, onStorageError])

   useEffect(() => {
      if (!isActive) unFocusAll()
      else if (!list.find(i => i.focus === true)) navigableHandlers.focusOnFirst()
   }, [isActive])

   useEffect(() => {
      if (taskMovement?.targetTaskList === name) {
         const tasksToMove =
            taskMovement.position === 0
               ? [...taskMovement.tasksToMove].reverse()
               : taskMovement.tasksToMove
         let id: number | undefined = undefined
         tasksToMove.forEach(t => {
            // taskMovement.position: -1 = last; 0 = first; other = that position
            if (taskMovement.position > 0) id = list[taskMovement.position].id
            addTask(id, !isNaN(taskMovement.position) ? taskMovement.position : 1, t)
         })
         sheetHandlers.taskMoved()
      }
   }, [taskMovement, name])

   const handleInputKeyDown = (e: React.KeyboardEvent) => {
      if (loadError) return
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault()
         e.stopPropagation()
      }
      const task = list.find(i => i.focus)
      if (!task) return
      if (
         listActions.removeTo !== undefined &&
         (e.key === 'Backspace' || e.key === 'Delete') &&
         (e.altKey || !task.text)
      ) {
         deleteItem(task.id)
         e.preventDefault()
      }
      if (e.altKey) {
         if (canPostpone && e.key === 'ArrowRight') {
            postpone(task.id)
            e.preventDefault()
         }
         if (listActions.promoteTo && e.key === 'ArrowLeft') {
            promote(task.id)
            e.preventDefault()
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

   const setItemAttr = <K extends EditableTaskField>(id: number, field: K, value: Task[K]) => {
      setList(current => updateTaskField(current, id, field, value))
   }

   const itemHandlers: TaskItemHandlers = {
      setIndentation: (id: number, value: number) => setItemAttr(id, 'indentation', value),
      setSize: (id: number, value: number) => setItemAttr(id, 'size', value),
      setText: (id: number, value: string) => setItemAttr(id, 'text', value),
      setDone: (id: number, value: boolean) => setItemAttr(id, 'done', value),
      reorderTask: (sourceId: number, targetId: number, insertAfter: boolean) => {
         const sourceIndex = list.findIndex(task => task.id === sourceId)
         const targetIndex = list.findIndex(task => task.id === targetId)
         if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return

         const listCopy = [...list]
         const [taskToMove] = listCopy.splice(sourceIndex, 1)
         const adjustedTargetIndex = listCopy.findIndex(task => task.id === targetId)
         listCopy.splice(adjustedTargetIndex + Number(insertAfter), 0, taskToMove)
         setList(listCopy)
      },
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

   const navigableHandlers: NavigableHandlers = {
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
   const postpone = (id: number) => {
      if (canPostpone) migrateToListById(id, 0, listActions.postponeTo)
   }
   const promote = (id: number) => migrateToListById(id, -1, listActions.promoteTo)

   const migrateToListById = (id: number, position: number, targetList?: string | null) => {
      if (targetList === undefined) return
      const taskToMove = list.find(task => task.id === id)
      if (taskToMove?.text) sheetHandlers.add([taskToMove], targetList, position)
      remove(id)
   }

   const clearCompleted = () => {
      if (listActions.clearCompletedTo === undefined) return
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
      if (!listActions.copyAllTo) return
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
         listcp[currentIndex] = targetItem
         listcp[targetIndexToMove] = { ...currentItem, indentation: targetItem.indentation }
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
      <section
         onKeyDown={handleInputKeyDown}
         className={`taskListPanel${isActive ? ' activeList' : ''}`}
         aria-label={`${name} task list`}
      >
         {loadError ? (
            <p className='backupMessage backupError' role='alert'>
               This task list could not be loaded. Import a backup to recover it.
            </p>
         ) : (
            <NavigableList
               list={list}
               name={name}
               navigableHandlers={navigableHandlers}
               itemHandlers={itemHandlers}
               listConfig={listConfig}
               visible={visible || isActive}
            ></NavigableList>
         )}
         {!loadError && visible && listActions.clearCompletedTo && (
            <button onClick={clearCompleted}>Clear complete</button>
         )}
         {!loadError && visible && listActions.resetCompleted && (
            <button onClick={resetCompleted}>Reset Completed</button>
         )}
         {!loadError && listActions.copyAllTo && <button onClick={copyAllMarked}>Copy All</button>}
         <button onClick={toggleVisibility}>{visible ? 'hide' : 'show'}</button>
      </section>
   )
}

export default List
