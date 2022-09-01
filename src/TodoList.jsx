import Task from './Task'

const TodoList = ({ name, todos, todosSetter, SheetHandlers, debug }) => {
   const listHandlers = {
      updateTask: task => {
         const todoscp = [...todos]
         let td = todoscp.find(td => td.id === task.id)
         td = task
         todosSetter(todoscp)
      },
      addTask: aboveId => {
         const maxTaskId = todos.length ? Math.max(...todos.map(t => t.id)) : 0
         const newTask = {
            text: '',
            done: false,
            focus: true,
            size: 1,
            id: maxTaskId + 1,
         }
         if (aboveId) {
            let todoscp = [...todos]
            const aboveTaskIdx = todoscp.findIndex(t => t.id == aboveId)
            newTask.focus = true
            todoscp.splice(aboveTaskIdx + 1, 0, newTask)
            todosSetter(todoscp)
         } else {
            todosSetter(prevTodos => [...prevTodos, newTask])
         }
      },
      isLastTask: id => todos.findIndex(t => t.id == id) == todos.length - 1,
      delete: id => {
         if (listHandlers.isLastTask(id)) {
            listHandlers.focusUp(id)
         } else {
            listHandlers.focusDown(id)
         }
         const todoscp = [...todos]
         SheetHandlers.addToDeleted(todos.find(task => task.id == id))
         const updatedTodos = todoscp.filter(task => task.id !== id)
         todosSetter(updatedTodos)
      },
      moveUp: id => {
         const todoscp = [...todos]
         const currentIndex = todoscp.findIndex(t => t.id == id)
         const currentTask = todoscp.find(t => t.id == id)
         currentTask.focus = true
         todoscp[currentIndex] = todoscp[currentIndex - 1]
         todoscp[currentIndex - 1] = currentTask
         todosSetter(todoscp)
      },
      moveDown: id => {
         const todoscp = [...todos]
         const currentIndex = todoscp.findIndex(t => t.id == id)
         const currentTask = todoscp.find(t => t.id == id)
         currentTask.focus = true
         todoscp[currentIndex] = todoscp[currentIndex + 1]
         todoscp[currentIndex + 1] = currentTask
         todosSetter(todoscp)
      },
      focusOn: id => {
         const todoscp = [...todos]
         const focusedTD = todoscp.find(t => t.focus == true)
         if (focusedTD) focusedTD.focus = false
         todoscp.find(td => td.id === id).focus = true
         todosSetter(todoscp)
      },
      focusUp: id => {
         const todoscp = [...todos]
         const tdIdx = todoscp.findIndex(td => td.id === id)
         if (tdIdx > 0) {
            todoscp[tdIdx].focus = false
            todoscp[tdIdx - 1].focus = true
         }
         todosSetter(todoscp)
      },
      focusDown: id => {
         const todoscp = [...todos]
         const tdIdx = todoscp.findIndex(td => td.id === id)
         if (tdIdx < todos.length - 1) {
            todoscp[tdIdx].focus = false
            todoscp[tdIdx + 1].focus = true
         }
         todosSetter(todoscp)
      },
      focusOnFirst: () =>
         todosSetter(prevTodos => {
            let todoscp = [...prevTodos]
            todoscp[0].focus = true
            return todoscp
         }),
      focusOnLast: () =>
         todosSetter(prevTodos => {
            let todoscp = [...prevTodos]
            todoscp[todoscp.length - 1].focus = true
            return todoscp
         }),
   }

   return (
      <>
         <h3>TODO {name}</h3>
         <ul>
            {todos.map(todo => (
               <Task key={todo.id} task={todo} listHandlers={listHandlers} debug={debug}></Task>
            ))}
         </ul>
      </>
   )
}

export default TodoList
