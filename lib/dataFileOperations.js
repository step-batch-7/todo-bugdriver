const fs = require('fs');
const config = require('../config');
const USER_STORE = config.USERS_STORE;
const TodoList = require('./todoList');
const loadTodos = function(req) {
  let todoJSON = '[]';
  const isExistingFile =
    fs.existsSync(req.todoPath) && fs.statSync(req.todoPath).isFile();
  if (isExistingFile) {
    todoJSON = fs.readFileSync(req.todoPath);
  }
  return TodoList.load(JSON.parse(todoJSON));
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
  const todoJSONString = JSON.stringify(todoData, null, 2);
  fs.writeFileSync(req.todoPath, todoJSONString, 'utf8');
};

const updateUsersToFile = function(users) {
  const userJSONString = JSON.stringify(users);
  fs.writeFileSync(USER_STORE, userJSONString, 'utf8');
};

module.exports = { loadTodos, loadUsers, updateToDoToFile, updateUsersToFile };
