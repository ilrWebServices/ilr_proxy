const http = require('http'),
    httpProxy = require('http-proxy'),
    dotenv = require('dotenv').config();

var proxy = httpProxy.createProxyServer({
  target: 'https://www.master-7rqtwti-dd2imk5jkez6q.us-2.platformsh.site',
  changeOrigin: true,
  autoRewrite: true,
  preserveHeaderKeyCase: true,
  xfwd: true,
  cookieDomainRewrite: ""
});

var server = http.createServer(function(req, res) {
  let proxy_opts = {};

  // D8 site.
  // if (req.url.startsWith('/programs/professional-education') || req.url.startsWith('/programs/professional-programs') || req.url.startsWith('/core') || req.url.startsWith('/libraries/union') || req.url.startsWith('/themes/custom/union_marketing') || req.url.startsWith('/sites/default/files-d8')) {
  //   proxy_opts.target = 'https://d8.ilr.cornell.edu';
  // }

  // Add a header to the response to help with debugging the source of this
  // proxied request.
  if (typeof proxy_opts.target !== 'undefined') {
    res.setHeader('X-ILR-Proxy-Source', '<' + proxy_opts.target + '>');
  }
  else {
    res.setHeader('X-ILR-Proxy-Source', '<' + proxy.options.target + '>');
  }

  proxy.web(req, res, proxy_opts);
});

console.log("listening on port " + process.env.PORT)
server.listen(process.env.PORT);
