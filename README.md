# Portfolio

Built with Eleventy. Use Node.js 26.12.1 or a newer security-patched 26.x release.
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

Node.js 26.12.1 includes the [October 21, 2026 security fixes](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).
The `.nvmrc` pin and `package.json` engine requirement document the runtime baseline;
they do not update an existing Node installation. Configure the build environment
and any Node serverless runtime (including `api/track.js`) to use a patched runtime
before rebuilding and redeploying. Check the hosting provider's supported Node
versions and actual patch version; an engine declaration alone is not proof that
the deployed runtime is patched.

The pages are generated as static files, while Eleventy and its parsers run during
builds and local development. Audit the locked dependencies with `npm audit` and
commit `package-lock.json` alongside dependency updates.
