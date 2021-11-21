## Preamble

// todo: move the prepending of this text to GH actions

This is the server for eduquilt.com. If you are reading this file you should probably be Colin Kennedy. If you are not me, and you are here without my permission, please consider getting in touch with a vulnerability report to some@email.com

## Other relevant information

This site is built and deployed via a github action, whose configuration lives at
https://github.com/NiloCK/vue-skuilder/blob/master/.github/workflows/deploy.yml

# Overview

The site has three components:

- a `vue` SPA
- an `express` nodejs server / api
- a `couchdb` database

Each of the three pieces exists on this machine (DO droplet) and is served to the world via a **Caddy2** server. The spa is served "normally", while the db and api are routed and reverse proxied. See `./deployment/Caddyfile` (local) or `/etc/caddy/Caddyfile` (droplet) for config of the Caddy server.

The droplet itself is set up with (from memory - todo - verify): ufw, sshkey login requirements

# `vue` spa

Caddy serves from the ~/www directory. ~/www is a symlink to the newest deploy, which lives in
~/dist/vue/{N}, where {N} is the latest numbered directory. Previous deployments are retained in {N-1}...{1}.

When a new deploy is run by github, the symlink ~/www is automatically re-focused on the latest ~/dist/vue/{N} folder, and the latest version is served to returning clients (with PWA background updates).

# `express` app

The express app is managed via `systemd` and its service configuration file lives at `./deployment/eqExpress.service` (local) and `/etc/systemd/system/eqExpress.service` (droplet).

# `couchdb` database

// todo
