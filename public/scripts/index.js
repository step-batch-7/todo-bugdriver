let todoData = [];
const xhrGet = function(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (xhr.status == 401) window.location.href = 'login.html';
    callback(this.responseText);
  };
  xhr.onerror = function(err) {
    console.log(err);
  };
  xhr.open('GET', url);
  xhr.send();
};

const postHttpReq = function(url, data, contentType, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', contentType);
  xhr.onload = function() {
    if (xhr.status == 401) window.location.href = 'login.html';
    callback();
  };
  xhr.onerror = function(err) {
    console.log(err);
  };
  xhr.send(data);
};

const putHttpReq = function(url, data, contentType, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', url, true);
  xhr.setRequestHeader('Content-Type', contentType);
  xhr.onload = function() {
    callback();
  };
  xhr.send(data);
};

const getElement = id => document.getElementById(id);

const hideTodoBox = function() {
  document.querySelector('.todo-task').classList.replace('show', 'hidden');
};

const showTodoBox = function() {
  document.querySelector('.todo-task').classList.replace('hidden', 'show');
};

const taskDragStart = function(taskId) {
  const todoId = document.querySelector('.todo-task').id;
  event.dataTransfer.setData('dragStartFrom', 'task');
  event.dataTransfer.setData('taskId', taskId);
  event.dataTransfer.setData('todoId', todoId);
};

const todoDragStart = function() {
  event.dataTransfer.setData('dragStartFrom', 'todo');
  event.dataTransfer.setData('todoId', event.target.id);
};

const todoDragOver = function() {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
};

const mergeTodo = function(event) {
  const firstTodoId = event.dataTransfer.getData('todoId');
  const secondTodoId = event.target.id;
  const wantToMerge = confirm('do you want to merge');
  if (wantToMerge) {
    const newTitle = prompt('Enter New Title for todo');
    const dataToMerge = { firstTodoId, secondTodoId, newTitle };
    putHttpReq(
      '/mergeTodo',
      JSON.stringify(dataToMerge),
      'application/json;charset=UTF-8',
      getToDos
    );
  }
};

const moveTaskToAnotherTodo = function(event) {
  const taskId = event.dataTransfer.getData('taskId');
  const todoId = event.dataTransfer.getData('todoId');
  const targetTodoId = event.target.id;
  const wantToMove = confirm('do you want to move Task');
  if (wantToMove) {
    const dataToMove = { taskId, todoId, targetTodoId };
    putHttpReq(
      '/moveTaskToAnotherTodo',
      JSON.stringify(dataToMove),
      'application/json;charset=UTF-8',
      getToDos
    );
  }
};

const todoDrop = function() {
  const dragFrom = event.dataTransfer.getData('dragStartFrom');
  if (dragFrom === 'todo') {
    mergeTodo(event);
  }
  if (dragFrom === 'task') {
    moveTaskToAnotherTodo(event);
  }
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
    liElement.draggable = true;
    liElement.ondragstart = todoDragStart;
    liElement.ondrop = todoDrop;
    liElement.ondragover = todoDragOver;
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
      </label><span class="task-name" draggable="true" 
      ondragstart="taskDragStart('${task.id}')"
      onblur="updateTask('${task.id}',this)">${task.name}</span>
      <div class="editTaskButton" onclick="editTask(this)">
       <img src="./images/edit.png" class="editTaskBtnTxt"/>
      </div>
      <div class="deleteTaskButton" onclick="deleteTask('${task.id}')">
        <span class="deleteTaskBtnTxt"> - </span>
      </div>
  </div>`;
};

const editTask = function(editElement) {
  const taskName = editElement.previousElementSibling;
  taskName.contentEditable = 'true';
  taskName.focus();
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

const updateTask = function(taskId, taskElement) {
  const todoId = document.querySelector('.todo-task').id;
  const newTaskName = taskElement.innerText;
  const taskData = { todoId: todoId, taskId: taskId, name: newTaskName };
  putHttpReq(
    '/updateTaskName',
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

const updateTodo = function() {
  const todoId = document.querySelector('.todo-task').id;
  const newTitle = getElement('todo-title').innerText;
  const todoData = { todoId, title: newTitle };
  putHttpReq(
    '/updateTodoTitle',
    JSON.stringify(todoData),
    'application/json;charset=UTF-8',
    getToDos
  );
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
  if (!taskName) {
    return;
  }
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
  if (!todoEntry.value) {
    return;
  }
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
  const createTaskBtn = getElement('createTask');
  const createTodoBtn = getElement('createTodo');
  const todoEntry = getElement('todoentry');
  const taskEntry = getElement('taskEntry');
  const todoTitle = getElement('todo-title');
  const todoSearchText = getElement('todoSearchText');
  todoSearchText.onkeyup = handleSearch;
  todoTitle.onblur = updateTodo;
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
