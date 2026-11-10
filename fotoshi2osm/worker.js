/**
 * Fotoshi2OSM Labs, a photo-driven, human-verified OSM review experiment.
 * Copyright (C) 2026 Fotoshi contributors.
 * Inspired by Pic4Review (C) 2017-2020 Adrien Pavie.
 * Modified and reimplemented for Fotoshi on 2026-11-10.
 * Licensed under AGPL-3.0-or-later. See LICENSE.txt.
 *
 * BUILD: replace the literal __HTML__ token below with JSON.stringify
 * of index.html, then upload this as a Cloudflare module Worker.
 */
const HTML = __HTML__;
const ROOT = "/fotoshi2osm";
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "x-content-type-options": "nosniff", "access-control-allow-origin": "https://labs.fotoshi.com" };
function json(value, status, headers) {
  return new Response(JSON.stringify(value), { status: status || 200, headers: { ...JSON_HEADERS, "cache-control": "no-store", ...(headers || {}) } });
}
export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") return json({ error: "Method not allowed" }, 405);
    const u = new URL(request.url);
    const path = u.pathname.replace(/\/+$/, "") || "/";
    if (path === ROOT) {
      return new Response(request.method === "HEAD" ? null : HTML, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
          "x-frame-options": "DENY",
          "referrer-policy": "strict-origin-when-cross-origin",
          "x-robots-tag": "noindex, nofollow",
          "permissions-policy": "camera=(), microphone=(), geolocation=()",
          "content-security-policy": "default-src 'self'; connect-src 'self' https://api.fotoshi.com https://tiles.fotoshi.com https://cdn.fotoshi.com https://*.fotoshi.com; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; font-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
        }
      });
    }
    if (path === ROOT + "/health") return json({ service: "Fotoshi2OSM", status: "ok", mode: "read-only preview", writesToOSM: false });
    if (path === ROOT + "/source") return Response.redirect("https://github.com/atlascove/atlascove.github.io/tree/feature/fotoshi2osm-labs/fotoshi2osm", 302);
    if (path === ROOT + "/api/places") {
      const input = (u.searchParams.get("bbox") || "").split(",").map(Number);
      if (input.length !== 4 || !input.every(Number.isFinite)) return json({ error: "bbox must contain four valid coordinates" }, 400);
      const [west, south, east, north] = input;
      if (west < -180 || east > 180 || south < -90 || north > 90 || east <= west || north <= south || east - west > 0.23 || north - south > 0.23) {
        return json({ error: "Please zoom in and choose a valid bounding box smaller than 0.23 degrees per side." }, 400);
      }
      const limit = Number(u.searchParams.get("limit") || "60");
      if (!Number.isInteger(limit) || limit < 1 || limit > 70) return json({ error: "limit must be 1–70" }, 400);
      const upstream = new URL("https://api.fotoshi.com/v1/places");
      upstream.searchParams.set("bbox", input.map(x => x.toFixed(6)).join(","));
      upstream.searchParams.set("limit", String(limit));
      upstream.searchParams.set("urls", "true");
      try {
        const response = await fetch(upstream, {
          headers: { accept: "application/json" },
          cf: { cacheTtl: 90, cacheEverything: true }
        });
        const body = await response.text();
        if (body.length > 6_000_000) return json({ error: "Fotoshi returned too much data for this preview" }, 502);
        const status = response.status;
        if (!response.ok) return json({ error: "Fotoshi API returned HTTP " + status }, status >= 400 && status < 600 ? status : 502);
        if (!/json/i.test(response.headers.get("content-type") || "")) return json({ error: "Unexpected Fotoshi response" }, 502);
        return new Response(body, { status: 200, headers: { ...JSON_HEADERS, "cache-control": "public, max-age=60", "x-robots-tag": "noindex" } });
      } catch (error) {
        return json({ error: "Fotoshi API temporarily unavailable" }, 502);
      }
    }
    const osmMatch = path.match(/^\/fotoshi2osm\/api\/osm\/([nwr])([1-9][0-9]{0,14})$/);
    if (osmMatch) {
      const type = { n: "node", w: "way", r: "relation" }[osmMatch[1]];
      const endpoint = "https://api.openstreetmap.org/api/0.6/" + type + "/" + osmMatch[2] + ".json";
      try {
        const response = await fetch(endpoint, { headers: { accept: "application/json", "user-agent": "Fotoshi2OSM/0.1 (https://fotoshi.com)" }, cf: { cacheTtl: 60, cacheEverything: true } });
        if (!response.ok) return json({ error: "OSM object unavailable (" + response.status + ")" }, response.status === 404 ? 404 : 502);
        const payload = await response.json();
        const element = Array.isArray(payload.elements) && payload.elements[0];
        if (!element) return json({ error: "OSM returned no matching element" }, 404);
        return json({ id: element.id, type: element.type, version: element.version, tags: element.tags || {} }, 200, { "cache-control": "public, max-age=30" });
      } catch (error) {
        return json({ error: "OpenStreetMap API temporarily unavailable" }, 502);
      }
    }
    return json({ error: "Not found" }, 404);
  }
};