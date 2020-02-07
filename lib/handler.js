const fs = require('fs');
const { App } = require('./app');
const config = require('../config');
const TODO_PATH = config.DATA_STORE;
const TodoList = require('./todo');
const CONTENT_TYPES = require('../CONTENT_TYPES');

const loadTodos = function() {
  let todoJSON = '[]';
  const isExistingFile =
    fs.existsSync(TODO_PATH) && fs.statSync(TODO_PATH).isFile();
  if (isExistingFile) {
    todoJSON = fs.readFileSync(TODO_PATH);
  }
  return TodoList.load(JSON.parse(todoJSON));
};
let todoList = loadTodos();

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

const updateToDo = function(todoData) {
  const todoJSONString = JSON.stringify(todoData);
  fs.writeFileSync(TODO_PATH, todoJSONString, 'utf8');
};

const getFileDataResponse = function(req, res, next) {
  const url = req.url == '/' ? '/index.html' : req.url;
  const filePath = `public${url}`;
  const isExistingFile =
    fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  if (!isExistingFile) return next();
  const extension = filePath.split('.').pop();
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(fs.readFileSync(filePath));
};

const getTodoData = function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(todoList.todoList));
};

const saveTodo = function(req, res) {
  const { title } = req.JSONbody;
  const todoId = todoList.addTodo(title);
  res.statusCode = 201;
  updateToDo(todoList.todoList);
  res.setHeader('Content-Type', 'application/json');
  res.end(`"{'todoId':${todoId}}"`);
};

const saveTaskToTodo = function(req, res) {
  const { todoId, taskName } = req.JSONbody;
  res.statusCode = 201;
  const taskId = todoList.addTaskToTodo(todoId, taskName);
  updateToDo(todoList.todoList);
  res.setHeader('Content-Type', 'application/json');
  res.end(`"{'taskId':${taskId}}"`);
};

const updateTaskDoneStatus = function(req, res) {
  const { todoId, taskId } = req.JSONbody;
  res.statusCode = 201;
  req.JSONbody && todoList.changeTaskStatus(todoId, taskId);
  updateToDo(todoList.todoList);
  res.end();
};

const deleteTask = function(req, res) {
  const { todoId, taskId } = req.JSONbody;
  req.JSONbody && todoList.deleteTask(todoId, taskId);
  updateToDo(todoList.todoList);
  res.end();
};

const deleteTodo = function(req, res) {
  const { todoId } = req.JSONbody;
  req.JSONbody && todoList.deleteTodo(todoId);
  updateToDo(todoList.todoList);
  res.end();
};

const readBody = function(req, res, next) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    if (req.headers['content-type'] === 'application/json;charset=UTF-8')
      req.JSONbody = JSON.parse(body);
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
app.post('', getNotFoundResponse);

module.exports = { app };
