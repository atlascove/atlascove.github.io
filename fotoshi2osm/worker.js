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
const LOGO_SVG = __LOGO_SVG__;
const ROOT = "/fotoshi2osm";
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "x-content-type-options": "nosniff", "access-control-allow-origin": "https://labs.fotoshi.com" };
function json(value, status, headers) {
  return new Response(JSON.stringify(value), { status: status || 200, headers: { ...JSON_HEADERS, "cache-control": "no-store", ...(headers || {}) } });
}
export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    const path = u.pathname.replace(/\/+$/, "") || "/";
    if (path === ROOT + "/api/events") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
      if (request.headers.get("Origin") !== u.origin) return json({ error: "Same-origin only" }, 403);
      if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) return json({ error: "JSON expected" }, 415);
      if (Number(request.headers.get("content-length") || "0") > 2048) return json({ error: "Too large" }, 413);
      let data;
      try {
        const body = await request.text();
        if (body.length > 2048) return json({ error: "Too large" }, 413);
        data = JSON.parse(body);
      } catch (_) { return json({ error: "Invalid JSON" }, 400); }
      const actions = new Set(["skip", "reviewed_locally", "open_editor", "candidate_add", "candidate_update"]);
      const queues = new Set(["all", "unlinked", "fotoshi", "overture", "linked"]);
      const fid = data && typeof data.fid === "string" ? data.fid : "";
      const osm = data && typeof data.osm === "string" ? data.osm : null;
      const origin = data && typeof data.origin === "string" ? data.origin : "unknown";
      const sid = data && typeof data.session === "string" ? data.session : "";
      if (!/^[a-zA-Z0-9_-]{1,80}$/.test(fid) ||
          !actions.has(data?.action) || !queues.has(data?.queue) ||
          (osm && !/^[nwr][1-9][0-9]{0,14}$/.test(osm)) ||
          !/^[a-zA-Z0-9_-]{0,64}$/.test(origin) ||
          !/^[a-zA-Z0-9_-]{1,80}$/.test(sid)) {
        return json({ error: "Invalid review event" }, 400);
      }
      if (!env.REVIEW_DB) return json({ error: "Review telemetry not configured" }, 503);
      try {
        await env.REVIEW_DB.prepare(
          "INSERT INTO review_events (id, fid, osm_ref, action, queue_filter, source_type, source_origin, anonymous_session) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(crypto.randomUUID(), fid, osm, data.action, data.queue, osm ? "linked" : "unlinked", origin, sid).run();
        return json({ recorded: true }, 201);
      } catch (_) {
        return json({ error: "Could not record review event" }, 503);
      }
    }
    if (request.method !== "GET" && request.method !== "HEAD") return json({ error: "Method not allowed" }, 405);
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
          "content-security-policy": "default-src 'self'; connect-src 'self' https://api.fotoshi.com https://tiles.fotoshi.com https://cdn.fotoshi.com https://*.fotoshi.com https://*.openfreemap.org https://unpkg.com; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; worker-src 'self' blob:; font-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
        }
      });
    }
    if (path === ROOT + "/logo.svg") return new Response(request.method === "HEAD" ? null : LOGO_SVG, { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=300", "x-content-type-options": "nosniff" } });
    if (path === ROOT + "/health") return json({ service: "Fotoshi2OSM", status: "ok", mode: "read-only preview", writesToOSM: false });
    if (path === ROOT + "/source") return Response.redirect("https://github.com/atlascove/atlascove.github.io/tree/feature/fotoshi2osm-labs/fotoshi2osm", 302);
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