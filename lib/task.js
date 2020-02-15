class Task {
  constructor(id, name, done, time, expiryDate) {
    this.id = id;
    this.name = name;
    this.done = done;
    this.time = time;
    this.expiryDate = expiryDate;
  }
  setName(name) {
    this.name = name;
    return name;
  }
  setExpiry(date) {
    this.expiryDate = date;
    return this.expiryDate;
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
