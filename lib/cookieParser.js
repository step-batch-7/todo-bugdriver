const getCookies = function(req) {
  if (!req.headers.cookie) return {};
  const cookieKeyValues = req.headers.cookie.split('; ');
  return cookieKeyValues.reduce((cookies, pair) => {
    const [key, value] = pair.split('=');
    cookies[key] = value;
    return cookies;
  }, {});
};

module.exports = { getCookies };
