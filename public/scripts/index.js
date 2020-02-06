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

const hideTodoBox = function() {
  document.querySelector('.todo-task').classList.replace('show', 'hidden');
};

const showTodoBox = function() {
  document.querySelector('.todo-task').classList.replace('hidden', 'show');
};

const fillTodoList = function(todoData) {
  const todoListBox = document.querySelector('.todo-list-items');
  const selected = document.querySelector('.selected');
  const selectedTodoId = selected && selected.id;
  todoListBox.innerHTML = '';
  todoData.forEach(todo => {
    const liElement = document.createElement('li');
    liElement.classList.add('todo-list-item');
    liElement.id = todo.id;
    liElement.id == selectedTodoId && liElement.classList.add('selected');
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
    const selected = document.querySelector('.selected');
    firstTodo.click();
    selected && selected.click();
    showTodoBox();
  }
};

const createTaskHTML = function(task) {
  return `
  <div class="task">
    <input type="checkbox" class="checkTask"  
      id="${task.id}" ${task.done ? 'checked' : ''} 
      onclick="doneTask('${task.id}')"/>
      <label for="${task.id}"><span class="checkbox"></span>
      <span class="task-name">${task.name}</span></label>
      <div class="deleteButton" onclick="deleteTask('${task.id}')">
        <img src="./images/minus.png" alt="" class="deleteTaskImg" />
      </div>
  </div>`;
};

const doneTask = function(taskId) {
  const todoId = document.querySelector('.todo-task').id;
  const taskData = { todoId: todoId, taskId: taskId };
  postHttpReq(
    '/updateTaskDoneStatus',
    JSON.stringify(taskData),
    'application/json;charset=UTF-8',
    getToDos
  );
};

const deleteTask = function(taskId) {
  const todoId = document.querySelector('.todo-task').id;
  const taskData = { todoId: todoId, taskId: taskId };
  postHttpReq(
    '/deleteTask',
    JSON.stringify(taskData),
    'application/json;charset=UTF-8',
    getToDos
  );
};

const deleteTodo = function() {
  const todoId = document.querySelector('.todo-task').id;
  const todoData = { todoId };
  postHttpReq(
    '/deleteTodo',
    JSON.stringify(todoData),
    'application/json;charset=UTF-8',
    getToDos
  );
  hideTodoBox();
};

const tasksRemainingInTodo = function(todo) {
  const tasksRemaining = todo.tasks.filter(task => !task.done);
  return tasksRemaining.length;
};

const removeSelected = function() {
  const selectedElement = document.querySelector('.selected');
  selectedElement && selectedElement.classList.remove('selected');
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
    taskBox.innerHTML += createTaskHTML(task);
  });
  removeSelected();
  e.classList.add('selected');
};

const saveTask = function() {
  const taskEntry = document.getElementById('taskEntry');
  const taskName = taskEntry.value;
  if (!taskName) return;
  const todoId = document.querySelector('.todo-task').id;
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
