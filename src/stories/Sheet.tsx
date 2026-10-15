import { useState } from 'react'
import List, { Task } from './List'
import './Sheet.css'
import presetcon from './presetListConf.json'

interface ListActionsType {
   resetCompleted?: boolean
   removeTo?: string | null
   postponeTo?: string
   promoteTo?: string
   removeAllTo?: string | null
   copyAllTo?: string
   clearCompletedTo?: string | null
}

export interface itemNavigationType {
   add: boolean
   editable: boolean
   completable: boolean
   sizeable: boolean
   sortable: boolean
   indentable: boolean
   dragAndDrop?: boolean
}

export interface ListLook {
   lapse?: 'day' | 'week' | 'month' | 'year'
   visible?: boolean
   showListInfo?: boolean
   showLapseName?: boolean
}

export interface ListConf {
   listLook: ListLook
   listActions: ListActionsType
   itemsNavigation: itemNavigationType
}
export interface TaskMovement {
   targetTaskList: string
   tasksToMove: Task[]
   position: number
}
function Sheet({ name }: { name: string }) {
   // const listNames = ['todos', 'backlog', 'someday', 'done', 'deleted']

   const PresetlistsConf: { [key: string]: ListConf } = presetcon as { [key: string]: ListConf }
   const listsConf: { [key: string]: ListConf } = PresetlistsConf
   const listNames = Object.keys(listsConf)

   const [taskMovement, setTaskMovement] = useState<TaskMovement | undefined>()
   const [activeList, setActiveList] = useState(listNames[0])
   // const [goal, SetGoal] = useState<string>()

   const sheetHandlers: { [key: string]: (...a: any) => void } = {
      taskMoved: () => setTaskMovement(undefined),
      add: (items: Task[], targetTaskList: string, position: number = 0) =>
         setTaskMovement({ targetTaskList, tasksToMove: items, position }),
      // focusedOnMe: taskListName => setTaskMovement(taskListName),
   }

   function handleKeyDown(e: React.KeyboardEvent) {
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault() // prevents put prompt at begining
         e.stopPropagation()
      }
      if (e.altKey && ['PageDown', 'PageUp'].includes(e.key)) {
         const activeListIdx = listNames.findIndex(l => l === activeList)
         if (e.key === 'PageDown' && activeListIdx < listNames.length - 1) {
            setActiveList(listNames[activeListIdx + 1])
         } else if (e.key === 'PageUp' && activeListIdx > 0) {
            setActiveList(listNames[activeListIdx - 1])
         }
      }
   }
   // const goalActions: itemNavigationType = {
   //    add: false,
   //    editable: true,
   //    completable: false,
   //    sizeable: false,
   //    sortable: false,
   // }
   return (
      <div className='plannerBoard' onKeyDown={handleKeyDown}>
         <header className='boardHeading'>
            <span className='eyebrow'>YOUR WORKSPACE</span>
            <h1>{name}</h1>
            <p>Keep your next steps clear and your priorities in view.</p>
         </header>
         <div className='listContainer'>
            {Object.keys(listsConf).map(listName => (
               <List
                  key={listName}
                  name={listName}
                  sheetName={name}
                  listConfig={listsConf[listName]}
                  sheetHandlers={sheetHandlers}
                  taskMovement={taskMovement}
                  isActive={activeList === listName}
                  activateHandler={setActiveList}
               ></List>
            ))}
         </div>
      </div>
   )
}

export default Sheet
