# Usage

## Installation

After cloning the repository,

 - `npm install` or `yarn install`

 The app needs to be configured with the url of a CouchDB (or other database respecting the CouchDB replication protocol) server. See `/src/ENVIRONMENT_VARS.ts` to point the app toward a specific database. The default value points to a locally running CouchDB instance at the default port.

  - [CouchDB Website](http://couchdb.apache.org/)

  Note that CORS may need to be enabled in your CouchDB install.

## Development Build / Serve

 - `npm run serve` or `yarn serve`

Does an in-memory build of the project and hosts with the webpack dev server. Hot reloading and source maps included for debugging.

## Production Build

- `npm run build` or `yarn build`

Outputs a static web page in the `/build` folder

# Debugging

For now, debugging is available only in the browser via [vue-devtools](https://github.com/vuejs/vue-devtools).

 - [Firefox Addon](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
 - [Chrome Extension](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)



# Licence

[AGPL-3.0](https://opensource.org/licenses/AGPL-3.0)
