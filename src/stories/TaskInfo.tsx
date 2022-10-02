import { Task } from './List'
import TaskCounter from './TaskCounter'

function ListInfo({ list }: { list: Task[] }) {
   return (
      <p style={{ display: 'inline' }}>
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
