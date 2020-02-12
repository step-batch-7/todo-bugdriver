const { parse } = require('querystring');
const readBody = function(req, res, next) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });
  req.on('end', () => {
    if (req.headers['content-type'] === 'application/json;charset=UTF-8') {
      req.JSONbody = JSON.parse(body);
    }
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      req.POSTbody = parse(body);
    }
    req.body = body;
    next();
  });
};

module.exports = { readBody };
