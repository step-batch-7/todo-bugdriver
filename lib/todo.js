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
  }
  addExistingTodo(todo) {
    this.todoList.push(todo);
  }
  getTodo(todoId) {
    return this.todoList.find(todo => todo.id == todoId);
  }
  changeTaskStatus(todoId, taskId) {
    const todo = this.getTodo(todoId);
    const task = todo.getTask(taskId);
    task.changeDoneStatus();
  }
  addTaskToTodo(todoId, taskname) {
    this.lastTaskId += 1;
    const todo = this.getTodo(todoId);
    const currentTime = new Date().getTime();
    const taskId = `task${this.lastTaskId}`;
    todo.addTask(taskId, taskname, false, currentTime);
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
  addTask(id, name, done, time) {
    const task = new Task(id, name, done, time);
    this.tasks.push(task);
  }
  getTask(taskId) {
    return this.tasks.find(task => task.id == taskId);
  }
}

class Task {
  constructor(id, name, done, time) {
    this.id = id;
    this.name = name;
    this.done = done;
    this.time = time;
  }
  get isDone() {
    return this.done;
  }
  changeDoneStatus() {
    this.done = !this.done;
  }
}

module.exports = TodoList;
