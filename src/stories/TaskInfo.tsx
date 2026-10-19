import { Task } from './List'
import TaskCounter from './TaskCounter'
import '../styles/TaskInfo.css'

function ListInfo({ list }: { list: Task[] }) {
   return (
      <p className='taskListInfo'>
         <TaskCounter tasks={list} condition={t => !t.done}>
            pending
         </TaskCounter>
         --
         <TaskCounter tasks={list} condition={t => t.done}>
            done
         </TaskCounter>
      </p>
   )
}

export default ListInfo
