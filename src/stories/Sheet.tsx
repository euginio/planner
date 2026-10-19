import { useState } from 'react'
import List from './List'
import './Sheet.css'
import presetcon from './presetListConf.json'
import type { SheetHandlers, TaskListMovement } from './handlers'

interface ListActionsType {
   resetCompleted?: boolean
   removeTo?: string | null
   postponeTo?: string
   promoteTo?: string
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
const listsConf = presetcon as Record<string, ListConf>
const listNames = Object.keys(listsConf)

function Sheet({
   name,
   onStorageError,
}: {
   name: string
   onStorageError: (key: string, message?: string) => void
}) {
   const [taskMovement, setTaskMovement] = useState<TaskListMovement | undefined>()
   const [activeList, setActiveList] = useState(listNames[0])

   const sheetHandlers: SheetHandlers = {
      taskMoved: () => setTaskMovement(undefined),
      add: (items, targetTaskList, position = 0) =>
         setTaskMovement({ targetTaskList, tasksToMove: items, position }),
   }

   function handleKeyDown(e: React.KeyboardEvent) {
      if (['Alt', 'Control'].includes(e.key)) {
         e.preventDefault()
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
                  onStorageError={onStorageError}
               ></List>
            ))}
         </div>
      </div>
   )
}

export default Sheet
