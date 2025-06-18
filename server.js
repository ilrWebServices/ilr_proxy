const http = require('http'),
    httpProxy = require('http-proxy'),
    url = require('url'),
    dotenv = require('dotenv').config();

const drupal_7_url = process.env.DRUPAL_7_URL ?? 'https://d7-edit.ilr.cornell.edu',
      drupal_8_url = process.env.DRUPAL_8_URL ?? 'https://d8-edit.ilr.cornell.edu';

const should_use_d8 = (req) => {
  // Always use D8 for the home page, but not automatically for paths starting
  // with just a slash. Note that even if the user omits the initial `/`, the
  // request will include it, as required by RFC 2616 section 5.1.2.
  if (req.url === '/' || req.url.startsWith('/?')) {
    return true;
  }

  // Always use D8 if the path starts with any of the following.
  const d8_path_prefixes = [
    '/75',
    '/about-ilr',
    '/academics',
    '/ada30',
    '/alumni',
    '/apply',
    '/blog',
    '/buffalo-co-lab',
    '/cahrs',
    '/carow',
    '/cjei',
    '/climate-jobs-institute',
    '/conflict-resolution',
    '/core',
    '/cornell-debate',
    '/cornell-international-debate-camp',
    '/coronavirus',
    '/course',
    '/current-students',
    '/dei',
    '/discover',
    '/diversity-and-inclusion',
    '/diversity-equity-and-inclusion',
    '/eform/submit/transfer-offer',
    '/employee-relations',
    '/employment-law',
    '/events',
    '/expo',
    '/faculty-and-research',
    '/global-labor-institute',
    '/high-road',
    '/hooks/v1',
    '/human-resources',
    '/ilr-in-buffalo',
    '/ilr-sponsored-research-office',
    '/ilrie',
    '/institute-for-compensation-studies',
    '/institute-workplace-studies',
    '/ithaca-co-lab',
    '/job-search-study',
    '/jobsearchlab',
    '/labor-and-employment-law-program',
    '/labor-dynamics-institute',
    '/labor-relations',
    '/leadership',
    '/libraries/union',
    '/make-a-gift',
    '/masters',
    '/media/oembed',
    '/modules/contrib',
    '/modules/custom',
    '/new-conversations-project',
    '/new-york-city',
    '/news',
    '/office-engaged-and-experiential-programs',
    '/people',
    '/persona',
    '/programs',
    '/public-impact',
    '/remembering',
    '/research',
    '/robots.txt',
    '/scheinman-institute',
    '/scr-summer-school',
    '/sites/default/files-d8',
    '/search',
    '/system/files/webform',
    '/taft-award',
    '/themes/custom/union_marketing',
    '/webform',
    '/wide',
    '/work-and-coronavirus',
    '/worker-institute',
    '/yti'
  ];

  // Both D7 and D8 use these path prefixes. D8 should only be used if the
  // referer is one of the D8 prefixes above.
  const shared_path_prefixes = [
    '/views/ajax'
  ];

  // Test the incoming request against the D8 path prefixes.
  if (d8_path_prefixes.some((path_prefix) => req.url.startsWith(path_prefix))) {
    return true;
  }

  // Test for shared path requests like `/views/ajax`. The request url must
  // start with one of the `shared_path_prefixes` and the `referer` pathname
  // must start with one of the `d8_path_prefixes`. Note that this will fail for
  // browsers that disable the referer header.
  const req_referer_path = (typeof req.headers.referer !== 'undefined') ? new URL(req.headers.referer).pathname : '';
  if (shared_path_prefixes.some((path_prefix) => req.url.startsWith(path_prefix)) && d8_path_prefixes.some((path_prefix) => req_referer_path.startsWith(path_prefix))) {
    return true;
  }

  return false;
};

// Create the proxy with a default target of the D7 site.
const proxy = httpProxy.createProxyServer({
  target: drupal_7_url,
  changeOrigin: true,
  autoRewrite: true,
  preserveHeaderKeyCase: true,
  xfwd: true,
  cookieDomainRewrite: {
    ".ilr.cornell.edu": ".ilr.cornell.edu",
    ".ilr.test": ".ilr.test",
    "*": ""
  }
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

console.log("Drupal 7 served from " + drupal_7_url);
console.log("Drupal 8 served from " + drupal_8_url);
console.log("listening on port " + process.env.PORT);
server.listen(process.env.PORT);
