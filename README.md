# ILR Proxy

This is a simple proxy to allow www.ilr.cornell.edu to use multiple sources for different paths of the site.

Initially, this will allow us to deliver some content, such as the Professional Programs section, from Drupal 8, while other content will fall back to the current Drupal 7 site.

Eventially, we will be able to transition to other D8 content, and eventually set the D8 site as the default and provide only legacy content from the D7 site.

## Setup

```
nvm use      # If you use nvm. Otherwise, ensure you use node.js v10.x
npm install
```

## Usage

You can start the proxy via `npm run start`. During development, use `npm run dev` to automatically restart the server when changes are made to `server.js`.
