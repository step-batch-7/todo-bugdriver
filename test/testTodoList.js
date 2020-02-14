const assert = require('chai').assert;
const TodoList = require('../lib/todoList');
const Todo = require('../lib/todo');
const Task = require('../lib/task');

describe('TodoList', () => {
  context('addTodo', () => {
    it('Should add the new todo in todoList', () => {
      const todoList = new TodoList();
      assert.strictEqual(todoList.addTodo('New Todo'), 'todo_1');
    });
  });
  context('addExistingTodo', () => {
    it('Should add Existing Todo in todoList', () => {
      const todoList = new TodoList();
      assert.strictEqual(todoList.addExistingTodo({}), 1);
    });
  });
  context('getTodo', () => {
    it('Should get Todo from todoList', () => {
      const todoList = new TodoList();
      const todo = new Todo('todo_1', 'todoTitle', '2020-02-13T12:26:55.093Z');
      todoList.addExistingTodo(todo);
      assert.deepStrictEqual(todoList.getTodo('todo_1'), todo);
    });
  });
  context('moveTask', () => {
    it('Should move task from one todo to another todo', () => {
      const todoList = new TodoList();
      const todo = new Todo('todo_1', 'todoTitle1', '2020-02-13T12:26:55.093Z');
      todo.addTask({ id: 'task_1', name: 'newTask' });
      const todo1 = new Todo('todo_2', 'newTodo', '2020-02-13T12:26:55.093Z');
      todoList.addExistingTodo(todo);
      todoList.addExistingTodo(todo1);
      assert.strictEqual(todoList.moveTask('task_1', 'todo_1', 'todo_2'), 1);
    });
  });
  context('deleteTodo', () => {
    it('Should delete todo from todoList', () => {
      const todoList = new TodoList();
      const todo = new Todo('todo_1', 'todoTitle1', '2020-02-13T12:26:55.093Z');
      todoList.addExistingTodo(todo);
      assert.strictEqual(todoList.deleteTodo('todo_1'), 0);
    });
  });
  context('changeTaskStatus', () => {
    it('Should change the task status from given todo', () => {
      const todoList = new TodoList();
      const todo = new Todo('todo_1', 'todoTitle1', '2020-02-13T12:26:55.093Z');
      todo.addTask(
        new Task('task_1', 'newTask', false, '2020-02-13T12:26:55.093Z')
      );
      todoList.addExistingTodo(todo);
      assert.isTrue(todoList.changeTaskStatus('todo_1', 'task_1'));
    });
  });
  context('updateTodoTitle', () => {
    it('Should update the title of given todo', () => {
      const todoList = new TodoList();
      const todo = new Todo('todo_1', 'todoTitle1', '2020-02-13T12:26:55.093Z');
      todoList.addExistingTodo(todo);
      assert.strictEqual(
        todoList.updateTodoTitle('todo_1', 'newTitle'),
        'newTitle'
      );
    });
  });

  context('updateTaskNameInTodo', () => {
    it('Should update task name in todo', () => {
      const todoList = new TodoList();
      const todo = new Todo('todo_1', 'todoTitle1', '2020-02-13T12:26:55.093Z');
      todo.addTask(
        new Task('task_1', 'newTask', false, '2020-02-13T12:26:55.093Z')
      );
      todoList.addExistingTodo(todo);
      assert.strictEqual(
        todoList.updateTaskNameInTodo('todo_1', 'task_1', 'newTask'),
        'newTask'
      );
    });
  });

  context('deleteTask', () => {
    it('Should delete task in todo', () => {
      const todoList = new TodoList();
      const todo = new Todo('todo_1', 'todoTitle1', '2020-02-13T12:26:55.093Z');
      todo.addTask(
        new Task('task_1', 'newTask', false, '2020-02-13T12:26:55.093Z')
      );
      todoList.addExistingTodo(todo);
      assert.strictEqual(todoList.deleteTask('todo_1', 'task_1'), 0);
    });
  });

  context('addTaskToTodo', () => {
    it('Should add new task to todo', () => {
      const todoList = new TodoList();
      const todo = new Todo('todo_1', 'todoTitle1', '2020-02-13T12:26:55.093Z');
      todoList.addExistingTodo(todo);
      assert.strictEqual(todoList.addTaskToTodo('todo_1', 'newTask'), 'task_1');
    });
  });

  context('mergeTodos', () => {
    it('Should add tasks of first todo to second todo', () => {
      const todoList = new TodoList();
      const todo = new Todo('todo_1', 'todoTitle1', '2020-02-13T12:26:55.093Z');
      const todo1 = new Todo('todo_2', 'newTitle', '2020-02-13T12:26:55.093Z');
      todo.addTask(
        new Task('task_1', 'newTask', false, '2020-02-13T12:26:55.093Z')
      );
      todo1.addTask(
        new Task('task_2', 'newTask', false, '2020-02-13T12:26:55.093Z')
      );
      todoList.addExistingTodo(todo);
      todoList.addExistingTodo(todo1);
      assert.strictEqual(todoList.mergeTodos('todo_1', 'todo_2', 'newTodo'), 3);
    });
  });

  context('load', () => {
    it('Should parse todoJSON into todoListObject', () => {
      const sampleTodoJSON = [
        {
          id: 'todo_1',
          title: 'newTitle1',
          time: 1580982174979,
          tasks: [
            { id: 'task_1', name: 'Task1', done: true, time: 1580982179586 }
          ]
        }
      ];
      const todoList = new TodoList();
      const todo = new Todo('todo_1', 'newTitle1', 1580982174979);
      todo.addTask(new Task('task_1', 'Task1', true, 1580982179586));
      todoList.addExistingTodo(todo);
      todoList.lastTaskId = 1;
      todoList.lastTodoId = 1;
      assert.deepEqual(TodoList.load(sampleTodoJSON), todoList);
    });
  });
});
