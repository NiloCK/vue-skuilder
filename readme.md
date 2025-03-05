![E2E Tests](https://github.com/patched-network/vue-skuilder/actions/workflows/e2e-tests.yml/badge.svg)

General tooling for interactive tutoring systems, with experimentation toward
- mass-collaborative authoring
- mixture-of-expert-systems guided learning
- self-healing courses via proactive surfacing of learning bottlenecks
- content inheritance between courses

Think: the FOSS lovechild of anki, duolingo, wikipedia, and MathAcadamy, with a more generalized surface area for the types of content and skills that can be exercised.

Aiming toward effective libraries and a main learner-loop to enable:
- a. independent authoring of individual courses
- b. community developed courses
- c. a platform to support both a. and b.

## Project Architecture

This monorepo contains three primary components:

- **Vue SPA Frontend** (`packages/vue`): Vue 3 + Vuetify 3 progressive web app
- **Express API** (`packages/express`): Node.js backend API
- **CouchDB Database**: Storage layer with replication protocol support

## Development Quick Start

### Prerequisites

- Node.js 18+
- Yarn 4 (or corepack)
- Docker (for development database)

### Commands

```bash
git clone https://github.com/patched-network/vue-skuilder.git
cd vue-skuilder
git submodule update --init --recursive
yarn install
yarn dev
```

This will:
- Build the common package
- Start a local CouchDB instance in Docker with test data
- Launch the Express backend server
- Launch the Vue frontend (http://localhost:5173)

## Production Build

```bash
yarn build
```

This builds all packages and outputs the frontend as a static web app in the `packages/vue/dist` folder and the backend in `packages/express/dist`.

## License

This project is licensed under:

- **AGPL-3.0** for the core platform: [License](https://opensource.org/licenses/AGPL-3.0)
- **MIT** for materials in base course content: [License](https://opensource.org/licenses/MIT)
