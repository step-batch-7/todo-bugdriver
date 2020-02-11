const fs = require('fs');
const { App } = require('./app');
const config = require('../config');
const TODO_DIR = config.DATA_STORE;
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

const getCookies = function(req) {
  if (!req.headers.cookie) return {};
  const cookieKeyValues = req.headers.cookie.split('; ');
  return cookieKeyValues.reduce((cookies, pair) => {
    const [key, value] = pair.split('=');
    cookies[key] = value;
    return cookies;
  }, {});
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

const loadTodos = function(req) {
  let todoJSON = '[]';
  const isExistingFile =
    fs.existsSync(req.todoPath) && fs.statSync(req.todoPath).isFile();
  if (isExistingFile) {
    todoJSON = fs.readFileSync(req.todoPath);
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

const updateToDoToFile = function(req, todoData) {
  const todoJSONString = JSON.stringify(todoData);
  fs.writeFileSync(req.todoPath, todoJSONString, 'utf8');
};

const updateUsersToFile = function(users) {
  const userJSONString = JSON.stringify(users);
  fs.writeFileSync(USER_STORE, userJSONString, 'utf8');
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
  if (isUserLogedIn(req)) {
    return getFileDataResponse(req, res, next);
  }
  redirect(res, 'login.html');
};

const saveTodo = function(req, res) {
  const todoList = loadTodos(req);
  const { title } = req.JSONbody;
  const todoId = todoList.addTodo(title);
  res.statusCode = 201;
  updateToDoToFile(req, todoList.todoList);
  res.setHeader('Content-Type', 'application/json');
  res.end(`"{'todoId':${todoId}}"`);
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

const serverLoginPage = function(req, res) {
  const filePath = 'public/login.html';
  res.end(fs.readFileSync(filePath));
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

const serverSignUpPage = function(req, res) {
  const filePath = 'public/signup.html';
  res.end(fs.readFileSync(filePath));
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
app.get('/login.html', serverLoginPage);
app.get('/signup.html', serverSignUpPage);
app.get('', getFileDataResponse);
app.post('/signUp', signUp);
app.post('/login', login);
app.use(isUserLogedIn);
app.get('/getTodo', getTodoData);
app.get('/index.html', serveHomePage);
app.get('', getNotFoundResponse);
app.post('/saveTodo', saveTodo);
app.post('/saveTask', saveTaskToTodo);
app.post('/updateTaskDoneStatus', updateTaskDoneStatus);
app.post('/deleteTask', deleteTask);
app.post('/deleteTodo', deleteTodo);
app.put('/updateTodoTitle', updateTodoTitle);
app.put('/updateTaskName', updateTaskName);
app.post('', getNotFoundResponse);

module.exports = { app };
