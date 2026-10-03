import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { strToU8, zipSync } from "fflate";

const templateRoot = path.join(process.cwd(), "public", "template-library");
const MAX_FILES = 500;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;

function safeSegment(value: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(value)) throw new Error("Invalid template identifier");
  return value;
}

function safeEntry(value: string) {
  const normalized = path.posix.normalize(String(value || ""));
  if (!normalized || normalized.startsWith("../") || path.posix.isAbsolute(normalized)) throw new Error("Invalid template entry");
  return normalized;
}

function serializeForScript(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function replaceSeo(html: string, configuration: Record<string, unknown>) {
  const title = typeof configuration["seo.title"] === "string" ? configuration["seo.title"] : "";
  const description = typeof configuration["seo.description"] === "string" ? configuration["seo.description"] : "";
  let result = html;
  if (title) result = result.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttribute(title)}</title>`);
  if (description) {
    result = result.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeAttribute(description)}">`);
  }
  return result;
}

export function pageForPath(template: any, requestedPath: string) {
  const normalized = requestedPath === "/" ? "/" : `/${requestedPath.replace(/^\/+|\/+$/g, "")}`;
  return (template.pages || []).find((page: any) => page.path === normalized) || (normalized === "/" ? { entry: template.entry, path: "/" } : null);
}

export async function renderTemplateProjectHtml(options: {
  template: any;
  configuration: Record<string, unknown>;
  pageEntry: string;
  assetBase: string;
  routeForPage: (page: any) => string;
}) {
  const directory = path.join(templateRoot, safeSegment(options.template.id));
  const entry = safeEntry(options.pageEntry);
  let html = await readFile(path.join(directory, ...entry.split("/")), "utf8");
  html = replaceSeo(html, options.configuration);

  for (const page of options.template.pages || []) {
    const pageEntry = safeEntry(page.entry);
    const escaped = pageEntry.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp(`href=(["'])(?:\\./)?${escaped}\\1`, "gi"), `href="${escapeAttribute(options.routeForPage(page))}"`);
  }

  const bootstrap = `<base href="${escapeAttribute(options.assetBase)}"><script>window.PAGIVERSE_DATA=${serializeForScript(options.configuration)};<\/script>`;
  return html.replace(/<head([^>]*)>/i, `<head$1>${bootstrap}`);
}

async function collectFiles(directory: string, relative = "", result: Record<string, Uint8Array> = {}, size = { bytes: 0, count: 0 }) {
  const entries = await readdir(path.join(directory, relative), { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isSymbolicLink()) throw new Error("Template symlinks are not allowed");
    const next = path.posix.join(relative.replace(/\\/g, "/"), entry.name);
    if (entry.isDirectory()) {
      await collectFiles(directory, next, result, size);
      continue;
    }
    if (!entry.isFile()) continue;
    size.count += 1;
    if (size.count > MAX_FILES) throw new Error("Template contains too many files");
    const bytes = new Uint8Array(await readFile(path.join(directory, ...next.split("/"))));
    size.bytes += bytes.byteLength;
    if (size.bytes > MAX_TOTAL_BYTES) throw new Error("Template package is too large");
    result[next] = bytes;
  }
  return result;
}

export async function buildTemplateProjectZip(template: any, configuration: Record<string, unknown>, projectCode: string) {
  const directory = path.join(templateRoot, safeSegment(template.id));
  const files = await collectFiles(directory);
  files["pagiverse-data.js"] = strToU8(`window.PAGIVERSE_DATA=${serializeForScript(configuration)};\n`);

  for (const page of template.pages || [{ entry: template.entry }]) {
    const entry = safeEntry(page.entry);
    const source = files[entry];
    if (!source) throw new Error(`Missing template page: ${entry}`);
    let html = new TextDecoder().decode(source);
    html = replaceSeo(html, configuration);
    html = html.replace(/<head([^>]*)>/i, `<head$1><script src="pagiverse-data.js"><\/script>`);
    files[entry] = strToU8(html);
  }

  const artifactHash = createHash("sha256").update(serializeForScript(configuration)).digest("hex");
  files["site.json"] = strToU8(`${JSON.stringify({ projectCode, templateId: template.id, revision: artifactHash.slice(0, 16) }, null, 2)}\n`);
  files["README.txt"] = strToU8("Paket website Pagiverse. Jalankan melalui static web server agar semua fitur template bekerja.\n");
  return zipSync(files, { level: 6 });
}
