# BuildAdda Programs

BuildAdda SPARK and IGNITE program website, application flow, and admin review interface.

## Run locally

Use Node.js 22.13+ (the local database adapter uses `node:sqlite`).

```sh
npm ci
npm run build
npm run dev
```

Open http://127.0.0.1:4187. Applications are at `/apply`; admin review is at `/admin`.

The local server binds to loopback and supplies a local preview identity. It stores synthetic/local submissions in `.local/applications.sqlite`. Do not use this development identity adapter as a public production server.

## Verify

```sh
npm test
```

## Project structure

- `public/`: current website, four-image hero carousel, application UI, admin UI, and brand/image assets.
- `src/`: Worker entry point and application/review API.
- `db/` and `drizzle/`: database schema, local adapter, and migrations.
- `build.mjs`: embeds current public assets into `dist/server/` and copies hosting metadata.
- `dev.mjs`: current local development server.
- `tests/`: validation, storage, access control, idempotency, and status audit tests.
- `assets-source/`: supplied logo assets and generated-image prompts/provenance.
- `QA-V4.md`: local application-flow verification record.
- `release-review.json`: current review/publication status.

The root `server.mjs` and static files directly under `dist/` are legacy landing-page artifacts retained from earlier revisions. Use `npm run build` and `npm run dev` for the complete current application.

## Hosting and application data

Production is configured for the Sites Worker runtime with a D1 database binding named `DB` and trusted platform authentication headers. The administrator check is configured in `src/api.mjs`. Hosting elsewhere requires adapting authentication and database bindings; never trust client-supplied identity headers on a public server.

Local application records, dependencies, environment files, and generated Worker output are excluded from Git. No payment is collected during application submission.

## Release status

Latest local revision: V6, including the supplied three-dot logo mark and four-image carousel. Image scenes are generated illustrations, not documentary photos of actual participants. The supplied pack's Manch wordmark is not used; the original standalone mark is paired with BuildAdda.

GitHub source upload is not website publication. Website publication and Instagram cuts remain on hold until explicit CMO APPROVE.
