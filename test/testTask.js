const assert = require('chai').assert;
const Task = require('../lib/task');

describe('Task', function() {
  describe('isDone', function() {
    it('should give false when the task is not done', function() {
      const task = new Task(1, 'work', false, '2020-02-13T12:26:55.093Z');
      assert.isFalse(task.isDone);
    });
    it('should give true when the task is done', function() {
      const task = new Task(1, 'work', true, '2020-02-13T12:26:55.093Z');
      assert.isTrue(task.isDone);
    });
  });

  describe('setName', function() {
    it('should set the name of existing task', function() {
      const task = new Task(1, 'work', false, '2020-02-13T12:26:55.093Z');
      assert.strictEqual(task.setName('work done'), 'work done');
    });
  });

  describe('changeDoneStatus', function() {
    it('should give true when the task is done', function() {
      const task = new Task(1, 'work', false, '2020-02-13T12:26:55.093Z');
      assert.isTrue(task.changeDoneStatus());
    });

    it('should give false when the task is not done', function() {
      const task = new Task(1, 'work', false, '2020-02-13T12:26:55.093Z');
      assert.isTrue(task.changeDoneStatus());
    });
  });
});
