class TodoList {
  constructor() {
    this.todoList = [];
    this.lastTodoId = 0;
    this.lastTaskId = 0;
  }
  addTodo(title) {
    this.lastTodoId += 1;
    const currentTime = new Date().getTime();
    const todoId = `todo${this.lastTodoId}`;
    const todo = new Todo(todoId, title, currentTime);
    this.todoList.push(todo);
    return todoId;
  }
  addExistingTodo(todo) {
    this.todoList.push(todo);
  }
  getTodo(todoId) {
    return this.todoList.find(todo => todo.id == todoId);
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
    const taskId = `task${this.lastTaskId}`;
    todo.addTask(taskId, taskname, false, currentTime);
    return taskId;
  }
  static load(todoJSON) {
    const todoList = new TodoList();
    todoJSON.forEach(todoDetail => {
      const id = todoDetail.id;
      const title = todoDetail.title;
      const time = todoDetail.time;
      const todo = new Todo(id, title, time);
      todoDetail.tasks.forEach(task => {
        todo.addTask(task.id, task.name, task.done, task.time);
        todoList.lastTaskId += 1;
      });
      todoList.addExistingTodo(todo);
      todoList.lastTodoId += 1;
    });
    return todoList;
  }
}
class Todo {
  constructor(id, title, time) {
    this.id = id;
    this.title = title;
    this.time = time;
    this.tasks = [];
  }
  setTitle(title) {
    this.title = title;
  }
  addTask(id, name, done, time) {
    const task = new Task(id, name, done, time);
    this.tasks.push(task);
  }
  getTask(taskId) {
    return this.tasks.find(task => task.id == taskId);
  }
  deleteTask(taskId) {
    const task = this.getTask(taskId);
    const indexOftask = this.tasks.indexOf(task);
    this.tasks.splice(indexOftask, 1);
  }
}

class Task {
  constructor(id, name, done, time) {
    this.id = id;
    this.name = name;
    this.done = done;
    this.time = time;
  }
  setName(name) {
    this.name = name;
  }
  get isDone() {
    return this.done;
  }
  changeDoneStatus() {
    this.done = !this.done;
  }
}

module.exports = TodoList;
