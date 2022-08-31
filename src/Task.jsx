import React, { useEffect, useRef } from 'react'
import './App.css'

const Task = ({ task, handlers, debug }) => {
   const taskInputRef = useRef()

   useEffect(() => {
      if (taskInputRef && taskInputRef.current) taskInputRef.current.focus()
   }, [task.focus])

   const moveUp = () => handlers.handleMoveUp(task.id)
   const moveDown = () => handlers.handleMoveDown(task.id)
   const updateTask = () => handlers.updateTask(task)

   const increaseSize = () => {
      task.size = task.size >= 0 ? task.size + 1 : 1
      task.focus = true // why I need to set focus = true here?
      updateTask()
   }
   const decreaseSize = () => {
      task.size = task.size > 0 ? task.size - 1 : 0
      task.focus = true // why I need to set focus = true here?
      updateTask()
   }
   const onChangeCheckbox = () => {
      handlers.markAsDone(task.id)
   }
   const deleteTask = () => {
      handlers.focusDown(task.id)
      handlers.handleDelete(task.id)
   }

   const onClickTask = () => {
      handlers.handleOnClick(task.id)
   }

   const handleInputKeyDown = e => {
      //['ctrlKey', 'shiftKey', 'altKey', 'metaKey']
      const updateKeys = ['Enter', 'ArrowUp', 'ArrowDown']
      if (updateKeys.includes(e.key)) handlers.updateText(task.id, taskInputRef.current.value)
      if (e.key === 'Enter') {
         if (e.altKey) {
            handlers.markAsDone(task.id)
            handlers.focusDown(task.id)
         } else {
            handlers.addTask(task.id)
         }
      }
      if (e.key === 'ArrowUp') {
         if (e.ctrlKey) {
            increaseSize()
         } else if (e.altKey) {
            moveUp()
         } else {
            e.preventDefault() // prevents put prompt at begining
            // e.stopPropagation()
            handlers.focusUp(task.id)
         }
      }
      if (e.key === 'ArrowDown') {
         if (e.ctrlKey) {
            decreaseSize()
         } else if (e.altKey) {
            moveDown()
         } else {
            handlers.focusDown(task.id)
         }
      }
      if (
         (e.key === 'Backspace' || e.key === 'Delete') &&
         (e.altKey || !taskInputRef.current.value)
      ) {
         deleteTask()
         e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
      }
   }

   return (
      <li>
         <span>
            {debug && (
               <>
                  <span onClick={onChangeCheckbox}>
                     <input type='checkbox' checked={task.done} readOnly />
                     <label>{task.id})</label>
                  </span>
               </>
            )}

            <div onClick={onClickTask} className='taskHolder' size={task.size}>
               {task.focus ? (
                  <input
                     ref={taskInputRef}
                     onKeyDown={handleInputKeyDown}
                     defaultValue={task.name}
                     className={`taskInput ${task.done ? 'crossOut' : ''}`}
                  />
               ) : (
                  <label className={`${task.done ? 'crossOut' : ''}`}>{task.name}</label>
               )}
            </div>
         </span>
         {debug && (
            <>
               <button onClick={deleteTask}>X</button>
               <button onClick={moveUp}>^</button>
               <button onClick={moveDown}>¬</button>
               <button onClick={() => handlers.handleMoveToBacklog(task.id)}>B</button>
            </>
         )}
      </li>
   )
}

export default Task
