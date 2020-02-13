const assert = require('chai').assert;
const Todo = require('../lib/todo');

describe('Todo', function() {
  describe('addTask', function() {
    it('should add the given items into the todoItems', function() {
      const todo = new Todo(1, 'todoTitle', '2020-02-13T12:26:55.093Z');
      assert.strictEqual(todo.addTask('task'), 1);
    });
  });

  describe('addNewTask', function() {
    it('should add the given task detail into the todoItems', function() {
      const todo = new Todo(1, 'todoTitle', '2020-02-13T12:26:55.093Z');
      assert.strictEqual(
        todo.addNewTask(1, 'name', false, '2020-02-13T12:26:55.093Z'),
        1
      );
    });
  });

  describe('setTitle', function() {
    it('should change the existing title', function() {
      const todo = new Todo(1, 'todoTitle', '2020-02-13T12:26:55.093Z');
      assert.strictEqual(todo.setTitle('newtitle'), 'newtitle');
    });
  });

  describe('appendTaskFromTodo', function() {
    it('should add the given tasks from given todo into the existing todo', function() {
      const todo = new Todo(1, 'todoTitle', '2020-01-13T12:26:55.093Z');
      const todo1 = new Todo(2, 'todoTitle1', '2020-02-13T12:26:55.093Z');
      todo1.addTask('task1');
      assert.strictEqual(todo.appendTaskFromTodo(todo1), 1);
    });
  });

  describe('appendTaskFromTodos', function() {
    it('should add the given tasks from given todos into the existing todo', function() {
      const todo = new Todo(1, 'todoTitle', '2020-01-13T12:26:55.093Z');
      const todo1 = new Todo(2, 'todoTitle1', '2020-02-13T12:26:55.093Z');
      todo1.addTask('task1');
      const todo2 = new Todo(3, 'todoTitle2', '2020-02-13T12:26:55.093Z');
      todo2.addTask('task2');
      assert.strictEqual(todo.appendTaskFromTodos(todo1, todo2), 2);
    });
  });

  describe('getTask', function() {
    it('should give task having given taskId', function() {
      const todo = new Todo(1, 'todoTitle', '2020-01-13T12:26:55.093Z');
      todo.addNewTask(1, 'name', false, '2020-02-13T12:26:55.093Z');
      assert.deepEqual(todo.getTask(1), {
        id: 1,
        name: 'name',
        done: false,
        time: '2020-02-13T12:26:55.093Z'
      });
    });
  });

  describe('deleteTask', function() {
    it('should delete Task having given taskId', function() {
      const todo = new Todo(1, 'todoTitle', '2020-01-13T12:26:55.093Z');
      todo.addNewTask(1, 'name', false, '2020-02-13T12:26:55.093Z');
      assert.deepEqual(todo.deleteTask(1), [
        {
          id: 1,
          name: 'name',
          done: false,
          time: '2020-02-13T12:26:55.093Z'
        }
      ]);
    });
  });
});
