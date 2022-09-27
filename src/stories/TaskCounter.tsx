import { Task } from './List'

function TaskCounter({
   tasks,
   condition,
   children,
}: {
   tasks: Task[]
   condition: (t: Task) => boolean
   children: string
}) {
   return (
      <>
         {children +
            ' ' +
            tasks
               .filter(condition)
               .map(t => t.size)
               .reduce((prev, curr) => prev + curr, 0)}
      </>
   )
}

export default TaskCounter
