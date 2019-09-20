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
  let proxy_opts = {};

  // D8 site.
  if (req.url.startsWith('/programs/professional-programs') || req.url.startsWith('/core') || req.url.startsWith('/libraries/union') || req.url.startsWith('/themes/custom/union_marketing')) {
    proxy_opts.target = 'https://d8.master-7rqtwti-yf4o2w34wqxm6.us-2.platformsh.site';
  }

  // This is a test to proxy the registration site.
  if (req.url.startsWith('/registration')) {
    proxy_opts.target = 'https://register.ilr.cornell.edu';
  }

  proxy.web(req, res, proxy_opts);
});

console.log("listening on port " + process.env.PORT)
server.listen(process.env.PORT);
