const Task = require('./task');
class Todo {
  constructor(id, title, time) {
    this.id = id;
    this.title = title;
    this.time = time;
    this.tasks = [];
  }

  setTitle(title) {
    this.title = title;
    return this.title;
  }

  addTask(task) {
    this.tasks.push(task);
    return this.tasks.length;
  }

  appendTaskFromTodo(todo) {
    todo.tasks.forEach(task => this.addTask(task));
    return this.tasks.length;
  }

  appendTaskFromTodos(...todos) {
    todos.forEach(todo => this.appendTaskFromTodo(todo));
    return this.tasks.length;
  }

  addNewTask(id, name, done, time) {
    const task = new Task(id, name, done, time);
    this.tasks.push(task);
    return this.tasks.length;
  }

  getTask(taskId) {
    return this.tasks.find(task => task.id === taskId);
  }

  deleteTask(taskId) {
    const task = this.getTask(taskId);
    const indexOftask = this.tasks.indexOf(task);
    return this.tasks.splice(indexOftask, 1);
  }
}

module.exports = Todo;
