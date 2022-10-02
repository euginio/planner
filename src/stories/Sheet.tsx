// import { useState } from 'react'
// import { DEBUGG_MODE } from './App'
// import clearCompleted from './clearCompletedTo'
import { useState } from 'react'
import List, { Task } from './List'
import './Sheet.css'
import TaskComp from './TaskComp'

interface ListActionsType {
   visible?: boolean
   resetCompleted?: boolean
   removeTo?: string | null
   postponeTo?: string
   promoteTo?: string
   removeAllTo?: string | null
   copyAllTo?: string
   clearCompletedTo?: string
}

export interface itemNavigationType {
   add: boolean
   editable: boolean
   completable: boolean
   sizeable: boolean
   sortable: boolean
}

export interface ListConf {
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

   const listsConf: { [key: string]: ListConf } = {
      todos: {
         listActions: {
            clearCompletedTo: 'done',
            removeTo: 'deleted',
            postponeTo: 'backlog',
            visible: true,
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
         listActions: {
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
         listActions: { clearCompletedTo: 'done', promoteTo: 'backlog', removeTo: null },
         itemsNavigation: {
            add: true,
            editable: true,
            completable: true,
            sizeable: true,
            sortable: true,
         },
      },
      fixed: {
         listActions: { removeTo: null, copyAllTo: 'todos' },
         itemsNavigation: {
            add: true,
            editable: true,
            completable: true,
            sizeable: true,
            sortable: true,
         },
      },
      microHabits: {
         listActions: { removeTo: null, resetCompleted: true, visible: true },
         itemsNavigation: {
            add: true,
            editable: true,
            completable: true,
            sizeable: false,
            sortable: true,
         },
      },
      done: {
         listActions: {},
         itemsNavigation: {
            add: false,
            editable: false,
            completable: true,
            sizeable: true,
            sortable: true,
         },
      },
      deleted: {
         listActions: { removeAllTo: null },
         itemsNavigation: {
            add: false,
            editable: false,
            completable: false,
            sizeable: false,
            sortable: false,
         },
      },
   }
   const listNames = Object.keys(listsConf)

   const [taskMovement, setTaskMovement] = useState<TaskMovement | any>()
   const [activeList, setActiveList] = useState(listNames[0])
   // const [goal, SetGoal] = useState<string>()

   const sheetHandlers: { [key: string]: (...a: any) => void } = {
      taskMoved: () => setTaskMovement({}),
      add: (items: Task[], listName: string, position: number = 0) =>
         setTaskMovement({ targetTaskList: listName, tasksToMove: items, position: position }),
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
   const goalActions: itemNavigationType = {
      add: false,
      editable: true,
      completable: false,
      sizeable: false,
      sortable: false,
   }
   return (
      <div onKeyDown={handleKeyDown}>
         <h2>Sheet {name}</h2>
         <h3>
            {/* <TaskComp
               id={0}
               focus={true}
               handlers={{}}
               text={goal || ''}
               allowedActions={goalActions}
               done={false}
               size={1}
               impact={1}
               liHour={19}
            ></TaskComp> */}
         </h3>
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
