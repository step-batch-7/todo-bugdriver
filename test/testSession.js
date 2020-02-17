const { assert } = require('chai');
const sinon = require('sinon');
const session = require('../lib/sesson');

describe('Sessions', () => {
  context('create session', () => {
    it('Should create new Session', () => {
      sinon.replace(Date, 'now', sinon.stub().returns(123));
      sinon.replace(Math, 'random', sinon.stub().returns(2));
      assert.strictEqual(session.createSession('session'), '125');
      sinon.restore();
    });
  });
  context('getAttribute', () => {
    it('Should get Attribute from sessions', () => {
      sinon.replace(Date, 'now', sinon.stub().returns(123));
      sinon.replace(Math, 'random', sinon.stub().returns(2));
      session.createSession('session1');
      assert.strictEqual(session.getAttribute('125'), 'session1');
      sinon.restore();
    });
  });
});
