export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import sql from "@/lib/db";
import { getTemplateById } from "@/lib/template-library";
import { ensureTemplateProjectsTable } from "@/lib/template-projects-db";
import { pageForPath, renderTemplateProjectHtml } from "@/lib/template-project-artifacts";

export async function GET(request: NextRequest, { params }: { params: { slug: string; path?: string[] } }) {
  await ensureTemplateProjectsTable();
  const project = (await sql`
    SELECT template_id, published_configuration FROM template_projects
    WHERE LOWER(slug) = LOWER(${params.slug}) AND published_at IS NOT NULL LIMIT 1
  `)[0];
  if (!project) return new Response("Website tidak ditemukan.", { status: 404 });
  const template = getTemplateById(project.template_id);
  if (!template) return new Response("Template tidak tersedia.", { status: 404 });
  const requestedPath = params.path?.length ? `/${params.path.join("/")}` : "/";
  const page = pageForPath(template, requestedPath);
  if (!page) return new Response("Halaman tidak ditemukan.", { status: 404 });
  const origin = request.nextUrl.origin;
  const base = `${origin}/sites/${encodeURIComponent(params.slug)}`;
  const html = await renderTemplateProjectHtml({
    template, configuration: project.published_configuration, pageEntry: page.entry,
    assetBase: `${origin}${template.publicPath}/`,
    routeForPage: (item) => `${base}${item.path === "/" ? "" : item.path}`,
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } });
}
