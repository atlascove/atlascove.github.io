-- Fotoshi2OSM Labs-only consented review-event telemetry.
-- These events describe review intent, not OSM changeset creation.
-- No IP address, Fotoshi account ID, OSM username, or full photo URL is stored.
-- Database: fotoshi2osm-review-events (Cloudflare D1, EU jurisdiction).
CREATE TABLE IF NOT EXISTS review_events (
  id TEXT PRIMARY KEY NOT NULL,
  at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fid TEXT NOT NULL,
  osm_ref TEXT,
  action TEXT NOT NULL CHECK(action IN
    ('skip','reviewed_locally','open_editor','candidate_add','candidate_update')),
  queue_filter TEXT NOT NULL,
  source_type TEXT,
  source_origin TEXT,
  anonymous_session TEXT
);
CREATE INDEX IF NOT EXISTS idx_review_events_fid ON review_events(fid, at);
CREATE INDEX IF NOT EXISTS idx_review_events_at ON review_events(at);
