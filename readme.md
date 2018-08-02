# Usage

## Installation

After cloning the repository,

 - `npm install` or `yarn install`

 The app needs to be configured with the url of a CouchDB (or other database respecting the CouchDB replication protocol) server. See `/src/ENVIRONMENT_VARS.ts` to point the app toward a specific database. The default value, for ease of development startup, points to an in-browser pouch-db database.

 The alternate value in `ENVIRONMENT_VARS.TS` points to the default url of a locally running CouchDB database.

  - [CouchDB Website](http://couchdb.apache.org/)

  Note that CORS may need to be enabled in your CouchDB install.

## Development Build / Serve

 - `npm run serve` or `yarn serve`

Does an in-memory build of the project and hosts with the webpack dev server. Hot reloading and source maps included for debugging.

## Debugging

The project can be debugged inside of VSCode using the existing settings from the `./vscode` folder. After starting a development server with `yarn serve` / `npm run serve`, hitting F5 will launch VSCode's debugger and attach to the process. (Note: debugging is slightly buggy for the time being. See #2.)

Debugging / virtual DOM exploration is also available in the browser via [vue-devtools](https://github.com/vuejs/vue-devtools).

 - [Firefox Addon](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
 - [Chrome Extension](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)

## Production Build

Check for relevant flags in `/src/ENVIRONMENT_VARS.ts` before building for production.

- `npm run build` or `yarn build`

Outputs a static web page in the `/build` folder.


# Licence

The project in general follows the AGPL-3.0 licence. However, materials in `/src/base-course/` fall under the MIT licence (this folder will eventually be pulled to its own repository/package - see #3).

[AGPL-3.0](https://opensource.org/licenses/AGPL-3.0)

[MIT](https://opensource.org/licenses/MIT)
