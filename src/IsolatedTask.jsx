import React, { useEffect, useRef, useState } from 'react'
import './App.css'

const IsolatedTask = ({
   focus,
   initialData = { text: '', done: false, size: 1, relevance: 1 },
}) => {
   const [task, setTask] = useState(initialData)
   const taskInputRef = useRef()

   useEffect(() => {
      if (taskInputRef && taskInputRef.current) taskInputRef.current.focus()
   }, [focus])

   // const moveUp = () => listHandlers.moveUp(task.id)
   // const moveDown = () => listHandlers.moveDown(task.id)
   // const updateTask = () => listHandlers.updateTask(task)

   const increaseSize = () => {
      setTask({ ...task, size: task.size + 1 })
   }

   const decreaseSize = () => {
      if (task.size > 1) {
         setTask({ ...task, size: task.size - 1 })
      }
   }

   const updateText = () => {
      setTask({ ...task, text: taskInputRef.current.value.trim() })
   }

   const swipeDone = () => {
      setTask({ ...task, done: !task.done })
   }

   // const onClickTask = () => {
   //    listHandlers.focusOn(task.id)
   // }

   // function postpone() {
   //    listHandlers.postpone(task.id)
   // }
   // function promote() {
   //    listHandlers.promote(task.id)
   // }

   const handleInputKeyDown = e => {
      //['ctrlKey', 'shiftKey', 'altKey', 'metaKey']

      if (e.key === 'Enter') {
         if (e.altKey) {
            swipeDone()
         }
      }
      if (e.key === 'ArrowUp') {
         if (e.ctrlKey) {
            increaseSize()
            e.preventDefault()
         }
      }
      if (e.key === 'ArrowDown') {
         if (e.ctrlKey) {
            decreaseSize()
            e.preventDefault()
         }
      }
   }
   return (
      <>
         <div className='taskHolder' size={task.size}>
            {focus ? (
               <input
                  ref={taskInputRef}
                  onKeyDown={handleInputKeyDown}
                  onChange={updateText}
                  className={`taskInput labeledInput ${task.done && 'crossOut'}`}
               />
            ) : (
               <label className={`taskLabel ${task.done && 'crossOut'}`}>{task.text || '_'}</label>
            )}
         </div>
      </>
   )
}

export default IsolatedTask
