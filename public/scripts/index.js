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

const performLogout = function() {
  document.cookie = '_SID=; expires=Thu, 18 Dec 2019 12:00:00 UTC';
  location.assign('login.html');
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
  localStorage.setItem('taskId', taskId);
  localStorage.setItem('todoId', todoId);
};

const todoDragStart = function() {
  event.dataTransfer.setData('dragStartFrom', 'todo');
  localStorage.setItem('firstTodoId', event.target.id);
};

const todoDragOver = function() {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
};

const openMergeTodoBox = function(event) {
  localStorage.setItem('secondTodoId', event.target.id);
  const mergeTodoBox = document.querySelector('.merge-todo-box');
  mergeTodoBox.classList.remove('hidden');
  const outerBox = document.querySelector('.container');
  outerBox.classList.add('blur');
};

const openHelpBox = function(event) {
  const helpBox = document.querySelector('.help-box');
  helpBox.classList.remove('hidden');
  const outerBox = document.querySelector('.container');
  outerBox.classList.add('blur');
};

const moveTaskToAnotherTodo = function(event) {
  localStorage.setItem('targetId', event.target.id);
  const confirmBox = document.querySelector('.confirm-box');
  const outerBox = document.querySelector('.container');
  confirmBox.classList.remove('hidden');
  outerBox.classList.add('blur');
};

const todoDrop = function() {
  const dragFrom = event.dataTransfer.getData('dragStartFrom');
  if (dragFrom === 'todo') {
    openMergeTodoBox(event);
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

const markExpiredTasks = function(todoData) {
  return todoData.map(todo => {
    todo.tasks.map(task => {
      if (!task.expiryDate) return task;
      const currentDate = new Date().getTime() - 86400000;
      const expiryDateOfTask = new Date(task.expiryDate).getTime();
      task.expiryDate =
        currentDate > expiryDateOfTask
          ? `<span class="expiredTask">${new Date(
              task.expiryDate
            ).toDateString()}</span>`
          : new Date(task.expiryDate).toDateString();

      return task;
    });
    return todo;
  });
};

const showUserName = function(userName) {
  getElement('username').innerText = userName;
};

const getToDos = function() {
  xhrGet('/getTodo', todoDataJSON => {
    const { username, todoList } = JSON.parse(todoDataJSON);
    todoData = markExpiredTasks(todoList);
    fillTodoList(todoData);
    showUserName(username);
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
      onkeyup="moveOnEnter()"
      onblur="updateTask('${task.id}',this)">${task.name}</span>
      <div> <span class="expiryDate" >${task.expiryDate}</span> </div>
      <div class="dueTaskButton">
        <input type="checkbox" id="reminder${task.id}" class="checkReminder"/>
        <label for="reminder${task.id}">
          <div class="dueTaskBtnTxt"></div>
          <input type="date" id="reminderDate" 
          onblur="dueTask(this,'${task.id}')" 
          name="reminderDate" class="reminderDate" min="${
            new Date().toISOString().split('T')[0]
          }">
        </label>
      </div>
      <div class="editTaskButton" onclick="editTask(this)">
       <img src="./images/edit.png" class="editTaskBtnTxt"/>
      </div>
      <div class="deleteTaskButton" onclick="deleteTask('${task.id}')">
        <span class="deleteTaskBtnTxt"> - </span>
      </div>
  </div>`;
};

const moveOnEnter = function() {
  if (event.keyCode == 13) getElement('taskEntry').focus();
};

const dueTask = function(dueDateEntry, taskId) {
  const expiryDate = dueDateEntry.value;
  if (expiryDate.length !== 0) {
    const todoId = document.querySelector('.todo-task').id;
    const taskData = { todoId, taskId, expiryDate };
    putHttpReq(
      '/setExpiryDate',
      JSON.stringify(taskData),
      'application/json;charset=UTF-8',
      getToDos
    );
  }
};

const editTask = function(editElement) {
  const taskName = editElement.offsetParent.querySelector('.task-name');
  taskName.contentEditable = 'true';
  taskName.focus();
};

const doneTask = function(taskId) {
  const todoId = document.querySelector('.todo-task').id;
  const taskData = { todoId, taskId };
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
  console.log(todo);
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
  taskBox.scrollTop = taskBox.scrollHeight;
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

const closeConfirmBox = function() {
  const confirmBox = document.querySelector('.confirm-box');
  const outerBox = document.querySelector('.container');
  confirmBox.classList.add('hidden');
  outerBox.classList.remove('blur');
};

const moveTask = function() {
  const taskId = localStorage.getItem('taskId');
  const todoId = localStorage.getItem('todoId');
  const targetTodoId = localStorage.getItem('targetId');
  const dataToMove = { taskId, todoId, targetTodoId };
  putHttpReq(
    '/moveTaskToAnotherTodo',
    JSON.stringify(dataToMove),
    'application/json;charset=UTF-8',
    getToDos
  );
  closeConfirmBox();
};

const closeMergeBox = function() {
  const mergeTodoBox = document.querySelector('.merge-todo-box');
  const outerBox = document.querySelector('.container');
  mergeTodoBox.classList.add('hidden');
  outerBox.classList.remove('blur');
  getElement('new-title').value = '';
};

const closeHelpBox = function() {
  const helpBox = document.querySelector('.help-box');
  const outerBox = document.querySelector('.container');
  helpBox.classList.add('hidden');
  outerBox.classList.remove('blur');
};

const mergeTodo = function() {
  const firstTodoId = localStorage.getItem('firstTodoId');
  const secondTodoId = localStorage.getItem('secondTodoId');
  const newTitle = getElement('new-title').value;
  const dataToMerge = { firstTodoId, secondTodoId, newTitle };
  putHttpReq(
    '/mergeTodo',
    JSON.stringify(dataToMerge),
    'application/json;charset=UTF-8',
    getToDos
  );
  closeMergeBox();
};

const attachListeners = function() {
  const createTaskBtn = getElement('createTask');
  const createTodoBtn = getElement('createTodo');
  const todoEntry = getElement('todoentry');
  const taskEntry = getElement('taskEntry');
  const todoTitle = getElement('todo-title');
  const todoSearchText = getElement('todoSearchText');
  const logout = getElement('logout');
  const help = getElement('help');
  const confirm = getElement('confirm');
  const cancel = getElement('cancel');
  const confirmMerge = getElement('confirm-merge');
  const cancelMerge = getElement('cancel-merge');
  const cancelHelp = getElement('cancel-help');
  const mergeTitleInput = getElement('new-title');

  confirm.onclick = moveTask;
  cancel.onclick = closeConfirmBox;
  confirmMerge.onclick = mergeTodo;
  cancelMerge.onclick = closeMergeBox;
  cancelHelp.onclick = closeHelpBox;
  mergeTitleInput.onkeyup = function(event) {
    if (event.keyCode == 13) {
      mergeTodo();
    }
  };

  logout.onclick = performLogout;
  help.onclick = openHelpBox;
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
