const http = require('http'),
    httpProxy = require('http-proxy'),
    dotenv = require('dotenv').config();

var proxy = httpProxy.createProxyServer({
  // This would default to d7.ilr.cornell.edu
  target: 'https://www.ilr.cornell.edu',
  changeOrigin: true,
  autoRewrite: true
});

var server = http.createServer(function(req, res) {
  // This is a test.
  if (req.url.startsWith('/registration')) {
    proxy.web(req, res, {
      target: 'https://register.ilr.cornell.edu'
    });
  }
  // Use the default proxy settings.
  else {
    proxy.web(req, res);
  }
});

console.log("listening on port " + process.env.PORT)
server.listen(process.env.PORT);
