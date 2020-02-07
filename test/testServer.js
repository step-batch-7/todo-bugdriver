const request = require('supertest');
const { app } = require('../lib/handler');
const fs = require('fs');
const TODO_FILE_PATH = require('../config').DATA_STORE;
const expectedTodoRecord = [
  {
    id: 'todo1',
    title: 'Todo1',
    time: 1580982174979,
    tasks: [{ id: 'task1', name: 'Task1', done: true, time: 1580982179586 }],
  },
  {
    id: 'todo2',
    title: 'Todo2',
    time: 1580982185835,
    tasks: [{ id: 'task3', name: 'Task1', done: false, time: 1580982189967 }],
  },
];

describe('GET', () => {
  context('/getTodo', () => {
    it('should give todoData to user', done => {
      request(app.serve.bind(app))
        .get('/getTodo')
        .expect(200)
        .expect('Content-Type', 'application/json', done)
        .expect(JSON.stringify(expectedTodoRecord));
    });
  });
});

describe('POST', () => {
  afterEach(() => {
    fs.writeFileSync(
      TODO_FILE_PATH,
      JSON.stringify(expectedTodoRecord),
      'utf8'
    );
  });
  context('/saveTodo', () => {
    it('should save new todo', done => {
      request(app.serve.bind(app))
        .post('/saveTodo')
        .send(`{ "title": "hellow" }`)
        .set('content-type', 'application/json;charset=UTF-8')
        .expect(201, done)
        .expect('Content-Type', 'application/json')
        .expect(/"{'todoId':.*}"/);
    });
  });
  context('/deleteTodo', () => {
    it('should delete todo having given todoId', done => {
      request(app.serve.bind(app))
        .post('/deleteTodo')
        .send(`{ "todoId": "todo2" }`)
        .set('content-type', 'application/json;charset=UTF-8')
        .expect(200, done);
    });
  });
  context('/saveTask', () => {
    it('should save task in given todoId', done => {
      request(app.serve.bind(app))
        .post('/saveTask')
        .send(`{"todoId":"todo1","taskName":"testTask"}`)
        .set('content-type', 'application/json;charset=UTF-8')
        .expect(201, done)
        .expect(/"{'taskId':.*}"/);
    });
  });
  context('/deleteTask', () => {
    it('should delete task in given todoId and having given taskId', done => {
      request(app.serve.bind(app))
        .post('/deleteTask')
        .send(`{"todoId":"todo1","taskId":"task1"}`)
        .set('content-type', 'application/json;charset=UTF-8')
        .expect(200, done);
    });
  });
});
