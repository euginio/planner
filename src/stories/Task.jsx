import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'
import './Task.css'

const Task = ({
   id,
   focus = true,
   text = '',
   done = false,
   size = 1,
   relevance = 1,
   handlers,
   allowedActions,
}) => {
   const taskInputRef = useRef()

   useEffect(() => {
      if (focus && allowedActions?.editable && taskInputRef?.current) taskInputRef.current.focus()
   }, [focus, allowedActions])

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
         if (e.altKey && allowedActions.completable) {
            swipeDone()
            e.stopPropagation()
         }
      }
      if (e.ctrlKey && allowedActions.sizeable) {
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
            onKeyDown={handleInputKeyDown}
         >
            {focus ? (
               <input
                  ref={taskInputRef}
                  readOnly={!allowedActions?.editable}
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
