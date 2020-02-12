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
  }
  addTask(id, name, done, time) {
    const task = new Task(id, name, done, time);
    this.tasks.push(task);
  }
  getTask(taskId) {
    return this.tasks.find(task => task.id === taskId);
  }
  deleteTask(taskId) {
    const task = this.getTask(taskId);
    const indexOftask = this.tasks.indexOf(task);
    this.tasks.splice(indexOftask, 1);
  }
}

module.exports = Todo;
