[![image](https://user-images.githubusercontent.com/10780590/132559883-8d65a1ef-d930-468b-8805-7e1003e05c7d.png)](https://www.youtube.com/watch?v=a6tvHMvF8Mo)

An experiment in mass-collaborative authoring of general, intelligent tutoring systems.

# Usage

## Installation

After cloning the repository,

- `npm install` or `yarn install`

The app needs to be configured with the url of a CouchDB (or other database respecting the CouchDB replication protocol) server. See `/src/ENVIRONMENT_VARS.ts` to point the app toward a specific database. The default value, for ease of development startup, points to an in-browser pouch-db database.

The alternate value in `ENVIRONMENT_VARS.TS` points to the default url of a locally running CouchDB database.

- [CouchDB Website](http://couchdb.apache.org/)

Note that CORS may need to be enabled in your CouchDB install.

# Development

This project is scaffolded with [vue-cli 3](https://cli.vuejs.org/). See the vue-cli docs for more detail on build / deployment / environment configuation.

## Development Build / Serve

**Prerequisites**:
- initialize the test database submodule with `git submodule init`
- install `docker`

`npm run serve` or `yarn serve` from the project root.

Does:
- in-memory build of the project and hosts with the webpack dev server.  Hot reloading and source maps included for in-browser debugging.
- runs the express server backend.
- launches a couchdb backend with [test data](http://github.com/nilock/skuilder-test-data) as a docker container

## UI Component browsing with mock data

`npm run test:ui` or `yarn test:ui` from `./packages/vue`

Builds and runs the front-end with mock data sources. Navigate to `localhost:8080/uimocks`.

## Debugging

The project can be debugged inside of VSCode using the existing settings from `./vscode/launch.json`. After starting a development server with `yarn serve` / `npm run serve`, hitting F5 will launch VSCode's debugger and attach to the process. Launch configurations for Firefox and Chrome are present. They need the VSCode [debugger for firefox](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-firefox-debug) and [debugger for chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) exensions, respectively.

As of now, only the firefox debugger is functioning reliably (see #2).

Component state / props / virtual DOM exploration is also available in the browser via [vue-devtools](https://github.com/vuejs/vue-devtools).

- [Firefox Addon](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
- [Chrome Extension](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)

## Production Build

Check for relevant flags in `/src/ENVIRONMENT_VARS.ts` before building for production.

- `npm run build` or `yarn build`

Outputs a static web page in the `/build` folder.

# License

The project in general follows the AGPL-3.0 licence. However, materials in `/src/base-course/` fall under the MIT licence (this folder will eventually be pulled to its own repository/package - see #3).

[AGPL-3.0](https://opensource.org/licenses/AGPL-3.0)

[MIT](https://opensource.org/licenses/MIT)
