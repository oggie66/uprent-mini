# Uprent Mini

A personal rental-search project maintained by Ognjen Karagunovic, with a web app, browser extension, and API.

## Installation

1. Install [Bun](https://bun.sh/docs/installation) on your system
2. Run `bun i` in the project root

Done!

## Overview

This is a monorepo, that consists of several apps & packages.

Apps are isolated projects (meaning you cannot use code from `extension` in `web`, for example).

Packages contain shared code, that can be used in any app.

## Scripts

Each app has several scripts that you can use. To use them, `cd` into the app directory and then run `bun run <script name>`

### `lint`
This script runs ESLint & TypeScript checks. Everything is already configured, so it should just work!

### `start`
Runs the app. Does not reload when you change files.

### `dev`
Runs the app. Watches for file changes, and reloads the app automatically.

### `build`
Builds the app!

----

##### There are also two special scripts available in the root of the project:

### `gen`
Generates API type for the `~api` package. You should run this after each change of the schemas in `server`

### `lint:all`
Just a helper that runs all `lint` scripts, as well as checks code formatting
