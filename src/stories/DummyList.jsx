import Task from './Task'
import TaskInfo from './TaskInfo'

const DummyList = ({ list, name, itemHandlers, ...params }) => {
   return (
      <>
         <TaskInfo tasks={list}></TaskInfo>
         <h3>{name}</h3>
         <ul>
            {list.map(t => (
               <Task
                  key={t.id}
                  editable={t.focus}
                  {...t}
                  handlers={itemHandlers}
                  {...params}
               ></Task>
            ))}
         </ul>
      </>
   )
}

export default DummyList
