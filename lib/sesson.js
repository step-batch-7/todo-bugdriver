const createSessionId = function() {
  return (new Date().getTime() + Math.random()).toString().replace('.', '');
};

class Sessions {
  constructor() {
    this.sessionList = {};
  }

  setAttribute(sessionId, value) {
    this.sessionList[sessionId] = value;
  }

  getAttribute(key) {
    return this.sessionList[key];
  }

  createSession(userName) {
    const sessionId = createSessionId();
    this.setAttribute(sessionId, userName);
    return sessionId;
  }
}

module.exports = new Sessions();
