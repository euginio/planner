import Task from './Task'
import TaskInfo from './TaskInfo'
import './DummyList.css'
import { DEBUGG_MODE } from '../App'

const DummyList = ({ list, name, itemHandlers, ...params }) => {
   let liHour = 8.5
   return (
      <>
         <h3 style={{ display: 'inline' }}>{name}</h3>
         {DEBUGG_MODE && <TaskInfo tasks={list}></TaskInfo>}
         <ol>
            {list.map(t => {
               const renderr = (
                  <Task
                     key={t.id}
                     focus={t.focus}
                     {...t}
                     handlers={itemHandlers}
                     {...params}
                     liHour={liHour}
                  ></Task>
               )
               liHour += t.size * 0.5
               return renderr
            })}
         </ol>
      </>
   )
}

export default DummyList
