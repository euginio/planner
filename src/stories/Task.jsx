import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'
import './Task.css'

const Task = ({
   id,
   editable = true,
   text = '',
   done = false,
   size = 1,
   relevance = 1,
   handlers,
   itemActions,
}) => {
   const taskInputRef = useRef()

   useEffect(() => {
      if (taskInputRef && taskInputRef.current) taskInputRef.current.focus()
   }, [editable])

   const increaseSize = () => handlers.setSize(id, size + 1)
   const decreaseSize = () => {
      if (size > 1) handlers.setSize(id, size - 1)
   }
   const updateText = () => {
      if (taskInputRef.current.value) handlers.setText(id, taskInputRef.current.value)
   }
   const swipeDone = () => handlers.setDone(id, !done)

   const handleInputKeyDown = e => {
      //['ctrlKey', 'shiftKey', 'altKey', 'metaKey']

      if (e.key === 'Enter') {
         if (e.altKey && itemActions.completable) {
            swipeDone()
            e.stopPropagation()
         }
      }
      if (e.ctrlKey && itemActions.sizeable) {
         if (e.key === 'ArrowUp') {
            increaseSize()
            e.preventDefault()
            e.stopPropagation()
         }
         if (e.key === 'ArrowDown') {
            decreaseSize()
            e.preventDefault()
            e.stopPropagation()
         }
      }
   }

   return (
      <>
         <li
            className={classNames('taskHolder', { showSize: size > 1 })}
            size={size}
            onClick={() => handlers.handleOnItemClick(id)}
         >
            {editable ? (
               <input
                  ref={taskInputRef}
                  onKeyDown={handleInputKeyDown}
                  onChange={updateText}
                  value={text}
                  className={classNames('taskInput', 'labeledInput', { crossOut: done })}
               />
            ) : (
               <label className={classNames('taskLabel', { crossOut: done })}>{text || '_'}</label>
            )}
         </li>
      </>
   )
}

export default Task
