const http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    dotenv = require('dotenv').config();

const drupal_7_url = 'https://www.master-7rqtwti-dd2imk5jkez6q.us-2.platformsh.site',
      drupal_8_url = 'https://d8.ilr.cornell.edu';

const should_use_d8 = (req) => {
  const d8_path_prefixes = [
          '/programs/professional-education',
          '/programs/professional-programs',
          '/core',
          '/libraries/union',
          '/themes/custom/union_marketing',
          '/sites/default/files-d8',
          '/media/oembed'
        ];

  // Test the incoming request against the above path prefixes. This will be set
  // to true if the incoming request URL starts with any of the prefixes above.
  const d8_path_prefix_test = d8_path_prefixes.some((path_prefix) => req.url.startsWith(path_prefix));

  return d8_path_prefix_test;
};

// Create the proxy with a default target of the D7 site.
const proxy = httpProxy.createProxyServer({
  target: drupal_7_url,
  changeOrigin: true,
  autoRewrite: true,
  preserveHeaderKeyCase: true,
  xfwd: true,
  cookieDomainRewrite: ""
});

const server = http.createServer(function(req, res) {
  let proxy_opts = {};

  // Proxy this request to D8 if the incoming request passes certain criteria.
  // This is done by overriding the default proxy target, set above.
  if (should_use_d8(req)) {
    proxy_opts.target = drupal_8_url;
  }

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
