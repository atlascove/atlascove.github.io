# Fotoshi2OSM — Pic4Review frontend fork

This is a working source fork of **Pic4Review** by **Adrien Pavie** (AGPL-3.0-or-later), using the upstream React, Material UI, Leaflet map and react-image-gallery review components. Source: https://framagit.org/Pic4Carto/Pic4Review (readable mirror https://github.com/dnet/Pic4Review-Frontend).

## Modifications from upstream

- New `src/app/fotoshi2osm.js` entry mounts the upstream review Gallery, Question and Map components without the external Pic4Review PostGIS mission server.
- Foto locations and photographic evidence from `GET https://api.fotoshi.com/v1/places` as the sole picture provider; Mapillary, Flickr, Panoramax and Kartaview are removed from the review gallery path.
- Linked OSM elements can be inspected through the existing bounded read-only `/fotoshi2osm/api/osm/...` service.
- Original compact gallery-first layout, orange Fotoshi map pins, OSM standard raster for low-volume OSM editing and Esri aerial from the OSM Editor Layer Index, with required attribution. Review OSM Tile Usage Policy and migrate to dedicated basemap tiles if traffic increases.
- The review decision, photo evidence and manual iD editor link are intentionally separate. There is no automated OSM editing or bulk import.
- English locale, Noto Sans body type, official Fotoshi logo mark. A single contiguous `fotoshi2OSM` wordmark uses the site's font fallback pending verified complete Sifonn Pro outlined lettering; no licensed font files are redistributed.

## Limitations

This is an experimental prototype. It does **not** yet create OSM OAuth2 tokens or submit changesets within the application. The `Edit` button navigates to the OSM iD editor, where users sign in with OpenStreetMap. The selection and source data are photo evidence for human validation, not proof that an OSM item is missing. Actual user telemetry is opt-in.

## Deployment

Cloudflare Pages project `fotoshi2osm-pic4review` builds `fotoshi2osm/fork` using `npm run build:js` and outputs `build/`; once verified, the `labs.fotoshi.com/fotoshi2osm*` Worker may proxy the build. Keep the previous Labs app until the source fork is verified.

Keep the AGPL licence and the credit to Adrien Pavie visible.
