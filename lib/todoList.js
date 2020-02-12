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
    this.todoList.push(todo);
  }

  getTodo(todoId) {
    return this.todoList.find(todo => todo.id === todoId);
  }

  moveTask(taskId, todoId, targetTodoId) {
    const todo = this.getTodo(todoId);
    const task = todo.getTask(taskId);
    const targetTodo = this.getTodo(targetTodoId);
    targetTodo.addTask(task);
  }

  deleteTodo(todoId) {
    const todo = this.getTodo(todoId);
    const todoIndex = this.todoList.indexOf(todo);
    this.todoList.splice(todoIndex, 1);
  }

  changeTaskStatus(todoId, taskId) {
    const todo = this.getTodo(todoId);
    const task = todo.getTask(taskId);
    task.changeDoneStatus();
  }

  updateTodoTitle(todoId, title) {
    const todo = this.getTodo(todoId);
    todo.setTitle(title);
  }

  updateTaskNameInTodo(todoId, taskId, name) {
    const todo = this.getTodo(todoId);
    const task = todo.getTask(taskId);
    task.setName(name);
  }

  deleteTask(todoId, taskId) {
    const todo = this.getTodo(todoId);
    todo.deleteTask(taskId);
  }

  addTaskToTodo(todoId, taskname) {
    this.lastTaskId += 1;
    const todo = this.getTodo(todoId);
    const currentTime = new Date().getTime();
    const taskId = `task_${this.lastTaskId}`;
    todo.addNewTask(taskId, taskname, false, currentTime);
    return taskId;
  }

  mergeTodos(firstTodoId, secondTodoId, newTitle) {
    const newTodoId = this.addTodo(newTitle);
    const newCreateTodo = this.getTodo(newTodoId);
    const firstTodo = this.getTodo(firstTodoId);
    const secondTodo = this.getTodo(secondTodoId);
    newCreateTodo.appendTaskFromTodos(firstTodo, secondTodo);
  }

  static load(todoJSON) {
    const todoList = new TodoList();
    todoJSON.forEach(todoDetail => {
      const id = todoDetail.id;
      const title = todoDetail.title;
      const time = todoDetail.time;
      const todo = new Todo(id, title, time);
      todoDetail.tasks.forEach(task => {
        todo.addNewTask(task.id, task.name, task.done, task.time);
        todoList.lastTaskId = +task.id.split('_').pop();
      });
      todoList.addExistingTodo(todo);
      todoList.lastTodoId = +id.split('_').pop();
    });
    return todoList;
  }
}

module.exports = TodoList;
