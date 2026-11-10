# Fotoshi2OSM (Labs prototype)

A photo-driven, human-reviewed OpenStreetMap improvement workflow inspired by [Adrien Pavie's Pic4Review](https://framagit.org/Pic4Carto/Pic4Review). The original Pic4Review frontend and backend are licensed under AGPL-3.0-or-later. This 2026-11-10 experiment reimplements the core *missions → place → photo → inspect tags → edit* flow for the Fotoshi public Places API.

Hosted at **https://labs.fotoshi.com/fotoshi2osm**. The Cloudflare Worker is attached only to the \`labs.fotoshi.com/fotoshi2osm*\` route, leaving the existing Labs site and other demos unchanged.

## Current functionality
- Pan and zoom a live map (Fotoshi basemap), or jump to Goldau, Lucerne or Songdo.
- Query publicly photographed Fotoshi places inside a bounded viewport and render a review queue.
- Inspect Fotoshi photo renditions with individual contributor and image-licence attribution where returned.
- Retrieve and display existing OSM tags for associated n/w/r identities.
- Choose missions: general verification, names, contacts, accessibility, opening hours.
- Enter a small set of suggested tags, copy changed values, then open the exact OSM element in the official iD editor. The user must compare/confirm the evidence and use their own OSM login to save.
- Mark locally reviewed and skip tasks during the current browser session.
- Bounded, read-only Cloudflare API proxy, without API keys, session cookies or writes.

## Deliberate limitations
**No OSM edits are written from this prototype.** iD handles OAuth, validation, conflicts, changesets and actual submission. We do not imply that marking "reviewed" is an OSM edit. Future OAuth2/PKCE and changeset support requires an independently registered OSM application with the correct callback URL, plus transactional conflict/error handling.

The public \`/v1/places\` API is not a full tagging/AI inference API. Imagery is supporting evidence, never an automatic reason to change a tag. Photo age, source, OSM linkage, and licence must be checked manually. Existing images are only displayed using public renditions.

This prototype does not manage shared missions or persist review progress. Photo-specific URLs and grouped-place response shape can change; the client defensively accommodates common public formats.

## Build and deploy
\`worker.js\` contains \`const HTML = __HTML__;\`. Insert a JSON-encoded copy of \`index.html\` in place of this placeholder when building the Worker:

\`\`\`js
import { readFileSync, writeFileSync } from "node:fs";
const html = readFileSync("index.html", "utf8");
const template = readFileSync("worker.js", "utf8");
writeFileSync("worker-built.js", template.replace("__HTML__;", JSON.stringify(html) + ";"));
\`\`\`

Upload \`worker-built.js\` as an ES module Worker named \`fotoshi2osm-labs\`, then route exactly \`labs.fotoshi.com/fotoshi2osm*\` to it. Do not route \`labs.fotoshi.com/*\` to this Worker.

The upstream application was not deployed verbatim because the older React 15/Pic4Review backend stack requires substantial maintenance and a separate PostGIS installation. The workflow and licence attribution remain explicit here.

## Licence and acknowledgements
Copyright 2026 Fotoshi contributors. This modified/reimplemented experiment is offered under **GNU Affero General Public License v3 or later**. Full text: [LICENSE.txt](./LICENSE.txt). Modified 10 November 2026.

Inspired by Pic4Review, copyright 2017–2020 Adrien Pavie, which identifies Christopher Beddow among its contributors. Upstream source: [Pic4Review](https://framagit.org/Pic4Carto/Pic4Review). Copyright and photo licences remain with the relevant upstream owners.

OpenStreetMap data © OpenStreetMap contributors, ODbL. Fotoshi photos are separately licensed, and individual image attribution must be respected.
