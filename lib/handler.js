const fs = require('fs');
const config = require('../config');
const TODO_PATH = config.DATA_STORE;
const {
  loadTodos,
  loadUsers,
  updateToDoToFile,
  updateUsersToFile
} = require('./dataFileOperations');
const { getCookies } = require('./cookieParser');
const TodoList = require('./todoList');
const CONTENT_TYPES = require('../CONTENT_TYPES');
const Sessions = require('./sesson');
const sessions = new Sessions();
config.TEST_SESSION && sessions.setAttribute('testSessionId', 'testuser');
const userTodoData = loadTodos(TODO_PATH);

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

const getUserTodoData = function(req, res, next) {
  req.todoList = userTodoData[req.userName];
  if (!req.todoList) {
    userTodoData[req.userName] = new TodoList();
    req.todoList = userTodoData[req.userName];
  }
  next();
};

const fillTemplate = function(fileName, replaceTokens) {
  const path = `./templates/${fileName}`;
  const template = fs.readFileSync(path, 'UTF8');
  const keys = Object.keys(replaceTokens);
  const replace = (template, key) => {
    const regExp = new RegExp(`__${key}__`, 'g');
    return template.replace(regExp, replaceTokens[key]);
  };
  return keys.reduce(replace, template);
};

const checkUserNameAvailable = function(req, res) {
  const { name } = req.body;
  const users = loadUsers();
  const isUserNameAvailable = users.every(user => user.userName !== name);
  res.end(`{"available":${isUserNameAvailable}}`);
};

const getUser = function(req) {
  const cookies = getCookies(req);
  const sId = cookies['_SID'];
  return sessions.getAttribute(sId);
};

const isUserLogedIn = function(req, res, next) {
  const currentUser = getUser(req);
  if (currentUser) {
    req.userName = currentUser;
    req.todoPath = TODO_PATH;
    return next();
  }
  res.statusCode = 401;
  res.end();
};

const redirect = function(res, location) {
  res.statusCode = 302;
  res.setHeader('location', location);
  res.end();
};

const getTodoData = function(req, res) {
  const todoList = req.todoList;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(todoList.todoList));
};

const updateTodoTitle = function(req, res) {
  const todoList = req.todoList;
  const { todoId, title } = req.body;
  todoList.updateTodoTitle(todoId, title);
  updateToDoToFile(req, userTodoData);
  res.statusCode = 201;
  res.end();
};

const serveHomePage = function(req, res, next) {
  return getFileDataResponse(req, res, next);
};

const saveTodo = function(req, res) {
  const todoList = req.todoList;
  const { title } = req.body;
  const todoId = todoList.addTodo(title);
  res.statusCode = 201;
  updateToDoToFile(req, userTodoData);
  res.setHeader('Content-Type', 'application/json');
  res.end(`"{'noOfTodos':${todoId}}"`);
};

const updateTaskName = function(req, res) {
  const todoList = req.todoList;
  const { todoId, taskId, name } = req.body;
  todoList.updateTaskNameInTodo(todoId, taskId, name);
  res.statusCode = 201;
  updateToDoToFile(req, userTodoData);
  res.end();
};

const saveTaskToTodo = function(req, res) {
  const todoList = req.todoList;
  const { todoId, taskName } = req.body;
  res.statusCode = 201;
  const taskId = todoList.addTaskToTodo(todoId, taskName);
  updateToDoToFile(req, userTodoData);
  res.setHeader('Content-Type', 'application/json');
  res.end(`"{'taskId':${taskId}}"`);
};

const updateTaskDoneStatus = function(req, res) {
  const todoList = req.todoList;
  const { todoId, taskId } = req.body;
  res.statusCode = 201;
  req.body && todoList.changeTaskStatus(todoId, taskId);
  updateToDoToFile(req, userTodoData);
  res.end();
};

const deleteTask = function(req, res) {
  const todoList = req.todoList;
  const { todoId, taskId } = req.body;
  req.body && todoList.deleteTask(todoId, taskId);
  updateToDoToFile(req, userTodoData);
  res.end();
};

const deleteTodo = function(req, res) {
  const todoList = req.todoList;
  const { todoId } = req.body;
  req.body && todoList.deleteTodo(todoId);
  updateToDoToFile(req, userTodoData);
  res.end();
};

const isValidUser = function(userName, password, users) {
  return users.some(
    user => user.userName === userName && user.password === password
  );
};

const mergeTodos = function(req, res) {
  const { firstTodoId, secondTodoId, newTitle } = req.body;
  const todoList = req.todoList;
  todoList.mergeTodos(firstTodoId, secondTodoId, newTitle);
  todoList.deleteTodo(firstTodoId);
  todoList.deleteTodo(secondTodoId);
  updateToDoToFile(req, userTodoData);
  res.statusCode = 201;
  res.end();
};

const moveTaskToAnotherTodo = function(req, res) {
  const { taskId, todoId, targetTodoId } = req.body;
  const todoList = req.todoList;
  todoList.moveTask(taskId, todoId, targetTodoId);
  todoList.deleteTask(todoId, taskId);
  updateToDoToFile(req, userTodoData);
  res.statusCode = 201;
  res.end();
};

const serveLoginPage = function(req, res) {
  const filePath = 'login.html';
  const loginPage = fillTemplate(filePath, { errorMsg: '' });
  res.end(loginPage);
};

const login = function(req, res) {
  const users = loadUsers();
  const { userName, password } = req.body;
  if (isValidUser(userName, password, users)) {
    const sessionId = sessions.createSession(userName);
    res.setHeader('Set-Cookie', `_SID=${sessionId}`);
    return redirect(res, 'index.html');
  }
  const loginPage = fillTemplate('login.html', {
    errorMsg: 'You have entered an invalid username or password'
  });
  res.end(loginPage);
};

const serveSignUpPage = function(req, res) {
  const filePath = 'public/signup.html';
  res.end(fs.readFileSync(filePath));
};

const signUp = function(req, res) {
  const { name, userName, password } = req.body;
  const users = loadUsers();
  const regDate = new Date().getTime();
  const newUser = { name, userName, password, regDate };
  users.push(newUser);
  updateUsersToFile(users);
  const sessionId = sessions.createSession(userName);
  res.setHeader('Set-Cookie', `_SID=${sessionId}`);
  redirect(res, 'index.html');
};

module.exports = {
  serveLoginPage,
  serveSignUpPage,
  checkUserNameAvailable,
  signUp,
  login,
  isUserLogedIn,
  getTodoData,
  serveHomePage,
  getNotFoundResponse,
  saveTodo,
  saveTaskToTodo,
  updateTaskDoneStatus,
  deleteTask,
  deleteTodo,
  updateTodoTitle,
  updateTaskName,
  moveTaskToAnotherTodo,
  mergeTodos,
  getUserTodoData
};
