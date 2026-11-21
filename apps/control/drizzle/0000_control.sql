CREATE TABLE tasks (
  id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL CHECK (priority IN ('normal','high','critical')),
  owner TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('queued','active','review','done','blocked')),
  version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL, operation_id TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE config_versions (
  id TEXT PRIMARY KEY NOT NULL, revision INTEGER UNIQUE NOT NULL, title TEXT NOT NULL, notes TEXT NOT NULL,
  config_json TEXT NOT NULL, status TEXT NOT NULL CHECK (status = 'draft'), created_at TEXT NOT NULL,
  created_by TEXT NOT NULL, author_email TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE audit_events (
  id TEXT PRIMARY KEY NOT NULL, actor_id TEXT NOT NULL, actor_email TEXT NOT NULL, action TEXT NOT NULL,
  subject_id TEXT NOT NULL, summary TEXT NOT NULL, created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE mutation_receipts (
  id TEXT PRIMARY KEY NOT NULL, actor_id TEXT NOT NULL, request_hash TEXT NOT NULL, response_json TEXT NOT NULL, created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX task_status_idx ON tasks (status, created_at);
--> statement-breakpoint
CREATE INDEX audit_time_idx ON audit_events (created_at);
