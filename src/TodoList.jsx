import Task from './Task'

const TodoList = ({ todos, taskHandlers, debug }) => {
   return (
      <ul>
         {todos.map(todo => (
            <Task key={todo.id} task={todo} handlers={taskHandlers} debug={debug}></Task>
         ))}
      </ul>
   )
}

export default TodoList
