const { App } = require('./app');
const { readBody } = require('./bodyParser');

const {
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
} = require('./handler');

const app = new App();
app.use(readBody);
app.get('/login.html', serveLoginPage);
app.get('/signup.html', serveSignUpPage);
app.get('/checkUserNameAvailability', checkUserNameAvailable);
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
app.put('/moveTaskToAnotherTodo', moveTaskToAnotherTodo);
app.put('/mergeTodo', mergeTodos);
app.post('', getNotFoundResponse);

module.exports = { app };
