import { useEffect, useMemo, useState } from 'react'
import NavigableList from './NavigableList'

const List = ({ sheetName, name }) => {
   const [list, setList] = useState([])
   const LS_LIST_KEY = useMemo(() => sheetName + '.' + name, [sheetName, name])

   useEffect(() => {
      let loadedList = JSON.parse(localStorage.getItem(LS_LIST_KEY))
      if (loadedList) {
         loadedList[loadedList.length - 1].focus = true
      } else {
         loadedList = [{ id: 1, focus: true, text: '', done: false, size: 1, relevance: 1 }]
      }
      setList(loadedList)
   }, [LS_LIST_KEY])

   useEffect(() => {
      if (list.length) localStorage.setItem(LS_LIST_KEY, JSON.stringify(list))
   }, [list, LS_LIST_KEY])

   //    const clearCompleted = (list) => {
   //       list.filter(t => t.done).forEach(t => sheetHandlers.add('done', t))
   //       const newlist = list.filter(t => !t.done)
   //       setList(newlist)
   //    }
   // const postpone = id => {
   //    sheetHandlers.add(
   //       'backlog',
   //       list.find(task => task.id === id)
   //    )
   //    remove(id)
   // }
   // const promote = id => {
   //    sheetHandlers.add(
   //       'todos',
   //       list.find(task => task.id === id)
   //    )
   //    remove(id)
   // }

   const handleInputKeyDown = e => {
      const id = list.find(i => i.focus).id
      // if (e.altKey) {
      //    if (e.key === 'ArrowRight') {
      //       postpone()
      //       e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
      //    }
      //    if (e.key === 'ArrowLeft') {
      //       promote()
      //       e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
      //    }
      // }
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
   }

   const navigableHandlers = {
      addTask: aboveId => {
         const maxTaskId = list.length ? Math.max(...list.map(t => t.id)) : 0
         let newTask = { id: maxTaskId + 1, focus: true }
         if (aboveId) {
            let listcp = [...list]
            const aboveTaskIdx = listcp.findIndex(t => t.id === aboveId)
            listcp.splice(aboveTaskIdx + 1, 0, newTask)
            setList(listcp)
         } else {
            setList(prevlist => [...prevlist, newTask])
         }
      },
      moveUp: id => move(id, -1),
      moveDown: id => move(id, 1),

      deleteItem: id => {
         // sheetHandlers.add(
         //    'deleted',
         //    list.find(task => task.id === id)
         // )
         remove(id)
      },
      focusOnFirst: () => focusOn(list[0].id),
      focusOnLast: () => focusOn(list[list.length - 1].id),

      focusUp: id => slideFocus(id, -1),
      focusDown: id => slideFocus(id, 1),
   }

   const move = (id, positions) => {
      const listcp = [...list]
      const currentIndex = listcp.findIndex(t => t.id === id)
      if (listcp[currentIndex + positions]) {
         const currentItem = listcp.find(t => t.id === id)
         listcp[currentIndex] = listcp[currentIndex + positions]
         listcp[currentIndex + positions] = currentItem
         setList(listcp)
      }
   }
   const isLastItem = id => list.findIndex(t => t.id === id) === list.length - 1
   const remove = id => {
      if (isLastItem(id)) {
         navigableHandlers.focusUp(id)
      } else {
         navigableHandlers.focusDown(id)
      }
      const listcp = [...list]
      const updatedlist = listcp.filter(i => i.id !== id)
      setList(updatedlist)
   }

   const slideFocus = (id, positions) => {
      const tdIdx = list.findIndex(td => td.id === id)
      if (
         (positions < 0 && tdIdx + positions >= 0) ||
         (positions > 0 && tdIdx + positions < list.length)
      )
         focusOn(list[tdIdx + positions].id)
   }

   const focusOn = id => {
      let listcp = [...list]
      listcp.find(i => i.focus).focus = false
      listcp.find(i => i.id === id).focus = true
      setList(listcp)
   }
   const handleOnItemClick = id => focusOn(id)

   return (
      <div onKeyDown={e => handleInputKeyDown(e)}>
         <NavigableList
            {...{
               list,
               name,
               navigableHandlers,
               handleInputKeyDown,
               handleOnItemClick,
               itemHandlers,
            }}
         ></NavigableList>
         {/* <button onClick={list => clearCompleted(list)}>Clear complete</button> */}
      </div>
   )
}

export default List
