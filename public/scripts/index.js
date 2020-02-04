let todoData = [];
const xhrGet = function(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function() {
    callback(this.responseText);
  };
  xhr.open('GET', url);
  xhr.send();
};

const postHttpReq = function(url, data, contentType, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', contentType);
  xhr.onload = function() {
    callback();
  };
  xhr.send(data);
};

const fillTodoList = function(todoData) {
  const todoListBox = document.querySelector('.todo-list-items');
  todoListBox.innerHTML = '';
  todoData.forEach(todo => {
    const liElement = document.createElement('li');
    liElement.classList.add('todo-list-item');
    liElement.id = todo.id;
    liElement.onclick = () => showTodo(liElement);
    const liTitle = document.createTextNode(todo.title);
    liElement.appendChild(liTitle);
    todoListBox.appendChild(liElement);
  });
};

const getToDos = function() {
  xhrGet('/getTodo', todoDataJSON => {
    todoData = JSON.parse(todoDataJSON);
    fillTodoList(todoData);
    openFirstTodo();
  });
};

const openFirstTodo = function() {
  const firstTodo = document.querySelector('.todo-list-item');
  if (firstTodo) {
    firstTodo.click();
    document.querySelector('.todo-task').classList.replace('hidden', 'show');
  }
};

const tasksRemainingInTodo = function(todo) {
  const tasksRemaining = todo.tasks.filter(task => !task.done);
  return tasksRemaining.length;
};

const showTodo = function(e) {
  const todo = todoData.find(todoElement => todoElement.id == e.id);
  document.querySelector('.todo-task').id = e.id;
  document.getElementById('todo-title').innerText = todo.title;
  const remainingTaskCount = tasksRemainingInTodo(todo);
  document.getElementById('taskcount').innerText = remainingTaskCount;
  const taskBox = document.querySelector('.todo-body');
  taskBox.innerHTML = '';
  todo.tasks.forEach(task => {
    taskBox.innerHTML += `<div class="task">
    <input type="checkbox" class="checkTask"  id="${task.id}" ${
      task.done ? 'checked' : ''
    }/>
            <label for="${task.id}"
              ><span class="checkbox"></span
              ><span class="task-name">${task.name}</span></label
            >
          </div>`;
  });
};

const saveTask = function() {
  const taskEntry = document.getElementById('taskEntry');
  const todoId = document.querySelector('.todo-task').id;
  const taskName = taskEntry.value;
  if (!taskName) return;
  const taskData = { todoId: todoId, taskName: taskName };
  postHttpReq(
    '/saveTask',
    JSON.stringify(taskData),
    'application/json;charset=UTF-8',
    getToDos
  );
  taskEntry.value = '';
};
const saveTodo = function() {
  const todoEntry = document.getElementById('todoentry');
  if (!todoEntry.value) return;
  const todoData = { title: todoEntry.value };
  postHttpReq(
    '/saveTodo',
    JSON.stringify(todoData),
    'application/json;charset=UTF-8',
    getToDos
  );
  todoEntry.value = '';
};

const attachListeners = function() {
  const createTaskBtn = document.getElementById('createTask');
  const createTodoBtn = document.getElementById('createTodo');
  const todoEntry = document.getElementById('todoentry');
  const taskEntry = document.getElementById('taskEntry');
  createTodoBtn.onclick = saveTodo;
  todoEntry.onkeyup = function(event) {
    if (event.keyCode == 13) {
      saveTodo();
    }
  };
  createTaskBtn.onclick = saveTask;
  taskEntry.onkeyup = function(event) {
    if (event.keyCode == 13) {
      saveTask();
    }
  };
};

const main = function() {
  getToDos();
  attachListeners();
};
window.onload = main;
