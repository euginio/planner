import Task from './Task'
import TaskInfo from './TaskInfo'

const DummyList = ({ list, name, handleInputKeyDown, handleOnItemClick, itemHandlers }) => {
   return (
      <>
         <TaskInfo tasks={list}></TaskInfo>
         <h3>{name}</h3>
         <ul>
            {list.map(t => (
               <li
                  onKeyDown={e => handleInputKeyDown(e, t.id)}
                  key={t.id}
                  onClick={() => handleOnItemClick(t.id)}
               >
                  <Task editable={t.focus} {...t} handlers={itemHandlers}></Task>
               </li>
            ))}
         </ul>
      </>
   )
}

export default DummyList
