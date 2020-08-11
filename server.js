const http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    dotenv = require('dotenv').config();

const drupal_7_url = 'https://d7.ilr.cornell.edu',
      drupal_8_url = 'https://d8-edit.ilr.cornell.edu';

const should_use_d8 = (req) => {
  const req_referer_path = (typeof req.headers.referer !== 'undefined') ? url.parse(req.headers.referer).pathname : '',
        d8_path_prefixes = [
          '/programs/professional-education',
          '/programs/professional-programs',
          '/work-and-coronavirus',
          '/news/ilr-news/covid-19',
          '/worker-institute/blog',
          '/blog',
          '/ilrie',
          '/ada30',
          '/75',
          '/core',
          '/libraries/union',
          '/themes/custom/union_marketing',
          '/sites/default/files-d8',
          '/system/files/webform',
          '/media/oembed',
          '/modules/contrib/better_social_sharing_buttons/assets'
        ];

  // Test the incoming request against the above path prefixes. This will be set
  // to true if the incoming request URL starts with any of the prefixes above.
  const d8_path_prefix_test = d8_path_prefixes.some((path_prefix) => req.url.startsWith(path_prefix));

  // Special test for requests to /views/ajax, which both D7 and D8 respond to.
  // For this test, the request url must start with /views/ajax and the
  // _referer_ pathname must start with one of the `d8_path_prefixes`.
  const d8_views_ajax_test = req.url.startsWith('/views/ajax') && d8_path_prefixes.some((path_prefix) => req_referer_path.startsWith(path_prefix));

  return d8_path_prefix_test || d8_views_ajax_test;
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

const server = http.createServer((req, res) => {
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

  proxy.web(req, res, proxy_opts, function(e) {
    // Catch any proxy errors here.
    console.log(JSON.stringify(e, null, ' '));
  });
});

console.log("listening on port " + process.env.PORT)
server.listen(process.env.PORT);
