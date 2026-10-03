export const dynamic = "force-dynamic";

import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import sql from "@/lib/db";
import { getTemplateById } from "@/lib/template-library";
import { ensureTemplateProjectsTable } from "@/lib/template-projects-db";
import { pageForPath, renderTemplateProjectHtml } from "@/lib/template-project-artifacts";

export async function GET(request: NextRequest, { params }: { params: { projectCode: string; path?: string[] } }) {
  await ensureTemplateProjectsTable();
  const token = request.nextUrl.searchParams.get("token") || "";
  const digest = createHash("sha256").update(token).digest("hex");
  const project = (await sql`
    SELECT project_code, template_id, configuration FROM template_projects
    WHERE project_code = ${params.projectCode} AND preview_token_hash = ${digest}
      AND preview_expires_at > NOW() LIMIT 1
  `)[0];
  if (!project) return new Response("Preview tidak tersedia.", { status: 404 });
  const template = getTemplateById(project.template_id);
  if (!template) return new Response("Template tidak tersedia.", { status: 404 });
  const requestedPath = params.path?.length ? `/${params.path.join("/")}` : "/";
  const page = pageForPath(template, requestedPath);
  if (!page) return new Response("Halaman tidak ditemukan.", { status: 404 });
  const origin = request.nextUrl.origin;
  const base = `${origin}/preview/${encodeURIComponent(project.project_code)}`;
  const html = await renderTemplateProjectHtml({
    template, configuration: project.configuration, pageEntry: page.entry,
    assetBase: `${origin}${template.publicPath}/`,
    routeForPage: (item) => `${base}${item.path === "/" ? "" : item.path}?token=${encodeURIComponent(token)}`,
  });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
