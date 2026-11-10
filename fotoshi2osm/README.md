# fotoshi2OSM (Pic4Review fork)

**Live prototype:** https://labs.fotoshi.com/fotoshi2osm

The live Labs page is **a fork of the original Pic4Review frontend by Adrien Pavie**, not an independently designed dashboard. The upstream React 15, Material UI, Leaflet and image-gallery review components are copied into [fork/](./fork/). The original question component, photo gallery and map are imported into [fork/src/app/fotoshi2osm.js](./fork/src/app/fotoshi2osm.js). The earlier standalone dashboard was removed.

## What it does now

- Displays an original Pic4Review-style compact review layout: 1/3 question and map, 2/3 photo and thumbnails; minimal controls.
- Fetches only publicly available Fotoshi places and photos using **https://api.fotoshi.com/v1/places**. No Mapillary/Panoramax/Flickr imagery fetchers are run or bundled in the application.
- Lets a mapper select OSM-unlinked, Fotoshi-origin, Overture-origin, or OSM-linked review queues. This is a live filtered queue, not yet a persistent Pic4Review mission backend.
- Uses original upstream Leaflet review map with highly visible Fotoshi orange map pins and a user-selectable OSM raster or Esri World Imagery satellite layer. Both must have visible attribution. Respect OSM tile usage policy; migrate to dedicated basemap at scale. Esri imagery permission for OSM editing must be respected.
- Prompts the user to confirm evidence. Actual editing opens the official OSM iD editor in a separate tab, where OSM owns login and changeset submission. **No direct OSM write, OAuth callback, or bulk import** is implemented in Labs yet.
- Shows Fotoshi photographer and photograph date above the image.
- Includes opt-in-only, anonymous choices in Cloudflare EU D1. The `candidate_add`/`candidate_update` event is explicitly a user-supplied **intent**, not a real OSM edit, verified change or changeset. Schema: [schema.sql](./schema.sql).

## Deployment

- GitHub: `atlascove/atlascove.github.io`, branch `feature/fotoshi2osm-labs`, directory `fotoshi2osm/fork/`.
- Cloudflare Pages project `fotoshi2osm-pic4review`, builds with `npm run build:js` (legacy Webpack/Babel; `.npmrc` intentionally enables legacy-peer-deps).
- Existing Labs Cloudflare Worker `fotoshi2osm-labs` proxies `https://fotoshi2osm-pic4review.pages.dev` to `labs.fotoshi.com/fotoshi2osm`, preserving read-only OSM and opt-in telemetry endpoints.
- Does not change the existing Labs homepage or other production Foto/OSM services.

## Typography and logo

The application uses **Noto Sans** for ordinary UI text and a standalone official orange Fotoshi logomark beside a **single contiguous, fully outlined Sifonn Pro `fotoshi2OSM` wordmark**. The entire wordmark uses the same licensed Pro typeface: `fotoshi` in Fotoshi orange `#F24E1E`, `2` in yellow `#FECA57`, `OSM` in green `#0E8345`. The favicon is the official orange logomark on a solid white background. The vector artwork was generated from the privately licensed original font; **no font binary is committed, distributed or served**.

## Source and licences

Pic4Review by **Adrien Pavie**, copyright 2017–2020. Source: [framagit.org/Pic4Carto/Pic4Review](https://framagit.org/Pic4Carto/Pic4Review), public mirror: [dnet/Pic4Review-Frontend](https://github.com/dnet/Pic4Review-Frontend).

The fork is offered under **GNU AGPL-3.0-or-later** with [full licence text](./LICENSE.txt). Original upstream code retained in the fork and changes made 10 November 2026. Image copyright and licensing remain with each contributor; OpenStreetMap data remain ODbL.
