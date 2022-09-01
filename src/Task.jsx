import React, { useEffect, useRef } from 'react'
import './App.css'

const Task = ({ task, listHandlers, debug }) => {
   const taskInputRef = useRef()

   useEffect(() => {
      if (taskInputRef && taskInputRef.current) taskInputRef.current.focus()
   }, [task.focus])

   const moveUp = () => listHandlers.moveUp(task.id)
   const moveDown = () => listHandlers.moveDown(task.id)
   const updateTask = () => listHandlers.updateTask(task)

   const increaseSize = () => {
      task.size++
      updateTask()
   }
   const decreaseSize = () => {
      if (task.size > 1) {
         task.size--
         updateTask()
      }
   }
   const setDone = () => {
      task.done = true
      updateTask()
   }
   const updateText = () => {
      task.text = taskInputRef.current.value
      updateTask()
   }

   const markAsDone = () => {
      setDone()
      listHandlers.focusDown(task.id)
   }
   const deleteTask = () => {
      listHandlers.delete(task.id)
   }

   const onClickTask = () => {
      listHandlers.focusOn(task.id)
   }

   const handleInputKeyDown = e => {
      //['ctrlKey', 'shiftKey', 'altKey', 'metaKey']
      const updateKeys = ['Enter', 'ArrowUp', 'ArrowDown']

      if (e.key === 'Enter') {
         if (e.altKey) {
            markAsDone()
         } else {
            task.focus = false
            listHandlers.addTask(task.id)
         }
      }
      if (e.key === 'ArrowUp') {
         if (e.ctrlKey) {
            increaseSize()
         } else if (e.altKey) {
            moveUp()
         } else {
            // e.stopPropagation()
            listHandlers.focusUp(task.id)
         }
         e.preventDefault() // prevents put prompt at begining
      }
      if (e.key === 'ArrowDown') {
         if (e.ctrlKey) {
            decreaseSize()
         } else if (e.altKey) {
            moveDown()
         } else {
            listHandlers.focusDown(task.id)
         }
      }
      if (
         (e.key === 'Backspace' || e.key === 'Delete') &&
         (e.altKey || !taskInputRef.current.value)
      ) {
         deleteTask()
         e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
      }
      if (e.ctrlKey) {
         if (e.key === 'End') {
            task.focus = false
            listHandlers.focusOnLast()
            e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
         }
         if (e.key === 'Home') {
            task.focus = false
            listHandlers.focusOnFirst()
            e.preventDefault() // prevents remove last char of the below task (when Backspace in empty task)
         }
      }
   }
   return (
      <li>
         <span>
            {debug && (
               <>
                  <span onClick={markAsDone}>
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
                     onChange={updateText}
                     defaultValue={task.text}
                     className={`taskInput labeledInput ${task.done && 'crossOut'}`}
                  />
               ) : (
                  <label className={`taskLabel ${task.done && 'crossOut'}`}>{task.text}</label>
               )}
            </div>
         </span>
         {debug && (
            <>
               <button onClick={deleteTask}>X</button>
               <button onClick={moveUp}>^</button>
               <button onClick={moveDown}>¬</button>
               <button onClick={() => listHandlers.handleMoveToBacklog(task.id)}>B</button>
            </>
         )}
      </li>
   )
}

export default Task
