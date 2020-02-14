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

const loadTodos = function(todoPath) {
  let todoJSON = '{}';
  const isExistingFile =
    fs.existsSync(todoPath) && fs.statSync(todoPath).isFile();
  if (isExistingFile) {
    todoJSON = fs.readFileSync(todoPath);
  }
  return parseTodo(JSON.parse(todoJSON));
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
  const dataToWrite = {};
  Object.keys(todoData).forEach(userName => {
    dataToWrite[userName] = todoData[userName].todoList;
  });
  const todoJSONString = JSON.stringify(dataToWrite, null, 2);
  fs.writeFileSync(req.todoPath, todoJSONString, 'utf8');
};

const updateUsersToFile = function(users) {
  const userJSONString = JSON.stringify(users);
  fs.writeFileSync(USER_STORE, userJSONString, 'utf8');
};

module.exports = { loadTodos, loadUsers, updateToDoToFile, updateUsersToFile };
