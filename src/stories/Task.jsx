import classNames from 'classnames'
import React, { useEffect, useRef } from 'react'
import { DEBUGG_MODE } from '../App'
import './Task.css'

const Task = ({
   id,
   focus = false,
   text = '',
   done = false,
   size = 1,
   impact = 1,
   handlers,
   allowedActions,
   liHour,
}) => {
   const taskInputRef = useRef()

   useEffect(() => {
      if (focus && taskInputRef?.current) taskInputRef.current.focus()
   }, [focus, allowedActions])

   const increaseSize = () => handlers.setSize(id, size + 1)
   const decreaseSize = () => {
      if (size > 1) handlers.setSize(id, size - 1)
   }
   const updateText = () => {
      handlers.setText(id, taskInputRef.current.value ? taskInputRef.current.value : '')
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
            className={classNames('taskHolder', {
               showSize: size > 1,
               halfHour: !Number.isInteger(liHour),
            })}
            size={size}
            style={{ height: 20 * size + 'px' }}
            onClick={() => handlers.handleOnItemClick(id)}
            onKeyDown={handleInputKeyDown}
            value={liHour.toString()}
         >
            {focus ? (
               <input
                  ref={taskInputRef}
                  readOnly={!allowedActions?.editable}
                  onChange={updateText}
                  value={text}
                  className={classNames('taskInput', {
                     crossOut: done,
                     labeledInput: !DEBUGG_MODE,
                  })}
               />
            ) : (
               <label className={classNames('taskLabel', { crossOut: done })}>{text || '_'}</label>
            )}
         </li>
      </>
   )
}

export default Task
