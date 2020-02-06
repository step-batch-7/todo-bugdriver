const request = require('supertest');
const { app } = require('../lib/handler');
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
  it('should give todoData to user', done => {
    request(app.serve.bind(app))
      .get('/getTodo')
      .expect(200)
      .expect('Content-Type', 'application/json', done)
      .expect(JSON.stringify(expectedTodoRecord));
  });
});
