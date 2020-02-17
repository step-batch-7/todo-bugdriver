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
          {
            id: 'task_1',
            name: 'Task1',
            done: true,
            time: 1580982179586,
            expiryDate: ''
          }
        ]
      },
      {
        id: 'todo_2',
        title: 'Todo2',
        time: 1580982185835,
        tasks: [
          {
            id: 'task_2',
            name: 'Task1',
            done: false,
            time: 1580982189967,
            expiryDate: ''
          }
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
            {
              id: 'task_1',
              name: 'Task1',
              done: true,
              time: 1580982179586,
              expiryDate: ''
            }
          ]
        },
        {
          id: 'todo_2',
          title: 'Todo2',
          time: 1580982185835,
          tasks: [
            {
              id: 'task_2',
              name: 'Task1',
              done: false,
              time: 1580982189967,
              expiryDate: ''
            }
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

    it('should not give todoData if user not logged in', done => {
      request(app)
        .get('/getTodo')
        .expect(401, done);
    });
  });

  context('/login.html', () => {
    it('should serve the login page', done => {
      request(app)
        .get('/login.html')
        .expect(200)
        .expect('Content-Type', 'text/html', done)
        .expect(/login/);
    });
  });

  context('/signup.html', () => {
    it('should serve the signup page', done => {
      request(app)
        .get('/signup.html')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=UTF-8', done)
        .expect(/signup/);
    });
  });

  context('/checkUserNameAvailability', () => {
    it('should check the availabilty of user name', done => {
      request(app)
        .get('/checkUserNameAvailability?name=test')
        .expect(200)
        .expect('Content-Type', 'application/json', done)
        .expect(`{"available":true}`);
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

  context('/signUp', () => {
    it('should create new user', done => {
      request(app)
        .post('/signUp')
        .send('name=test&userName=test&password=test')
        .set('content-type', 'application/x-www-form-urlencoded')
        .expect(302, done)
        .expect('Location', 'index.html');
    });
    it('should not create user if username already exists', done => {
      request(app)
        .post('/signUp')
        .send('name=test&userName=testuser&password=test')
        .set('content-type', 'application/x-www-form-urlencoded')
        .expect(302, done)
        .expect('Location', 'signup.html');
    });
  });

  context('/login', () => {
    it('should login existing user', done => {
      request(app)
        .post('/login')
        .send('userName=testuser&password=passowrd')
        .set('content-type', 'application/x-www-form-urlencoded')
        .expect(302, done)
        .expect('Location', 'index.html');
    });

    it('should give login page if credential not matched', done => {
      request(app)
        .post('/login')
        .send('userName=wrongUser&password=wrongPassword')
        .set('content-type', 'application/x-www-form-urlencoded')
        .expect(200, done)
        .expect(/You have entered an invalid username or password/);
    });
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

  context('/setExpiryDate', () => {
    it('should set the expiry date of given taskId', done => {
      request(app)
        .put('/setExpiryDate')
        .send(
          `{"todoId":"todo_1","taskId":"task_3", "expiryDate":1580982179586}`
        )
        .set('cookie', '_SID=testSessionId')
        .set('content-type', 'application/json;charset=UTF-8')
        .expect(201, done);
    });
  });

  context('/updateTaskName', () => {
    it('should update task name of given taskId', done => {
      request(app)
        .put('/updateTaskName')
        .send(`{"todoId":"todo_1","taskId":"task_3", "name":"newTaskName"}`)
        .set('cookie', '_SID=testSessionId')
        .set('content-type', 'application/json;charset=UTF-8')
        .expect(201, done);
    });
  });

  context('/moveTaskToAnotherTodo', () => {
    it('should move task from one todo to another todo', done => {
      request(app)
        .put('/moveTaskToAnotherTodo')
        .send(`{"taskId":"task_3","todoId":"todo_1", "targetTodoId":"todo_3"}`)
        .set('cookie', '_SID=testSessionId')
        .set('content-type', 'application/json;charset=UTF-8')
        .expect(201, done);
    });
  });

  context('/mergeTodo', () => {
    it('should merge two todos and create a new todo', done => {
      request(app)
        .put('/mergeTodo')
        .send(
          `{"firstTodoId":"todo_1", "secondTodoId":"todo_3", "newTitle":"newTodo"}`
        )
        .set('cookie', '_SID=testSessionId')
        .set('content-type', 'application/json;charset=UTF-8')
        .expect(201, done);
    });
  });
});
