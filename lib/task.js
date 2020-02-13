class Task {
  constructor(id, name, done, time) {
    this.id = id;
    this.name = name;
    this.done = done;
    this.time = time;
  }
  setName(name) {
    this.name = name;
    return name;
  }
  get isDone() {
    return this.done;
  }
  changeDoneStatus() {
    this.done = !this.done;
    return this.done;
  }
}

module.exports = Task;
