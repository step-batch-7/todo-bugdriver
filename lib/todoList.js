const Todo = require('./todo');
class TodoList {
  constructor() {
    this.todoList = [];
    this.lastTodoId = 0;
    this.lastTaskId = 0;
  }

  addTodo(title) {
    this.lastTodoId += 1;
    const currentTime = new Date().getTime();
    const todoId = `todo_${this.lastTodoId}`;
    const todo = new Todo(todoId, title, currentTime);
    this.todoList.push(todo);
    return todoId;
  }

  addExistingTodo(todo) {
    return this.todoList.push(todo);
  }

  getTodo(todoId) {
    return this.todoList.find(todo => todo.id === todoId);
  }

  moveTask(taskId, todoId, targetTodoId) {
    const todo = this.getTodo(todoId);
    const task = todo.getTask(taskId);
    const targetTodo = this.getTodo(targetTodoId);
    targetTodo.addTask(task);
    return targetTodo.tasks.length;
  }

  deleteTodo(todoId) {
    const todo = this.getTodo(todoId);
    const todoIndex = this.todoList.indexOf(todo);
    this.todoList.splice(todoIndex, 1);
    return this.todoList.length;
  }

  addExpiryDateToTask(todoId, taskId, expiryDate) {
    const todo = this.getTodo(todoId);
    const task = todo.getTask(taskId);
    return task.setExpiry(expiryDate);
  }

  changeTaskStatus(todoId, taskId) {
    const todo = this.getTodo(todoId);
    const task = todo.getTask(taskId);
    return task.changeDoneStatus();
  }

  updateTodoTitle(todoId, title) {
    const todo = this.getTodo(todoId);
    return todo.setTitle(title);
  }

  updateTaskNameInTodo(todoId, taskId, name) {
    const todo = this.getTodo(todoId);
    const task = todo.getTask(taskId);
    return task.setName(name);
  }

  deleteTask(todoId, taskId) {
    const todo = this.getTodo(todoId);
    todo.deleteTask(taskId);
    return todo.tasks.length;
  }

  addTaskToTodo(todoId, taskname) {
    this.lastTaskId += 1;
    const todo = this.getTodo(todoId);
    const currentTime = new Date().getTime();
    const taskId = `task_${this.lastTaskId}`;
    todo.addNewTask(taskId, taskname, false, currentTime, '');
    return taskId;
  }

  mergeTodos(firstTodoId, secondTodoId, newTitle) {
    const newTodoId = this.addTodo(newTitle);
    const newCreateTodo = this.getTodo(newTodoId);
    const firstTodo = this.getTodo(firstTodoId);
    const secondTodo = this.getTodo(secondTodoId);
    return newCreateTodo.appendTaskFromTodos(firstTodo, secondTodo);
  }

  static load(todoJSON) {
    const todoList = new TodoList();
    todoJSON.forEach(todoDetail => {
      const id = todoDetail.id;
      const title = todoDetail.title;
      const time = todoDetail.time;
      const todo = new Todo(id, title, time);
      todoDetail.tasks.forEach(task => {
        todo.addNewTask(
          task.id,
          task.name,
          task.done,
          task.time,
          task.expiryDate
        );
        todoList.lastTaskId = +task.id.split('_').pop();
      });
      todoList.addExistingTodo(todo);
      todoList.lastTodoId = +id.split('_').pop();
    });
    return todoList;
  }
}

module.exports = TodoList;
