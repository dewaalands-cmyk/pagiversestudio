import sql from "@/lib/db";

let initialization: Promise<void> | null = null;

async function initializeTemplateProjectsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS template_projects (
      id SERIAL PRIMARY KEY,
      project_code VARCHAR(24) UNIQUE NOT NULL,
      template_id VARCHAR(120) NOT NULL,
      template_name VARCHAR(255) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      business_name VARCHAR(255) NOT NULL,
      whatsapp VARCHAR(30) NOT NULL,
      email VARCHAR(255) NOT NULL,
      notes TEXT,
      configuration JSONB NOT NULL,
      submitted_configuration JSONB,
      published_configuration JSONB,
      preview_token_hash CHAR(64),
      preview_expires_at TIMESTAMPTZ,
      slug VARCHAR(80),
      published_at TIMESTAMPTZ,
      revision INTEGER NOT NULL DEFAULT 1,
      status VARCHAR(30) DEFAULT 'submitted'
        CHECK (status IN ('draft', 'submitted', 'processing', 'revision', 'completed')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE template_projects ADD COLUMN IF NOT EXISTS submitted_configuration JSONB`;
  await sql`ALTER TABLE template_projects ADD COLUMN IF NOT EXISTS published_configuration JSONB`;
  await sql`ALTER TABLE template_projects ADD COLUMN IF NOT EXISTS preview_token_hash CHAR(64)`;
  await sql`ALTER TABLE template_projects ADD COLUMN IF NOT EXISTS preview_expires_at TIMESTAMPTZ`;
  await sql`ALTER TABLE template_projects ADD COLUMN IF NOT EXISTS slug VARCHAR(80)`;
  await sql`ALTER TABLE template_projects ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ`;
  await sql`ALTER TABLE template_projects ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1`;
  await sql`UPDATE template_projects SET submitted_configuration = configuration WHERE submitted_configuration IS NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_template_projects_status ON template_projects(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_template_projects_created ON template_projects(created_at DESC)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_template_projects_slug ON template_projects(LOWER(slug)) WHERE slug IS NOT NULL`;
}

export async function ensureTemplateProjectsTable() {
  if (!initialization) {
    initialization = initializeTemplateProjectsTable().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  await initialization;
}
