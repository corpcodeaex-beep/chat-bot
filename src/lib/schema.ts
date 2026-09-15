// Database tables. Applied automatically the first time the app talks to the
// database (every statement is safe to run again).

export const SCHEMA: string[] = [
  `CREATE EXTENSION IF NOT EXISTS vector`,

  `CREATE TABLE IF NOT EXISTS bots (
    id text PRIMARY KEY,
    name text NOT NULL,
    business_name text NOT NULL,
    template text NOT NULL,
    color text NOT NULL,
    welcome text NOT NULL,
    instructions text NOT NULL,
    knowledge text NOT NULL,
    skills jsonb NOT NULL,
    language text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS conversations (
    id text PRIMARY KEY,
    bot_id text NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    messages jsonb NOT NULL DEFAULT '[]',
    needs_human boolean NOT NULL DEFAULT false,
    page_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS conversations_bot_idx ON conversations (bot_id, updated_at DESC)`,

  `CREATE TABLE IF NOT EXISTS leads (
    id text PRIMARY KEY,
    bot_id text NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    conversation_id text NOT NULL UNIQUE REFERENCES conversations(id) ON DELETE CASCADE,
    name text,
    phone text,
    email text,
    need text,
    time text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS leads_bot_idx ON leads (bot_id, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS knowledge_sources (
    id text PRIMARY KEY,
    bot_id text NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    type text NOT NULL,
    name text NOT NULL,
    url text,
    pages integer,
    chars integer NOT NULL,
    chunk_count integer NOT NULL,
    embedded boolean NOT NULL DEFAULT false,
    warning text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS knowledge_sources_bot_idx ON knowledge_sources (bot_id, created_at)`,

  `CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id text PRIMARY KEY,
    source_id text NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    bot_id text NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    heading text,
    text text NOT NULL,
    search_tsv tsvector NOT NULL,
    embedding vector(768)
  )`,
  `CREATE INDEX IF NOT EXISTS knowledge_chunks_bot_idx ON knowledge_chunks (bot_id)`,
  `CREATE INDEX IF NOT EXISTS knowledge_chunks_source_idx ON knowledge_chunks (source_id)`,
  `CREATE INDEX IF NOT EXISTS knowledge_chunks_tsv_idx ON knowledge_chunks USING gin (search_tsv)`,

  // ---- Clients, plans and usage ----
  `CREATE TABLE IF NOT EXISTS clients (
    id text PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    session_version integer NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE clients ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'`,
  // Billing is per company: all of a company's bots share its plan, trial and reply limit.
  `ALTER TABLE clients ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'standard'`,
  `ALTER TABLE clients ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz`,
  `ALTER TABLE clients ADD COLUMN IF NOT EXISTS message_limit integer`,
  `ALTER TABLE bots ADD COLUMN IF NOT EXISTS client_id text REFERENCES clients(id) ON DELETE SET NULL`,
  `ALTER TABLE bots ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'standard'`,
  `ALTER TABLE bots ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'`,
  `ALTER TABLE bots ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz`,
  `ALTER TABLE bots ADD COLUMN IF NOT EXISTS message_limit integer`,
  `CREATE INDEX IF NOT EXISTS bots_client_idx ON bots (client_id)`,

  `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'web'`,
  `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS contact text`,

  `CREATE TABLE IF NOT EXISTS usage_monthly (
    bot_id text NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    month text NOT NULL,
    messages integer NOT NULL DEFAULT 0,
    blocked integer NOT NULL DEFAULT 0,
    input_tokens bigint NOT NULL DEFAULT 0,
    output_tokens bigint NOT NULL DEFAULT 0,
    PRIMARY KEY (bot_id, month)
  )`,

  // ---- Company password resets (only a hash of the emailed token is stored) ----
  `CREATE TABLE IF NOT EXISTS password_resets (
    token_hash text PRIMARY KEY,
    client_id text NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    email_sent boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS password_resets_client_idx ON password_resets (client_id, created_at DESC)`,

  // ---- AI provider failures (shown to the admin) ----
  `CREATE TABLE IF NOT EXISTS ai_failures (
    id bigserial PRIMARY KEY,
    provider text NOT NULL,
    message text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS ai_failures_created_idx ON ai_failures (created_at DESC)`,

  // ---- WhatsApp ----
  `CREATE TABLE IF NOT EXISTS whatsapp_accounts (
    bot_id text PRIMARY KEY REFERENCES bots(id) ON DELETE CASCADE,
    phone_number_id text NOT NULL UNIQUE,
    display_phone text,
    access_token text NOT NULL,
    enabled boolean NOT NULL DEFAULT true,
    last_message_at timestamptz,
    last_error text,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS whatsapp_events (
    message_id text PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
];
