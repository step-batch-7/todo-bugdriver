const express = require('express');

const {
  serveLoginPage,
  serveSignUpPage,
  checkUserNameAvailable,
  signUp,
  login,
  isUserLogedIn,
  getTodoData,
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
  getUserTodoData,
  setExpiryDate
} = require('./handler');

const validateFields = function(...fields) {
  return function(req, res, next) {
    if (
      typeof req.body === 'object' &&
      fields.every(field => field in req.body)
    ) {
      return next();
    }
    res.status(400).end();
  };
};

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/login.html', serveLoginPage);
app.get('/signup.html', serveSignUpPage);
app.get('/checkUserNameAvailability', checkUserNameAvailable);
app.post('/signUp', validateFields('name', 'userName', 'password'), signUp);
app.post('/login', validateFields('userName', 'password'), login);
app.use(isUserLogedIn);
app.use(getUserTodoData);
app.get('/getTodo', getTodoData);
app.post('/saveTodo', validateFields('title'), saveTodo);
app.post('/saveTask', validateFields('todoId', 'taskName'), saveTaskToTodo);
app.post(
  '/updateTaskDoneStatus',
  validateFields('todoId', 'taskId'),
  updateTaskDoneStatus
);
app.post('/deleteTask', validateFields('todoId', 'taskId'), deleteTask);
app.post('/deleteTodo', validateFields('todoId'), deleteTodo);
app.put(
  '/setExpiryDate',
  validateFields('todoId', 'taskId', 'expiryDate'),
  setExpiryDate
);
app.put('/updateTodoTitle', validateFields('todoId', 'title'), updateTodoTitle);
app.put(
  '/updateTaskName',
  validateFields('todoId', 'taskId', 'name'),
  updateTaskName
);
app.put(
  '/moveTaskToAnotherTodo',
  validateFields('taskId', 'todoId', 'targetTodoId'),
  moveTaskToAnotherTodo
);
app.put(
  '/mergeTodo',
  validateFields('firstTodoId', 'secondTodoId', 'newTitle'),
  mergeTodos
);

module.exports = { app };
