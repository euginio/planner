// import { useState } from 'react'
// import { DEBUGG_MODE } from './App'
// import clearCompleted from './clearCompletedTo'
import { useState } from 'react'
import List from './List'
import './Sheet.css'

interface ListMovementType {
   clearCompletedTo?: string
   removeTo?: string | null
   postponeTo?: string
   promoteTo?: string
   deleteAllTo?: string | null
}

export interface itemNavigationType {
   add: boolean
   editable: boolean
   completable: boolean
   sizeable: boolean
   sortable: boolean
}

export interface ListConf {
   listMovements: ListMovementType
   itemsNavigation?: itemNavigationType
}
export interface TaskMovement {
   targetTaskList: string
   tasksToMove: any[]
   position: number
}
function Sheet({ name }:{name:string}) {

   // const listNames = ['todos', 'backlog', 'someday', 'done', 'deleted']

   const listsConf:{[key:string]:ListConf}= {
      todos: {
         listMovements: {
            clearCompletedTo: 'done',
            removeTo: 'deleted',
            postponeTo: 'backlog',
         },
         itemsNavigation: {
            add: true,
            editable: true,

            completable: true,
            sizeable: true,
            sortable: true,
         },
      },
      backlog: {
         listMovements: {
            clearCompletedTo: 'done',
            removeTo: 'deleted',
            postponeTo: 'someday',
            promoteTo: 'todos',
         },
         itemsNavigation: {
            add: true,
            editable: true,
            completable: true,
            sizeable: true,
            sortable: true,
         },
      },
      someday: {
         listMovements: {
            clearCompletedTo: 'done',
            promoteTo: 'backlog',
            removeTo: null,
         },
         itemsNavigation: {
            add: true,
            editable: true,
            completable: true,
            sizeable: true,
            sortable: true,
         },
      },
      done: {
         listMovements: {},
         itemsNavigation: {
            add:false,
            editable:false,
            completable: true,
            sizeable: true,
            sortable: true,
         },
      },
      deleted: { listMovements: { deleteAllTo: null }},
   }
   const listNames = Object.keys(listsConf)
   
   const [taskMovement, setTaskMovement] = useState<TaskMovement|any>()
   const [activeList, setActiveList] = useState(listNames[0])

   const sheetHandlers:{[key:string]:(...a:any)=>void} = {
      taskMoved: () => setTaskMovement({}),
      add: (items:string[], listName:string, position:number) =>
         setTaskMovement({ targetTaskList: listName, tasksToMove: items, position: position }),
      // focusedOnMe: taskListName => setTaskMovement(taskListName),
   }

   function handleKeyDown(e:React.KeyboardEvent) {
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

   return (
      <div onKeyDown={handleKeyDown}>
         <h2>Sheet {name}</h2>
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
   )
}

export default Sheet
