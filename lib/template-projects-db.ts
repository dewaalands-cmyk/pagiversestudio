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
      status VARCHAR(30) DEFAULT 'submitted'
        CHECK (status IN ('draft', 'submitted', 'processing', 'revision', 'completed')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_template_projects_status ON template_projects(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_template_projects_created ON template_projects(created_at DESC)`;
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
