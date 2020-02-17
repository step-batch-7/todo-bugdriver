const { assert } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const {
  loadTodos,
  loadUsers,
  updateToDoToFile,
  updateUsersToFile
} = require('../lib/dataFileOperations');

const sampleJSONData = JSON.stringify({
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
    }
  ]
});

const expected = {
  testuser: {
    lastTaskId: 1,
    lastTodoId: 1,
    todoList: [
      {
        id: 'todo_1',
        tasks: [
          {
            done: true,
            expiryDate: '',
            id: 'task_1',
            name: 'Task1',
            time: 1580982179586
          }
        ],
        time: 1580982174979,
        title: 'newTitle1'
      }
    ]
  }
};

describe('dataFileOperations', () => {
  afterEach(() => {
    sinon.restore();
  });
  context('loadTodos', () => {
    it('Should load todos data', () => {
      const fakeExistsSync = sinon.stub().returns(true);
      const fakeIsFile = sinon.stub().returns(true);
      const fakeStatSync = sinon.stub().returns({ isFile: fakeIsFile });
      const fakeReadFileSync = sinon
        .stub()
        .withArgs('todoPath')
        .returns(sampleJSONData);
      sinon.replace(fs, 'existsSync', fakeExistsSync);
      sinon.replace(fs, 'statSync', fakeStatSync);
      sinon.replace(fs, 'readFileSync', fakeReadFileSync);
      assert.deepStrictEqual(loadTodos('todoPath'), expected);
    });
    it('Should give empty object when file is not given', () => {
      const fakeExistsSync = sinon
        .stub()
        .withArgs('bad')
        .returns(false);
      sinon.replace(fs, 'existsSync', fakeExistsSync);
      assert.deepStrictEqual(loadTodos('bad'), {});
    });
  });

  context('loadUsers', () => {
    const sampleUserData = [
      {
        name: 'test',
        userName: 'test',
        password: 'test',
        regDate: 1581429382892
      }
    ];
    it('should load the users data', () => {
      const fakeExistsSync = sinon.stub().returns(true);
      const fakeIsFile = sinon.stub().returns(true);
      const fakeStatSync = sinon.stub().returns({ isFile: fakeIsFile });
      const fakeReadFileSync = sinon
        .stub()
        .withArgs('userPath')
        .returns(JSON.stringify(sampleUserData));
      sinon.replace(fs, 'existsSync', fakeExistsSync);
      sinon.replace(fs, 'statSync', fakeStatSync);
      sinon.replace(fs, 'readFileSync', fakeReadFileSync);
      assert.deepStrictEqual(loadUsers('userPath'), sampleUserData);
    });
    it('Should give empty list when file is not given', () => {
      const fakeExistsSync = sinon
        .stub()
        .withArgs('bad')
        .returns(false);
      sinon.replace(fs, 'existsSync', fakeExistsSync);
      assert.deepStrictEqual(loadUsers('bad'), []);
    });
  });

  context('updateToDoToFile', () => {
    const todoList = [
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
      }
    ];
    const sampleDataToUpdate = JSON.stringify(
      { testuser: { todoList } },
      null,
      2
    );
    const expectedData = JSON.stringify({ testuser: todoList }, null, 2);
    it('Should update ToDo to file', () => {
      const req = { todoPath: 'todoPath' };
      sinon.replace(
        fs,
        'writeFileSync',
        sinon.stub().withArgs(req.todoPath, sampleDataToUpdate, 'utf8')
      );
      assert.strictEqual(
        updateToDoToFile(req, JSON.parse(sampleDataToUpdate)),
        expectedData
      );
    });
  });

  context('updateUsersToFile', () => {
    const sampleUserData = JSON.stringify(
      [
        {
          name: 'test',
          userName: 'test',
          password: 'test',
          regDate: 1581429382892
        }
      ],
      null,
      2
    );
    it('Should update Users to file', () => {
      sinon.replace(fs, 'writeFileSync', sinon.fake());
      assert.strictEqual(
        updateUsersToFile(JSON.parse(sampleUserData)),
        sampleUserData
      );
    });
  });
});
