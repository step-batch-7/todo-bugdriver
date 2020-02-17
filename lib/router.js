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

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/login.html', serveLoginPage);
app.get('/signup.html', serveSignUpPage);
app.get('/checkUserNameAvailability', checkUserNameAvailable);
app.post('/signUp', signUp);
app.post('/login', login);
app.use(isUserLogedIn);
app.use(getUserTodoData);
app.get('/getTodo', getTodoData);
app.post('/saveTodo', saveTodo);
app.post('/saveTask', saveTaskToTodo);
app.post('/updateTaskDoneStatus', updateTaskDoneStatus);
app.post('/deleteTask', deleteTask);
app.post('/deleteTodo', deleteTodo);
app.put('/setExpiryDate', setExpiryDate);
app.put('/updateTodoTitle', updateTodoTitle);
app.put('/updateTaskName', updateTaskName);
app.put('/moveTaskToAnotherTodo', moveTaskToAnotherTodo);
app.put('/mergeTodo', mergeTodos);

module.exports = { app };
