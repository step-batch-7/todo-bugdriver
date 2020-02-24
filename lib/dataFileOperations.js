const config = require('../config');
const TodoList = require('./todoList');
const redis = require('redis');
const redis_url = process.env.REDIS_URL || '127.0.0.1:6379';

const parseTodo = function(todoData) {
  const usersTodoList = {};
  todoData = todoData || '{}';
  todoData = JSON.parse(todoData);
  Object.keys(todoData).forEach(userName => {
    usersTodoList[userName] = TodoList.load(todoData[userName]);
  });
  return usersTodoList;
};

const loadTodos = function(app) {
  const client = redis.createClient();
  client.get('todoPath', (err, data) => {
    app.locals.todoPath = parseTodo(data);
  });
  client.quit();
};

const loadUsers = function(app) {
  const client = redis.createClient();
  client.get('users', (err, data) => {
    data = data || '[]';
    app.locals.users = JSON.parse(data);
  });
  client.quit();
};

const updateToDoToFile = function(req, todoData) {
  const client = redis.createClient();
  const dataToWrite = {};
  Object.keys(todoData).forEach(userName => {
    dataToWrite[userName] = todoData[userName].todoList;
  });
  const todoJSONString = JSON.stringify(dataToWrite, null, 2);
  client.set('todoPath', todoJSONString);
  client.quit();
  return todoJSONString;
};

const updateUsersToFile = function(users) {
  const client = redis.createClient();
  const userJSONString = JSON.stringify(users, null, 2);
  client.set('users', userJSONString);
  client.quit();
  return userJSONString;
};

module.exports = { loadTodos, loadUsers, updateToDoToFile, updateUsersToFile };
