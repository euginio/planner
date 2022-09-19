import Task from './Task'
import TaskInfo from './TaskInfo'
import './DummyList.css'

const DummyList = ({ list, name, itemHandlers, ...params }) => {
   let liHour = 10
   return (
      <>
         <h3 style={{ display: 'inline' }}>{name}</h3>
         <TaskInfo tasks={list}></TaskInfo>
         <ol>
            {list.map(t => {
               const renderr = (
                  <Task
                     key={t.id}
                     editable={t.focus}
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
