const fs = require('fs');
const { App } = require('./app');
const config = require('../config');
const TODO_PATH = config.DATA_STORE;
const TodoList = require('./todo');
const CONTENT_TYPES = require('../CONTENT_TYPES');
let todoList;

const getNotFoundResponse = function(req, res) {
  const body = `<html>
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

const loadTodos = function() {
  let todoJSON = '[]';
  const isExistingFile =
    fs.existsSync(TODO_PATH) && fs.statSync(TODO_PATH).isFile();
  if (isExistingFile) {
    todoJSON = fs.readFileSync(TODO_PATH);
  }
  todoList = TodoList.load(JSON.parse(todoJSON));
  return todoJSON;
};

const getTodoData = function(req, res) {
  res.end(loadTodos());
};

const saveTodo = function(req, res) {
  req.JSONbody && todoList.addTodo(req.JSONbody.title);
  res.statusCode = 201;
  fs.writeFileSync(TODO_PATH, JSON.stringify(todoList.todoList), 'utf8');
  res.end();
};

const saveTaskToTodo = function(req, res) {
  const { todoId, taskName } = req.JSONbody;
  res.statusCode = 201;
  req.JSONbody && todoList.addTaskToTodo(todoId, taskName);
  fs.writeFileSync(TODO_PATH, JSON.stringify(todoList.todoList), 'utf8');
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
app.post('', getNotFoundResponse);

module.exports = { app };
