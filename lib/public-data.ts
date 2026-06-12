import sql from "@/lib/db";
import type { PortfolioItem, Testimony } from "@/types";

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    return (await sql`
      SELECT * FROM portfolio_items ORDER BY featured DESC, created_at DESC
    `) as unknown as PortfolioItem[];
  } catch {
    return [];
  }
}

export async function getApprovedTestimonies(): Promise<Testimony[]> {
  try {
    return (await sql`
      SELECT * FROM testimonies WHERE approved = true ORDER BY created_at DESC
    `) as unknown as Testimony[];
  } catch {
    return [];
  }
}

export async function getPublicClientNames(): Promise<string[]> {
  try {
    const rows = await sql`
      SELECT DISTINCT company_name FROM clients
      WHERE company_name IS NOT NULL AND company_name != ''
      ORDER BY company_name
    `;
    return rows.map((r) => r.company_name as string);
  } catch {
    return [];
  }
}
