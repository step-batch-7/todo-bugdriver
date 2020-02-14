const request = require('supertest');
const { app } = require('../lib/router');
const sinon = require('sinon');
const sessions = require('../lib/sesson');
const fs = require('fs');
const TODO_FILE_PATH = require('../config').DATA_STORE;
const getSampleData = function() {
  return {
    testuser: [
      {
        id: 'todo_1',
        title: 'newTitle1',
        time: 1580982174979,
        tasks: [
          { id: 'task_1', name: 'Task1', done: true, time: 1580982179586 }
        ]
      },
      {
        id: 'todo_2',
        title: 'Todo2',
        time: 1580982185835,
        tasks: [
          { id: 'task_2', name: 'Task1', done: false, time: 1580982189967 }
        ]
      }
    ]
  };
};

describe('GET', () => {
  beforeEach(() => {
    const fakeCreateSession = function(userName) {
      const sessionId = 'testSessionId';
      this.setAttribute(sessionId, userName);
      return sessionId;
    };
    sinon.replace(sessions, 'createSession', fakeCreateSession);
    sessions.createSession('testuser');
  });
  afterEach(() => {
    sinon.restore();
  });
  context('/getTodo', () => {
    it('should give todoData to user', done => {
      const expectedData = [
        {
          id: 'todo_1',
          title: 'newTitle1',
          time: 1580982174979,
          tasks: [
            { id: 'task_1', name: 'Task1', done: true, time: 1580982179586 }
          ]
        },
        {
          id: 'todo_2',
          title: 'Todo2',
          time: 1580982185835,
          tasks: [
            { id: 'task_2', name: 'Task1', done: false, time: 1580982189967 }
          ]
        }
      ];
      request(app)
        .get('/getTodo')
        .expect(200)
        .set('cookie', '_SID=testSessionId')
        .expect('Content-Type', 'application/json', done)
        .expect(JSON.stringify(expectedData));
    });
  });
});

describe('POST', () => {
  beforeEach(() => {
    sinon.replace(fs, 'writeFileSync', sinon.fake());
    const fakeCreateSession = function(userName) {
      const sessionId = 'testSessionId';
      this.setAttribute(sessionId, userName);
      return sessionId;
    };
    sinon.replace(sessions, 'createSession', fakeCreateSession);
    sessions.createSession('testuser');
  });
  afterEach(() => {
    sinon.restore();
  });
  context('/saveTodo', () => {
    it('should save new todo', done => {
      request(app)
        .post('/saveTodo')
        .send(`{ "title": "hellow" }`)
        .set('content-type', 'application/json;charset=UTF-8')
        .set('cookie', '_SID=testSessionId')
        .expect(201, done)
        .expect('Content-Type', 'application/json')
        .expect(/"{'noOfTodos':todo_3}"/);
    });
  });
  context('/updateTaskDoneStatus', () => {
    it('should update task status in given todoId and having given taskId', done => {
      request(app)
        .post('/updateTaskDoneStatus')
        .send(`{"todoId":"todo_1","taskId":"task_1"}`)
        .set('cookie', '_SID=testSessionId')
        .set('content-type', 'application/json;charset=UTF-8')
        .expect(201, done);
    });
  });
  context('/deleteTodo', () => {
    it('should delete todo having given todoId', done => {
      request(app)
        .post('/deleteTodo')
        .send(`{ "todoId": "todo_2" }`)
        .set('content-type', 'application/json;charset=UTF-8')
        .set('cookie', '_SID=testSessionId')
        .expect(200, done);
    });
  });
  context('/saveTask', () => {
    it('should save task in given todoId', done => {
      request(app)
        .post('/saveTask')
        .send(`{"todoId":"todo_1","taskName":"testTask"}`)
        .set('content-type', 'application/json;charset=UTF-8')
        .set('cookie', '_SID=testSessionId')
        .expect(201, done)
        .expect(/"{'taskId':task_3}"/);
    });
  });
  context('/deleteTask', () => {
    it('should delete task in given todoId and having given taskId', done => {
      request(app)
        .post('/deleteTask')
        .send(`{"todoId":"todo_1","taskId":"task_1"}`)
        .set('cookie', '_SID=testSessionId')
        .set('content-type', 'application/json;charset=UTF-8')
        .expect(200, done);
    });
  });
});

describe('/PUT', () => {
  beforeEach(() => {
    sinon.replace(fs, 'writeFileSync', sinon.fake());
  });
  afterEach(() => {
    sinon.restore();
  });
  context('/updateTodoTitle', () => {
    it('should update todoId status in given todoId and having given taskId', done => {
      request(app)
        .put('/updateTodoTitle')
        .send(`{"todoId":"todo_1","title":"newTitle1"}`)
        .set('cookie', '_SID=testSessionId')
        .set('content-type', 'application/json;charset=UTF-8')
        .expect(201, done);
    });
  });
});
