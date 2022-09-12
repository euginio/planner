import React, { useCallback, useEffect, useRef, useState } from 'react'
import './Task.css'

const Task = ({
   editable = true,
   text = '',
   done = false,
   size = 1,
   relevance = 1,
   saveHandler,
}) => {
   const [task, setTask] = useState({ editable, text, done, size, relevance })
   const taskInputRef = useRef()

   useEffect(() => {
      if (taskInputRef && taskInputRef.current) taskInputRef.current.focus()
   }, [editable])

   const taskChanged = useCallback(task => saveHandler(task), [saveHandler])

   useEffect(() => {
      taskChanged(task)
   }, [task, taskChanged])

   // const moveUp = () => listHandlers.moveUp(task.id)
   // const moveDown = () => listHandlers.moveDown(task.id)
   // const updateTask = () => listHandlers.updateTask(task)

   const increaseSize = () => {
      setTask({ ...task, size: task.size + 1 })
   }

   const decreaseSize = () => {
      if (task.size > 1) setTask({ ...task, size: task.size - 1 })
   }

   const updateText = () => {
      setTask({ ...task, text: taskInputRef.current.value.trim() })
   }

   const swipeDone = () => {
      setTask({ ...task, done: !task.done })
   }

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
         <div className={`taskHolder ${task.size > 1 && 'showSize'}`} size={task.size}>
            {editable ? (
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

export default Task