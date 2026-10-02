import { access, cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const coreRoot = path.resolve(scriptDirectory, "..");
const sourceRoot = path.resolve(process.env.PAGIVERSE_TEMPLATE_REPO || path.join(coreRoot, "..", "pagiverse-template"));
const publicRoot = path.resolve(coreRoot, "public", "template-library");
const stagingRoot = path.resolve(coreRoot, "public", `.template-library-staging-${process.pid}`);
const catalogPath = path.resolve(coreRoot, "lib", "template-catalog.generated.json");
const requiredFiles = ["index.html", "style.css", "script.js", "template.json", "thumbnail.webp"];

function safeRelativePath(value, label) {
  if (typeof value !== "string" || !value || path.isAbsolute(value)) throw new Error(`${label}: invalid path`);
  const normalized = path.normalize(value);
  if (normalized === ".." || normalized.startsWith(`..${path.sep}`)) throw new Error(`${label}: path escapes template directory`);
  return normalized;
}

function assertGeneratedTarget(target) {
  const expectedParent = path.resolve(coreRoot, "public");
  if (!target.startsWith(`${expectedParent}${path.sep}`)) {
    throw new Error(`Refusing to modify path outside Core public directory: ${target}`);
  }
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function findTemplateDirectories() {
  if (await exists(path.join(sourceRoot, "template.json"))) return [sourceRoot];

  const templatesRoot = path.join(sourceRoot, "templates");
  if (!(await exists(templatesRoot))) {
    throw new Error(`No template.json or templates directory found in ${sourceRoot}`);
  }

  const entries = await readdir(templatesRoot, { withFileTypes: true });
  const directories = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(templatesRoot, entry.name);
    if (await exists(path.join(directory, "template.json"))) directories.push(directory);
  }
  return directories;
}

async function validateTemplate(directory, manifest, knownIds) {
  for (const file of requiredFiles) {
    if (!(await exists(path.join(directory, file)))) throw new Error(`${manifest.id || directory}: missing ${file}`);
  }
  if (manifest.pagiverseStandard !== 1) throw new Error(`${manifest.id}: pagiverseStandard must be 1`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.id || "")) throw new Error(`${manifest.id}: invalid template id`);
  if (knownIds.has(manifest.id)) throw new Error(`${manifest.id}: duplicate template id`);
  if (!manifest.name || !manifest.category || !manifest.description || !manifest.entry || !manifest.thumbnail) {
    throw new Error(`${manifest.id}: required metadata is incomplete`);
  }
  safeRelativePath(manifest.entry, `${manifest.id}: entry`);
  safeRelativePath(manifest.thumbnail, `${manifest.id}: thumbnail`);
  if (!manifest.fields || typeof manifest.fields !== "object" || Array.isArray(manifest.fields)) {
    throw new Error(`${manifest.id}: fields must be an object`);
  }
  if (!Array.isArray(manifest.sections) || !Array.isArray(manifest.pages)) {
    throw new Error(`${manifest.id}: pages and sections must be arrays`);
  }
  for (const page of manifest.pages) {
    const pageEntry = safeRelativePath(page.entry, `${manifest.id}: page entry`);
    if (!(await exists(path.join(directory, pageEntry)))) {
      throw new Error(`${manifest.id}: missing page entry ${page.entry || "(empty)"}`);
    }
  }
  knownIds.add(manifest.id);
}

async function copyRuntimeFiles(source, destination, manifest) {
  await mkdir(destination, { recursive: true });
  const files = new Set([
    "template.json",
    "style.css",
    "script.js",
    safeRelativePath(manifest.entry, `${manifest.id}: entry`),
    safeRelativePath(manifest.thumbnail, `${manifest.id}: thumbnail`),
    ...manifest.pages.map((page) => safeRelativePath(page.entry, `${manifest.id}: page entry`)),
  ]);
  if (await exists(path.join(source, "favicon.svg"))) files.add("favicon.svg");

  for (const file of files) {
    await cp(path.join(source, file), path.join(destination, file), { recursive: true });
  }
  if (await exists(path.join(source, "assets"))) {
    await cp(path.join(source, "assets"), path.join(destination, "assets"), { recursive: true });
  }
}

async function main() {
  const sourceStats = await stat(sourceRoot).catch(() => null);
  if (!sourceStats?.isDirectory()) throw new Error(`Template repository not found: ${sourceRoot}`);

  const directories = await findTemplateDirectories();
  if (!directories.length) throw new Error(`No templates found in ${sourceRoot}`);

  assertGeneratedTarget(publicRoot);
  assertGeneratedTarget(stagingRoot);
  await rm(stagingRoot, { recursive: true, force: true });
  await mkdir(stagingRoot, { recursive: true });

  const knownIds = new Set();
  const templates = [];
  for (const directory of directories) {
    const manifest = JSON.parse(await readFile(path.join(directory, "template.json"), "utf8"));
    await validateTemplate(directory, manifest, knownIds);
    await copyRuntimeFiles(directory, path.join(stagingRoot, manifest.id), manifest);
    templates.push({
      ...manifest,
      publicPath: `/template-library/${manifest.id}`,
    });
  }

  templates.sort((a, b) => a.name.localeCompare(b.name));
  await rm(publicRoot, { recursive: true, force: true });
  await rename(stagingRoot, publicRoot);
  await writeFile(catalogPath, `${JSON.stringify({ pagiverseStandard: 1, templates }, null, 2)}\n`, "utf8");
  console.log(`Synced ${templates.length} template(s) from ${sourceRoot}`);
}

main().catch(async (error) => {
  await rm(stagingRoot, { recursive: true, force: true }).catch(() => {});
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
