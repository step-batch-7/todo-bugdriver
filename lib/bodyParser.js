const { parse } = require('querystring');

const parseGetBody = function(req) {
  const [url, data] = req.url.split('?');
  req.url = url;
  req.body = parse(data);
};

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
    parseGetBody(req);
    next();
  });
};

module.exports = { readBody };
