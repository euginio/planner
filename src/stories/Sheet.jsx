// import { useState } from 'react'
// import { DEBUGG_MODE } from './App'
// import clearCompleted from './clearCompletedTo'
import { useState } from 'react'
import List from './List'
import './Sheet.css'

function Sheet({ name }) {
   // const listNames = ['todos', 'backlog', 'someday', 'done', 'deleted']

   const [lists, setLists] = useState({
      todos: {
         focus: true,
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
         listMovements: { clearCompletedTo: 'done' },
         itemsNavigation: {
            completable: true,
            sizeable: true,
            sortable: true,
         },
      },
      deleted: { listMovements: { deleteAllTo: null } },
   })

   const [taskMovement, setTaskMovement] = useState({})

   const sheetHandlers = {
      taskMoved: () => setTaskMovement({}),
      add: (task, listName) =>
         setTaskMovement({ targetTaskList: listName, taskToMove: { ...task, focus: false } }),
      // focusedOnMe: taskListName => setTaskMovement(taskListName),
   }

   function handleKeyDown(e) {
      if (e.altKey && ['PageDown', 'PageUp'].includes(e.key)) {
         const activeListIdx = listNames.findIndex(l => l == activeList)
         if (e.key === 'PageDown' && activeListIdx < listNames.length - 1) {
            setActiveList(listNames[activeListIdx + 1])
         } else if (e.key === 'PageUp' && activeListIdx > 0) {
            setActiveList(listNames[activeListIdx - 1])
         }
      }
   }

   return (
      // <div onKeyDown={e => handleKeyDown(e)}>
      <div>
         <h2>Sheet {name}</h2>
         {Object.keys(lists).map(listName => (
            <List
               key={listName}
               name={listName}
               sheetName={name}
               // clearCompletedTo={clearCompletedTo}
               listConfig={lists[listName]}
               sheetHandlers={sheetHandlers}
               taskMovement={taskMovement}
            ></List>
         ))}
      </div>
   )
}

export default Sheet
