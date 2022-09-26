// import { useState } from 'react'
// import { DEBUGG_MODE } from './App'
// import clearCompleted from './clearCompletedTo'
import { useState } from 'react'
import List from './List'
import './Sheet.css'

function Sheet({ name }) {
   // const listNames = ['todos', 'backlog', 'someday', 'done', 'deleted']

   const listsConf = {
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
            completable: true,
            sizeable: true,
            sortable: true,
         },
      },
      deleted: { listMovements: { deleteAllTo: null } },
   }
   const listNames = Object.keys(listsConf)
   const [taskMovement, setTaskMovement] = useState({})
   const [activeList, setActiveList] = useState(listNames[0])

   const sheetHandlers = {
      taskMoved: () => setTaskMovement({}),
      add: (items, listName, position) =>
         setTaskMovement({ targetTaskList: listName, tasksToMove: items, position: position }),
      // focusedOnMe: taskListName => setTaskMovement(taskListName),
   }

   function handleKeyDown(e) {
      if (e.key === 'Alt') {
         e.preventDefault() // prevents put prompt at begining
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
      <div onKeyDown={e => handleKeyDown(e)}>
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
