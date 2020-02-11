const fs = require('fs');
const { App } = require('./app');
const config = require('../config');
const TODO_PATH = config.DATA_STORE;
const USER_STORE = config.USERS_STORE;
const TodoList = require('./todo');
const { parse } = require('querystring');
const CONTENT_TYPES = require('../CONTENT_TYPES');
const Sessions = require('./sesson');
const sessions = new Sessions();

const getNotFoundResponse = function(req, res) {
  const body = `
  <html>
    <head>
      <title>NOT FOUND</title>
    </head>
    <body>
      <h4>requested resource is not found on the server</h4>
    </body>
  </html>`;
  res.writeHead(404, 'Not Found');
  res.end(body);
};

const loadTodos = function() {
  let todoJSON = '[]';
  const isExistingFile =
    fs.existsSync(TODO_PATH) && fs.statSync(TODO_PATH).isFile();
  if (isExistingFile) {
    todoJSON = fs.readFileSync(TODO_PATH);
  }
  return TodoList.load(JSON.parse(todoJSON));
};

const redirect = function(res, location) {
  res.statusCode = 302;
  res.setHeader('location', location);
  res.end();
};

const loadUsers = function() {
  let usersJSON = '[]';
  const isExistingFile =
    fs.existsSync(USER_STORE) && fs.statSync(USER_STORE).isFile();
  if (isExistingFile) {
    usersJSON = fs.readFileSync(USER_STORE);
  }
  return JSON.parse(usersJSON);
};

const updateToDoToFile = function(todoData) {
  const todoJSONString = JSON.stringify(todoData);
  fs.writeFileSync(TODO_PATH, todoJSONString, 'utf8');
};

const updateUsersToFile = function(users) {
  const userJSONString = JSON.stringify(users);
  fs.writeFileSync(USER_STORE, userJSONString, 'utf8');
};

const getFileDataResponse = function(req, res, next) {
  const url = req.url === '/' ? '/index.html' : req.url;
  const filePath = `public${url}`;
  const isExistingFile =
    fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  if (!isExistingFile) {
    return next();
  }
  const extension = filePath.split('.').pop();
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(fs.readFileSync(filePath));
};

const getTodoData = function(req, res) {
  const todoList = loadTodos();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(todoList.todoList));
};

const updateTodoTitle = function(req, res) {
  const todoList = loadTodos();
  const { todoId, title } = req.JSONbody;
  todoList.updateTodoTitle(todoId, title);
  updateToDoToFile(todoList.todoList);
  res.statusCode = 201;
  res.end();
};

const saveTodo = function(req, res) {
  const todoList = loadTodos();
  const { title } = req.JSONbody;
  const todoId = todoList.addTodo(title);
  res.statusCode = 201;
  updateToDoToFile(todoList.todoList);
  res.setHeader('Content-Type', 'application/json');
  res.end(`"{'todoId':${todoId}}"`);
};

const updateTaskName = function(req, res) {
  const todoList = loadTodos();
  const { todoId, taskId, name } = req.JSONbody;
  todoList.updateTaskNameInTodo(todoId, taskId, name);
  res.statusCode = 201;
  updateToDoToFile(todoList.todoList);
  res.end();
};

const saveTaskToTodo = function(req, res) {
  const todoList = loadTodos();
  const { todoId, taskName } = req.JSONbody;
  res.statusCode = 201;
  const taskId = todoList.addTaskToTodo(todoId, taskName);
  updateToDoToFile(todoList.todoList);
  res.setHeader('Content-Type', 'application/json');
  res.end(`"{'taskId':${taskId}}"`);
};

const updateTaskDoneStatus = function(req, res) {
  const todoList = loadTodos();
  const { todoId, taskId } = req.JSONbody;
  res.statusCode = 201;
  req.JSONbody && todoList.changeTaskStatus(todoId, taskId);
  updateToDoToFile(todoList.todoList);
  res.end();
};

const deleteTask = function(req, res) {
  const todoList = loadTodos();
  const { todoId, taskId } = req.JSONbody;
  req.JSONbody && todoList.deleteTask(todoId, taskId);
  updateToDoToFile(todoList.todoList);
  res.end();
};

const deleteTodo = function(req, res) {
  const todoList = loadTodos();
  const { todoId } = req.JSONbody;
  req.JSONbody && todoList.deleteTodo(todoId);
  updateToDoToFile(todoList.todoList);
  res.end();
};

const isValidUser = function(userName, password, users) {
  return users.some(
    user => user.userName === userName && user.password === password
  );
};

const login = function(req, res) {
  const users = loadUsers();
  const { userName, password } = req.POSTbody;
  if (isValidUser(userName, password, users)) {
    const sessionId = sessions.createSession(userName);
    res.setHeader('Set-Cookie', `_SID=${sessionId}`);
    return redirect(res, 'index.html');
  }
  redirect(res, 'login.html');
};

const signUp = function(req, res) {
  const { name, userName, password } = req.POSTbody;
  const users = loadUsers();
  const regDate = new Date().getTime();
  const newUser = { name, userName, password, regDate };
  users.push(newUser);
  updateUsersToFile(users);
  redirect(res, 'index.html');
};

const readBody = function(req, res, next) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });
  req.on('end', () => {
    if (req.headers['content-type'] === 'application/json;charset=UTF-8') {
      req.JSONbody = JSON.parse(body);
    }
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      req.POSTbody = parse(body);
    }
    req.body = body;
    next();
  });
};

const app = new App();
app.use(readBody);
app.get('/getTodo', getTodoData);
app.get('', getFileDataResponse);
app.get('', getNotFoundResponse);
app.post('/saveTodo', saveTodo);
app.post('/saveTask', saveTaskToTodo);
app.post('/updateTaskDoneStatus', updateTaskDoneStatus);
app.post('/deleteTask', deleteTask);
app.post('/deleteTodo', deleteTodo);
app.post('/signUp', signUp);
app.post('/login', login);
app.put('/updateTodoTitle', updateTodoTitle);
app.put('/updateTaskName', updateTaskName);
app.post('', getNotFoundResponse);

module.exports = { app };
