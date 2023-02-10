# ILR Proxy

This is a simple proxy to allow www.ilr.cornell.edu to use multiple sources for different paths of the site.

Initially, this will allow us to deliver some content, such as the Professional Programs section, from Drupal 8, while other content will fall back to the current Drupal 7 site.

Eventually, we will be able to transition to other D8 content, and eventually set the D8 site as the default and provide only legacy content from the D7 site.

## Setup

Copy `.env.example` to `.env` and configure as needed.

This project includes a `.tool-versions` file for use with (`asdf`)[https://asdf-vm.com/] and will use the recommended node.js version (18.4.x as of 2023-02) automatically.

For `nvm`, run:

```
nvm use      # If you use nvm. Otherwise, ensure you use node.js v18.x
npm install
```

## Usage

You can start the proxy via `npm run start`. During development, use `npm run dev` to automatically restart the server when changes are made to `server.js`.
