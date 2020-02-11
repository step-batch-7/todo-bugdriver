const createSessionId = function() {
  return (new Date().getTime() + Math.random()).toString().replace('.', '');
};

class Sessions {
  constructor() {
    this.sessionList = {};
  }

  getAttribute(key) {
    return this.sessionList[key];
  }

  createSession(userName) {
    const sessionId = createSessionId();
    this.sessionList[sessionId] = userName;
    return sessionId;
  }
}

module.exports = Sessions;
