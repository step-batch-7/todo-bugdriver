const fs = require('fs');
const config = require('../config');
const TODO_DIR = config.DATA_STORE;
const {
  loadTodos,
  loadUsers,
  updateToDoToFile,
  updateUsersToFile
} = require('./dataFileOperations');
const { getCookies } = require('./cookieParser');
const CONTENT_TYPES = require('../CONTENT_TYPES');
const Sessions = require('./sesson');
const sessions = new Sessions();
config.TEST_SESSION && sessions.setAttribute('testSessionId', 'testuser');

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
  const { name } = req.JSONbody;
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
    req.user = currentUser;
    req.todoPath = `${TODO_DIR}/${currentUser}.json`;
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

const getFileDataResponse = function(req, res, next) {
  if (req.url === '/') {
    return redirect(res, 'index.html');
  }
  const url = req.url;
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
  const todoList = loadTodos(req);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(todoList.todoList));
};

const updateTodoTitle = function(req, res) {
  const todoList = loadTodos(req);
  const { todoId, title } = req.JSONbody;
  todoList.updateTodoTitle(todoId, title);
  updateToDoToFile(req, todoList.todoList);
  res.statusCode = 201;
  res.end();
};

const serveHomePage = function(req, res, next) {
  return getFileDataResponse(req, res, next);
};

const saveTodo = function(req, res) {
  const todoList = loadTodos(req);
  const { title } = req.JSONbody;
  const todoId = todoList.addTodo(title);
  res.statusCode = 201;
  updateToDoToFile(req, todoList.todoList);
  res.setHeader('Content-Type', 'application/json');
  res.end(`"{'noOfTodos':${todoId}}"`);
};

const updateTaskName = function(req, res) {
  const todoList = loadTodos(req);
  const { todoId, taskId, name } = req.JSONbody;
  todoList.updateTaskNameInTodo(todoId, taskId, name);
  res.statusCode = 201;
  updateToDoToFile(req, todoList.todoList);
  res.end();
};

const saveTaskToTodo = function(req, res) {
  const todoList = loadTodos(req);
  const { todoId, taskName } = req.JSONbody;
  res.statusCode = 201;
  const taskId = todoList.addTaskToTodo(todoId, taskName);
  updateToDoToFile(req, todoList.todoList);
  res.setHeader('Content-Type', 'application/json');
  res.end(`"{'taskId':${taskId}}"`);
};

const updateTaskDoneStatus = function(req, res) {
  const todoList = loadTodos(req);
  const { todoId, taskId } = req.JSONbody;
  res.statusCode = 201;
  req.JSONbody && todoList.changeTaskStatus(todoId, taskId);
  updateToDoToFile(req, todoList.todoList);
  res.end();
};

const deleteTask = function(req, res) {
  const todoList = loadTodos(req);
  const { todoId, taskId } = req.JSONbody;
  req.JSONbody && todoList.deleteTask(todoId, taskId);
  updateToDoToFile(req, todoList.todoList);
  res.end();
};

const deleteTodo = function(req, res) {
  const todoList = loadTodos(req);
  const { todoId } = req.JSONbody;
  req.JSONbody && todoList.deleteTodo(todoId);
  updateToDoToFile(req, todoList.todoList);
  res.end();
};

const isValidUser = function(userName, password, users) {
  return users.some(
    user => user.userName === userName && user.password === password
  );
};

const mergeTodos = function(req, res) {
  const { firstTodoId, secondTodoId, newTitle } = req.JSONbody;
  const todoList = loadTodos(req);
  todoList.mergeTodos(firstTodoId, secondTodoId, newTitle);
  todoList.deleteTodo(firstTodoId);
  todoList.deleteTodo(secondTodoId);
  updateToDoToFile(req, todoList.todoList);
  res.statusCode = 201;
  res.end();
};

const moveTaskToAnotherTodo = function(req, res) {
  const { taskId, todoId, targetTodoId } = req.JSONbody;
  const todoList = loadTodos(req);
  todoList.moveTask(taskId, todoId, targetTodoId);
  todoList.deleteTask(todoId, taskId);
  updateToDoToFile(req, todoList.todoList);
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
  const { userName, password } = req.JSONbody;
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
  const { name, userName, password } = req.JSONbody;
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
  getFileDataResponse,
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
  mergeTodos
};
