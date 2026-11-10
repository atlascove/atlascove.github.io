# Fotoshi2OSM — photo-first OSM review experiment

Live: https://labs.fotoshi.com/fotoshi2osm

This is a standalone implementation inspired by the **mission → feature → evidence → edit** workflow of [Pic4Review by Adrien Pavie](https://framagit.org/Pic4Carto/Pic4Review), licensed AGPL-3.0-or-later. It is **not** a fork of the entire historical Pic4Review frontend/backend. Pic4Review has real missions with area, feature selection, data provider, theme, progress and templates; the filter dropdown here is a local view over real Fotoshi place metadata, **not** an actual persistent mission engine.

## Current preview

- Real Fotoshi photos and photographed places from its public `/v1/places?bbox=...` endpoint, directly from the allowed Labs browser origin; no developer API key in JavaScript.
- Two switchable **OSM-derived** basemaps: the Fotoshi vector style (`tiles.fotoshi.com`) and [OpenFreeMap Liberty](https://openfreemap.org/quick_start/) (`tiles.openfreemap.org`), which permits commercial use and requires map attribution. The map does **not** use the donation-funded `tile.openstreetmap.org` servers.
- Separate **data-driven queues**, using the persisted feature `created_source` and external IDs: not linked to OSM; specifically Fotoshi-created and unlinked; specifically Overture-sourced and unlinked; matched to OSM; and all features. If a Fotoshi-created feature later acquired an Overture ID, it **remains Fotoshi-origin**. Missing an `osm_id` is not evidence the place is absent from OSM.
- Compare a linked element's **live OSM tags** (read-only API) against recorded public Fotoshi metadata `tags_primary`, `tags_secondary`, name and brand. Display differences as **review candidates**, not automatic attribute truth: public metadata can itself derive from OSM/Overture. Show the capture date and source when available. We do not infer opening hours from a photo unless actual attribute evidence is present.
- Candidate addition/update, reviewed locally, uncertain/skip and open-in-iD actions. No direct changeset writes are possible yet.
- An **unchecked, opt-in** switch for anonymous telemetry of those decisions. Only selected action, public feature ID, existing OSM reference if any, source-origin code, queue filter and a random **per-page** session ID are written to a dedicated EU-jurisdiction Cloudflare D1 database. No tracking is sent when unchecked. These are review intents, **not** verified OSM additions or completed changesets. Source schema: [schema.sql](schema.sql). Telemetry backend permits only same-origin JSON requests with bounded fields and a strict event allowlist.

## Not implemented

**OSM OAuth 2.0** is the next prerequisite before editing on-site. The separate `osm.fotoshi.com` iD fork already supports OSM sign-in for edits inside iD, but its upstream/embedded OAuth client ID is not proof that `labs.fotoshi.com` is an approved callback. Register a **separate OSM OAuth2 app**, preferably under a company-controlled OSM account, with `https://labs.fotoshi.com/fotoshi2osm/oauth/callback` (and later production `osm.fotoshi.com/reviewer` if migrated), request `write_api` and use authorization code + PKCE. Authenticate to OSM **independently** of Fotoshi/Cognito. Secure token storage, conflict/version checks, user-confirmed diffs and actual changeset submission must be implemented before enabling writes. Until then, the visible iD link sends users to OpenStreetMap's own editor for authorization and submission.

The existing Place Intelligence endpoint `/internal/place-intelligence` contains evidence-linked model predictions, confidence and claims, but is **private and secret-token protected**. Do not expose the internal token or the raw endpoint to clients. Provide a new deliberately scoped backend projection of only approved, photo-evidenced attributes for relevant review missions before surfacing model hints. Do not treat a photo-derived candidate as confirmed fact.

A real mission engine, category-to-OSM-tag comparison validation, nearby-duplicate detection, OSM OAuth, changeset tracking and completion telemetry are still future work. This prototype is intentionally not yet announced as a capable OSM editor.

## Build and deploy

`index.html` is an intentionally small, dependency-light page. `worker.js` uses compile-time placeholders `__HTML__` and `__LOGO_SVG__`, replaced with JSON-encoded copies of `index.html` and the official outlined Sifonn Pro `logo.svg`. Do **not** distribute the Sifonn font binaries. The SVG outlines are supplied by Fotoshi's existing brand repository.

Example build from this directory:

```js
import {readFileSync,writeFileSync} from "node:fs";
const html = readFileSync("index.html", "utf8");
const logo = readFileSync("logo.svg", "utf8");
const template = readFileSync("worker.js", "utf8");
writeFileSync("worker-built.js", template
  .replace("const HTML = __HTML__;", "const HTML = " + JSON.stringify(html) + ";")
  .replace("const LOGO_SVG = __LOGO_SVG__;", "const LOGO_SVG = " + JSON.stringify(logo) + ";"));
```

Upload the built module Worker as `fotoshi2osm-labs`, with one D1 binding `REVIEW_DB` pointing at the isolated `fotoshi2osm-review-events` database. Apply `schema.sql` to that database. Route **only** `labs.fotoshi.com/fotoshi2osm*` to the Worker, leaving the rest of Labs unchanged. The prototype's CSP allows MapLibre's blob worker plus the two approved map hosts.

## Licence and provenance

Copyright 2026 Fotoshi contributors. Offered under GNU **AGPL-3.0-or-later**, full text [LICENSE.txt](LICENSE.txt); modified 10 November 2026. Inspired by Pic4Review, copyright 2017–2020 Adrien Pavie, who credits Christopher Beddow as a contributor. Upstream source: https://framagit.org/Pic4Carto/Pic4Review .

OSM data © OpenStreetMap contributors (ODbL). Individual Fotoshi photographs retain their own licences and attribution. Sources of attributes must be reviewed before copying anything into OSM, particularly where they may originate in third-party datasets.
