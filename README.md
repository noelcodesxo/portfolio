# Portfolio

Built with Eleventy. Use Node.js 24.22.1 or a newer security-patched 24.x release.
With nvm installed:

```sh
nvm install
nvm use
npm ci --ignore-scripts
npm run build
```

Run `npm run dev` for the local development server. Dependency lifecycle scripts
are not needed for this project; keep them disabled during installation.

## Runtime security

Node.js 24.22.1 includes the [October 21, 2026 security fixes](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).
The `.nvmrc` pin selects the patched local runtime. The `package.json` engine
selects `24.x`, a [Vercel-supported Node major](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
Vercel manages minor and patch updates for builds and serverless functions,
including `api/track.js`; it does not allow pinning an exact patch version.
Verify the provider's deployed patch version is at least 24.22.1. These project
settings do not update an existing local Node installation.

The pages are generated as static files, while Eleventy and its parsers run during
builds and local development. Audit the locked dependencies with `npm audit` and
commit `package-lock.json` alongside dependency updates.
