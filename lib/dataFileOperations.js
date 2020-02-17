const fs = require('fs');
const config = require('../config');
const USER_STORE = config.USERS_STORE;
const TodoList = require('./todoList');

const parseTodo = function(todoData) {
  const usersTodoList = {};
  Object.keys(todoData).forEach(userName => {
    usersTodoList[userName] = TodoList.load(todoData[userName]);
  });
  return usersTodoList;
};

const readData = function(todoPath, defaultData) {
  const isExistingFile =
    fs.existsSync(todoPath) && fs.statSync(todoPath).isFile();
  if (isExistingFile) {
    return fs.readFileSync(todoPath);
  }
  return defaultData;
};

const loadTodos = function(todoPath) {
  const todoJSON = readData(todoPath, '{}');
  return parseTodo(JSON.parse(todoJSON));
};

const loadUsers = function() {
  const usersJSON = readData(USER_STORE, '[]');
  return JSON.parse(usersJSON);
};

const updateToDoToFile = function(req, todoData) {
  const dataToWrite = {};
  Object.keys(todoData).forEach(userName => {
    dataToWrite[userName] = todoData[userName].todoList;
  });
  const todoJSONString = JSON.stringify(dataToWrite, null, 2);
  fs.writeFileSync(req.todoPath, todoJSONString, 'utf8');
  return todoJSONString;
};

const updateUsersToFile = function(users) {
  const userJSONString = JSON.stringify(users, null, 2);
  fs.writeFileSync(USER_STORE, userJSONString, 'utf8');
  return userJSONString;
};

module.exports = { loadTodos, loadUsers, updateToDoToFile, updateUsersToFile };
