-- Harshz Green Building Automation — Initial Schema
-- Apply via: Supabase dashboard → SQL Editor, or `supabase db push`
-- Project: imrgjnvvylrdjzsxthzg (ap-south-1)

-- ── Projects ────────────────────────────────────────────────────
-- Mirrors the localStorage 'projects' key; one row per user project.
CREATE TABLE IF NOT EXISTS projects (
  id         text        PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects: own rows only" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- ── Criterion States (V2019 / V2015 / IGBC) ─────────────────────
-- Stores attempt status + narrative for each criterion across all rating systems.
-- GRIHA V6 appraisal states remain in localStorage under appraisals_v6 for now.
CREATE TABLE IF NOT EXISTS criterion_states (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id     text        NOT NULL,
  rating         text        NOT NULL CHECK (rating IN ('griha-v6', 'griha-v2019', 'griha-v2015', 'igbc-sb-2020')),
  criterion_code text        NOT NULL,
  status         text        CHECK (status IN ('attempting', 'non-attempting', 'later', 'exempted')),
  narrative_html text,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, project_id, rating, criterion_code)
);

ALTER TABLE criterion_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "criterion_states: own rows only" ON criterion_states
  FOR ALL USING (auth.uid() = user_id);

-- ── Appraisal Files ──────────────────────────────────────────────
-- Metadata for files stored in Supabase Storage bucket 'harshz-files'.
CREATE TABLE IF NOT EXISTS appraisal_files (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      text        NOT NULL,
  rating          text        NOT NULL CHECK (rating IN ('griha-v6', 'griha-v2019', 'griha-v2015', 'igbc-sb-2020')),
  criterion_code  text        NOT NULL,
  file_type       text        NOT NULL CHECK (file_type IN ('document', 'photograph', 'product')),
  name            text        NOT NULL,
  storage_path    text        NOT NULL,   -- path inside the 'harshz-files' bucket
  mime_type       text,
  size_bytes      bigint,
  -- Product-specific
  specifications  text,
  document_link   text,
  photograph_link text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE appraisal_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appraisal_files: own rows only" ON appraisal_files
  FOR ALL USING (auth.uid() = user_id);

-- ── Storage Bucket ───────────────────────────────────────────────
-- Run this in the Supabase dashboard → Storage → New bucket,
-- OR uncomment the line below if storage extension is available:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('harshz-files', 'harshz-files', false)
--   ON CONFLICT (id) DO NOTHING;

-- Storage RLS — uncomment once the bucket is created:
-- CREATE POLICY "storage: upload own files" ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'harshz-files' AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "storage: read own files" ON storage.objects FOR SELECT TO authenticated
--   USING (bucket_id = 'harshz-files' AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "storage: delete own files" ON storage.objects FOR DELETE TO authenticated
--   USING (bucket_id = 'harshz-files' AND (storage.foldername(name))[1] = auth.uid()::text);
