// Record repository validator. Destined for the record repo at .github/scripts/validate.mjs.
//
// Responsibilities (SPEC.md 8, CLAUDE.md 9.4 and 9.5, VERSIONING.md 13 and 14):
//   1. Content and referential-integrity validation of changed decisions, and immutability of accepted ones.
//   2. Document version-bump validation against the true current base.
//   3. Differential approval enforcement (2 for decisions/documents/governed root files, 1 for
//      notes/library only), honoring an absence-override label for a single pull request.
// It reports a commit status "validate" on the pull request HEAD SHA that it actually validated:
//   success  = content valid, versions valid, required approvals met
//   pending  = content and versions valid, approvals not yet met; the job ALSO exits non-zero so the
//              Actions run fails while the gate is unsatisfied, not only the commit status
//   failure  = a content, referential, immutability, or version error, or a malformed override
//
// Fail closed: any unmet or failed state exits non-zero. The required gate is the "validate" commit status
// context (never this job's own Actions check run), and it always targets the checked-out HEAD SHA.

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import yaml from 'js-yaml';

const API = 'https://api.github.com';
const TOKEN = requireEnv('GH_TOKEN');
const REPO = requireEnv('REPO'); // owner/name
const PR_NUMBER = requireEnv('PR_NUMBER');
const BASE_REF = requireEnv('BASE_REF');
const HEAD_SHA = requireEnv('HEAD_SHA'); // the checked-out sha we validate and report on

const DECISION_SECTIONS = [
  'Decision', 'Context and problem', 'Decision drivers', 'Considered options', 'Decision outcome',
  'Invariants respected', 'Out of scope', 'Consequences', 'Verification or falsifier', 'Fallback',
  'References', 'Open questions',
];
const DECISION_STATUSES = ['accepted', 'superseded', 'rejected']; // 'proposed' is display-only, never stored
const SOURCE_TYPES = ['paper', 'article', 'video', 'dataset', 'idea'];
const SOURCE_WEIGHTS = ['load-bearing', 'consulted', 'background'];
const IMPACTS = ['major', 'minor', 'patch', 'editorial'];
// Approvals: two for the content the record asserts and for governed root files (VERSIONING.md 25.1).
const NEEDS_TWO_PREFIXES = ['decisions/', 'documents/', 'templates/', '.github/', '.oracle/'];
const NEEDS_TWO_FILES = ['VERSIONING.md', 'template.md'];
const NEEDS_ONE_PREFIXES = ['notes/', 'library/'];
// Default governance when no .oracle/governance.yml is present: the original 3-person contract (2 and 1),
// so a record repo without a governance file behaves exactly as before this file was governance-aware.
const DEFAULT_GOVERNANCE = { decisions_documents: 2, notes_library: 1, absence_override_label: 'absence-override' };
// Only these associations count as write-access members on this private repo (avoids a permission API call).
const WRITE_ASSOCIATIONS = ['OWNER', 'MEMBER', 'COLLABORATOR'];

function requireEnv(name) {
  const v = process.env[name];
  if (!v) { console.error(`missing env ${name}`); process.exit(2); }
  return v;
}

// ---- GitHub REST helpers -------------------------------------------------

function ghHeaders(json) {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'adr-validate',
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  };
}

async function apiJson(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method, headers: ghHeaders(!!body), body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function apiPaginate(path) {
  let url = `${API}${path}${path.includes('?') ? '&' : '?'}per_page=100`;
  const out = [];
  while (url) {
    const res = await fetch(url, { headers: ghHeaders(false) });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`GET ${url} -> ${res.status} ${text.slice(0, 300)}`);
    }
    const page = await res.json();
    if (Array.isArray(page)) out.push(...page);
    url = nextLink(res.headers.get('link'));
  }
  return out;
}

function nextLink(linkHeader) {
  if (!linkHeader) return null;
  for (const part of linkHeader.split(',')) {
    const m = part.match(/<([^>]+)>;\s*rel="next"/);
    if (m) return m[1];
  }
  return null;
}

async function setStatus(state, description) {
  try {
    await apiJson('POST', `/repos/${REPO}/statuses/${HEAD_SHA}`, {
      state, context: 'validate', description: description.slice(0, 140),
    });
  } catch (e) {
    console.error(`could not set commit status: ${e.message}`);
  }
}

// ---- git helpers ---------------------------------------------------------

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

// Changed files as { status, path, oldPath }. status is one of A M D R C. Uses the base branch tip
// (require-branches-up-to-date makes the merge-base equal to the base tip). quotePath off so paths are literal.
function changedFiles() {
  const raw = git(['-c', 'core.quotePath=false', 'diff', '--name-status', '-M', `origin/${BASE_REF}...HEAD`]);
  const files = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    const fields = line.split('\t');
    const letter = fields[0][0];
    if ((letter === 'R' || letter === 'C') && fields.length >= 3) {
      files.push({ status: letter, path: fields[2], oldPath: fields[1] });
    } else {
      files.push({ status: letter, path: fields[1], oldPath: null });
    }
  }
  return files;
}

function baseContent(path) {
  try { return git(['show', `origin/${BASE_REF}:${path}`]); } catch { return null; }
}
function headContent(path) { return readFileSync(path, 'utf8'); }
function listMd(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => `${dir}/${f}`);
}

// ---- parsing -------------------------------------------------------------

class ValidationError extends Error {}

function parseFrontmatter(content, path) {
  if (!content.startsWith('---')) throw new ValidationError(`${path}: missing frontmatter block`);
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) throw new ValidationError(`${path}: frontmatter block is not closed with ---`);
  let data;
  try { data = yaml.load(m[1]); } catch (e) { throw new ValidationError(`${path}: frontmatter is not valid YAML: ${e.message}`); }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError(`${path}: frontmatter must be a YAML mapping`);
  }
  return { data, body: content.slice(m[0].length) };
}

// ---- version helpers -----------------------------------------------------

const VERSION_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

function parseVersion(v, path) {
  if (typeof v !== 'string' || !VERSION_RE.test(v)) {
    throw new ValidationError(`${path}: version "${v}" must be four dot-separated integers without leading zeroes (quote it in YAML)`);
  }
  return v.split('.').map(Number);
}
function successor(base, impact) {
  const [M, m, p, e] = base;
  switch (impact) {
    case 'major': return [M + 1, 0, 0, 0];
    case 'minor': return [M, m + 1, 0, 0];
    case 'patch': return [M, m, p + 1, 0];
    case 'editorial': return [M, m, p, e + 1];
    default: return null;
  }
}
function eqVersion(a, b) { return a.length === 4 && b.length === 4 && a.every((x, i) => x === b[i]); }
function gtVersion(a, b) { for (let i = 0; i < 4; i++) { if (a[i] !== b[i]) return a[i] > b[i]; } return false; }
function movedSegment(base, head) { for (const i of IMPACTS) { if (eqVersion(successor(base, i), head)) return i; } return null; }

function impactFromBody(body) {
  // The "## Version impact" section holds ONLY a bare keyword. Return the first non-empty content line,
  // normalized, or null if the section is absent. A line carrying anything beyond the keyword will not
  // match the allowed set in validateDocument, which is the intended strictness.
  const m = body.match(/^##\s+Version impact\s*$/im);
  if (!m) return null;
  const after = body.slice(m.index + m[0].length);
  const stop = after.search(/^##\s+/m);
  const section = stop === -1 ? after : after.slice(0, stop);
  const line = section.split(/\r?\n/).map((s) => s.trim()).find((s) => s.length > 0);
  if (!line) return null;
  return line.replace(/[`*]/g, '').replace(/\.$/, '').trim().toLowerCase();
}

// ---- validation state ----------------------------------------------------

const errors = [];
function err(msg) { errors.push(msg); }

function decisionId(data, path) {
  const id = data.id;
  if (id === undefined || id === null) throw new ValidationError(`${path}: missing id`);
  if (typeof id !== 'string') throw new ValidationError(`${path}: id must be a quoted string like "0007" (an unquoted 0007 is read as the number 7)`);
  if (!/^\d{4,}$/.test(id)) throw new ValidationError(`${path}: id "${id}" must be zero-padded, at least four digits`);
  return id;
}

function indexDecisions() {
  const byId = new Map();
  const dupes = new Set();
  for (const path of listMd('decisions')) {
    let parsed;
    try { parsed = parseFrontmatter(headContent(path), path); } catch (e) { err(e.message); continue; }
    let id;
    try { id = decisionId(parsed.data, path); } catch (e) { err(e.message); continue; }
    if (byId.has(id)) dupes.add(id);
    byId.set(id, { path, data: parsed.data, body: parsed.body });
  }
  return { byId, dupes };
}

// Full-tree referential integrity: supersede consistency, relates_to, and source-link resolution.
function validateReferential(index, libraryFiles) {
  for (const dup of index.dupes) err(`duplicate decision id "${dup}" in the record`);
  for (const [id, entry] of index.byId) {
    const { path, data } = entry;
    const resolve = (val, field) => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'number') { err(`${path}: ${field} value ${val} must be a quoted id string like "0004"; an unquoted id loses its zero-padding`); return null; }
      const rid = String(val);
      if (!index.byId.has(rid)) { err(`${path}: ${field} points to "${rid}", not a decision in the record`); return null; }
      return rid;
    };
    const sup = resolve(data.supersedes, 'supersedes');
    const supBy = resolve(data.superseded_by, 'superseded_by');
    if (sup) {
      const t = index.byId.get(sup);
      if (String(t.data.superseded_by ?? '') !== id) err(`${path}: supersedes ${sup}, but ${sup}.superseded_by is not ${id} (must be consistent both ways)`);
      if (t.data.status !== 'superseded') err(`${path}: supersedes ${sup}, but ${sup}.status is not superseded`);
    }
    if (supBy) {
      const t = index.byId.get(supBy);
      if (String(t.data.supersedes ?? '') !== id) err(`${path}: superseded_by ${supBy}, but ${supBy}.supersedes is not ${id}`);
    }
    if (Array.isArray(data.relates_to)) for (const r of data.relates_to) resolve(r, 'relates_to');
    if (Array.isArray(data.sources)) {
      data.sources.forEach((src, i) => {
        if (src == null || typeof src !== 'object') { err(`${path}: sources[${i}] is not a mapping`); return; }
        if (typeof src.link === 'string') {
          if (!src.link.startsWith('library/') || !src.link.endsWith('.md')) err(`${path}: sources[${i}].link "${src.link}" must be library/<entry>.md`);
          else if (!libraryFiles.has(src.link)) err(`${path}: sources[${i}].link "${src.link}" does not resolve to a real library entry`);
        }
      });
    }
  }
}

// Per changed decision: field presence, enums, and body sections.
function validateDecisionShape(entry) {
  const { path, data, body } = entry;
  const need = ['id', 'title', 'status', 'origin', 'date', 'deciders', 'supersedes', 'superseded_by', 'relates_to', 'tags', 'sources'];
  for (const k of need) if (!(k in data)) err(`${path}: missing frontmatter field "${k}"`);
  if (data.status !== undefined && !DECISION_STATUSES.includes(data.status)) err(`${path}: status "${data.status}" is not one of ${DECISION_STATUSES.join(', ')} (proposed is display-only)`);
  if (data.origin !== undefined && !['live', 'imported'].includes(data.origin)) err(`${path}: origin "${data.origin}" must be live or imported`);
  for (const lf of ['deciders', 'relates_to', 'tags', 'sources']) {
    if (data[lf] !== undefined && data[lf] !== null && !Array.isArray(data[lf])) err(`${path}: ${lf} must be a YAML list`);
  }
  if (Array.isArray(data.sources)) {
    data.sources.forEach((src, i) => {
      if (src == null || typeof src !== 'object') return;
      for (const k of ['cite', 'link', 'type', 'bearing', 'weight']) if (!(k in src)) err(`${path}: sources[${i}] missing "${k}"`);
      if (src.type !== undefined && !SOURCE_TYPES.includes(src.type)) err(`${path}: sources[${i}].type "${src.type}" invalid`);
      if (src.weight !== undefined && !SOURCE_WEIGHTS.includes(src.weight)) err(`${path}: sources[${i}].weight "${src.weight}" invalid`);
    });
  }
  for (const section of DECISION_SECTIONS) {
    const re = new RegExp(`^##\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'im');
    if (!re.test(body)) err(`${path}: missing body section "## ${section}"`);
  }
}

// An accepted decision is immutable except for status and superseded_by (SPEC.md 4.2, VERSIONING.md 20.4).
function checkDecisionImmutable(file) {
  const basePath = file.status === 'R' && file.oldPath ? file.oldPath : file.path;
  const base = baseContent(basePath);
  if (base === null) return; // newly added, nothing to compare
  let b, h;
  try { b = parseFrontmatter(base, `${basePath} (base)`); h = parseFrontmatter(headContent(file.path), file.path); }
  catch (e) { err(e.message); return; }
  if (b.body.trimEnd() !== h.body.trimEnd()) err(`${file.path}: the body of an accepted decision is immutable; supersede it with a new decision instead of editing it`);
  const keys = new Set([...Object.keys(b.data), ...Object.keys(h.data)]);
  for (const k of keys) {
    if (k === 'status' || k === 'superseded_by') continue;
    if (JSON.stringify(b.data[k]) !== JSON.stringify(h.data[k])) {
      err(`${file.path}: field "${k}" changed on an accepted decision; only status and superseded_by may change (supersede instead)`);
    }
  }
}

function validateDocument(file, prBody, changedDocCount) {
  const { path } = file;
  let head;
  try { head = parseFrontmatter(headContent(path), path); } catch (e) { err(e.message); return; }
  const { data, body } = head;
  for (const k of ['slug', 'title', 'version', 'updated', 'tags']) if (!(k in data)) err(`${path}: missing frontmatter field "${k}"`);
  let headV;
  try { headV = parseVersion(data.version, path); } catch (e) { err(e.message); return; }

  const basePath = file.status === 'R' && file.oldPath ? file.oldPath : path;
  const base = file.status === 'A' ? null : baseContent(basePath);
  if (base === null) {
    if (!eqVersion(headV, [1, 0, 0, 0])) err(`${path}: a new document must be version 1.0.0.0, found ${data.version}`);
    const impact = impactFromBody(prBody);
    if (impact && !['none', 'n/a'].includes(impact)) err(`${path}: a new document must not declare a version impact (found "${impact}")`);
    return;
  }
  let baseV;
  try { baseV = parseVersion(parseFrontmatter(base, `${basePath} (base)`).data.version, `${basePath} (base)`); }
  catch (e) { err(e.message); return; }

  if (!gtVersion(headV, baseV)) { err(`${path}: version ${data.version} is not strictly greater than base ${baseV.join('.')}`); return; }
  const moved = movedSegment(baseV, headV);
  if (!moved) { err(`${path}: version ${data.version} is not a legal single-segment successor of base ${baseV.join('.')}`); return; }
  if (changedDocCount === 1) {
    const declared = impactFromBody(prBody);
    if (!declared || ['none', 'n/a'].includes(declared)) err(`${path}: this document changed but the proposal declares no version impact`);
    else if (!IMPACTS.includes(declared)) err(`${path}: the Version impact section must hold only a bare keyword (major, minor, patch, or editorial); found "${declared}"`);
    else if (declared !== moved) err(`${path}: declared version impact "${declared}" does not match the segment that moved ("${moved}")`);
  } else {
    console.log(`note: ${path} changed with other documents; per-document impact is judged by reviewers (VERSIONING.md 16.2)`);
  }
  void body;
}

// ---- approvals -----------------------------------------------------------

function requiredApprovals(files) {
  const paths = files.map((f) => f.path);
  if (paths.some((p) => NEEDS_TWO_PREFIXES.some((pre) => p.startsWith(pre)) || NEEDS_TWO_FILES.includes(p))) return 2;
  if (paths.some((p) => NEEDS_ONE_PREFIXES.some((pre) => p.startsWith(pre)))) return 1;
  return 2; // fail safe for anything uncategorized
}

async function countApprovals(prAuthor) {
  const reviews = await apiPaginate(`/repos/${REPO}/pulls/${PR_NUMBER}/reviews`);
  const effective = new Map(); // login -> { state, association }
  for (const r of reviews) {
    const login = r.user && r.user.login;
    if (!login) continue;
    // Only reviews of the exact head we validated count. This makes stale-approval reset deterministic and
    // independent of how GitHub represents dismissed reviews, aligning with dismiss-stale-on-push and the
    // up-to-date requirement: any push changes the head SHA, so prior approvals stop counting at once.
    if (r.commit_id !== HEAD_SHA) continue;
    if (!['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(r.state)) continue; // ignore COMMENTED/PENDING
    effective.set(login, { state: r.state, association: r.author_association });
  }
  const approvers = [];
  for (const [login, v] of effective) {
    if (v.state !== 'APPROVED') continue;
    if (login === prAuthor) continue;
    if (WRITE_ASSOCIATIONS.includes(v.association)) approvers.push(login);
  }
  return approvers;
}

// ---- governance (per-group approval rule, design C4/H1/H2) ---------------

// Read and normalize .oracle/governance.yml from the BASE branch (H1: never the PR head, so a proposal cannot
// lower its own gate in its own diff). A missing or malformed file falls back to the safe default (2 and 1).
function governanceFromBase() {
  const raw = baseContent('.oracle/governance.yml');
  if (raw == null) return { ...DEFAULT_GOVERNANCE };
  let data;
  try { data = yaml.load(raw); } catch { return { ...DEFAULT_GOVERNANCE }; }
  if (data == null || typeof data !== 'object' || Array.isArray(data)) return { ...DEFAULT_GOVERNANCE };
  const approvals = (data.approvals && typeof data.approvals === 'object' && !Array.isArray(data.approvals)) ? data.approvals : {};
  const coerce = (v, fallback) => {
    const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
  };
  const label = typeof data.absence_override_label === 'string' && data.absence_override_label.trim()
    ? data.absence_override_label.trim() : DEFAULT_GOVERNANCE.absence_override_label;
  return {
    decisions_documents: coerce(approvals.decisions_documents, DEFAULT_GOVERNANCE.decisions_documents),
    notes_library: coerce(approvals.notes_library, DEFAULT_GOVERNANCE.notes_library),
    absence_override_label: label,
  };
}

// The configured requirement for the touched paths, by the same tiers as requiredApprovals: the heavy path
// (decisions/documents/governed) wins if any heavy file is touched, else the light path, else heavy (fail safe).
function configuredFor(files, gov) {
  const paths = files.map((f) => f.path);
  if (paths.some((p) => NEEDS_TWO_PREFIXES.some((pre) => p.startsWith(pre)) || NEEDS_TWO_FILES.includes(p))) return gov.decisions_documents;
  if (paths.some((p) => NEEDS_ONE_PREFIXES.some((pre) => p.startsWith(pre)))) return gov.notes_library;
  return gov.decisions_documents;
}

// The membership clamp (design C4), identical to lib/governance.effectiveApprovals so display and enforcement
// never diverge: (members <= 1) ? 0 : max(1, min(configured, members - 1)).
function effectiveApprovals(configured, members) {
  if (!Number.isFinite(members) || members <= 1) return 0;
  const cfg = Number.isFinite(configured) ? Math.floor(configured) : 1;
  return Math.max(1, Math.min(cfg, members - 1));
}

// The count of collaborators who are write peers (push or admin), including the author. This is "members" in
// the clamp. Returns null when the count cannot be determined, and the caller then FAILS CLOSED to the
// un-clamped configured rule rather than dropping the gate: a failure must never silently weaken enforcement
// (returning a low count would drop the requirement toward 0). Listing collaborators requires the workflow
// token to have repo read with collaborator visibility; for a repo the token owns this succeeds.
async function memberCount() {
  try {
    const collaborators = await apiPaginate(`/repos/${REPO}/collaborators?affiliation=direct`);
    const peers = collaborators.filter((c) => c.permissions && (c.permissions.push || c.permissions.admin));
    return peers.length;
  } catch (e) {
    console.error(`could not list collaborators (failing closed to the configured rule): ${e.message}`);
    return null;
  }
}

// H2: in a flat model with no admin, the PR author could apply the absence-override label to themselves. Reject
// an override whose "labeled" event actor is the PR author, so the override cannot be self-granted. Returns the
// login that applied the label, or null if it is not applied or cannot be determined.
async function overrideApplier(label) {
  try {
    const events = await apiPaginate(`/repos/${REPO}/issues/${PR_NUMBER}/events`);
    // The last labeled event for this label name is the one currently in effect.
    let applier = null;
    for (const ev of events) {
      if (ev.event === 'labeled' && ev.label && ev.label.name === label) applier = ev.actor ? ev.actor.login : null;
      if (ev.event === 'unlabeled' && ev.label && ev.label.name === label) applier = null;
    }
    return applier;
  } catch (e) {
    console.error(`could not read label events: ${e.message}`);
    return null;
  }
}

// ---- main ----------------------------------------------------------------

async function main() {
  await setStatus('pending', 'validating');
  const pr = await apiJson('GET', `/repos/${REPO}/pulls/${PR_NUMBER}`);
  const prAuthor = pr.user.login;
  const prBody = pr.body || '';
  const labels = (pr.labels || []).map((l) => l.name);

  const files = changedFiles();
  const active = files.filter((f) => f.status !== 'D');
  const decisionsChanged = active.filter((f) => f.path.startsWith('decisions/'));
  const decisionsDeleted = files.filter((f) => f.status === 'D' && f.path.startsWith('decisions/'));
  const documentsChanged = active.filter((f) => f.path.startsWith('documents/'));
  const libraryTouched = files.some((f) => f.path.startsWith('library/'));

  for (const d of decisionsDeleted) err(`${d.path}: a decision may not be deleted; decisions are immutable and superseded, not removed`);

  const index = indexDecisions();
  const libraryFiles = new Set(listMd('library'));

  if (decisionsChanged.length || decisionsDeleted.length || libraryTouched) {
    validateReferential(index, libraryFiles);
  }
  for (const f of decisionsChanged) {
    const entry = [...index.byId.values()].find((e) => e.path === f.path);
    if (entry) validateDecisionShape(entry);
    if (f.status === 'M' || f.status === 'R') checkDecisionImmutable(f);
  }
  if (decisionsChanged.length > 0) {
    // Ids are unique, monotonic, and never reused; gaps are allowed (VERSIONING.md 20.3). A newly added id
    // must exceed every existing id and must not collide with or rewind onto one. Uniqueness across the
    // whole record is covered by the duplicate-id check in validateReferential.
    const addedIds = new Set();
    for (const f of decisionsChanged) {
      if (f.status !== 'A') continue;
      const entry = [...index.byId.values()].find((e) => e.path === f.path);
      if (entry) { try { addedIds.add(decisionId(entry.data, entry.path)); } catch { /* id error already recorded */ } }
    }
    const baseIds = [...index.byId.keys()].filter((id) => !addedIds.has(id)).map(Number);
    const baseMax = baseIds.length ? Math.max(...baseIds) : 0;
    for (const idStr of addedIds) {
      const n = Number(idStr);
      if (baseIds.includes(n)) err(`new decision id ${idStr} collides with an existing decision; ids are never reused`);
      else if (n <= baseMax) err(`new decision id ${idStr} must exceed every existing id (current max ${baseMax}); ids are monotonic and never rewind, though gaps are allowed`);
    }
  }
  for (const f of documentsChanged) validateDocument(f, prBody, documentsChanged.length);

  // Governance-aware approval requirement (design C4/H1/H2). The configured rule is read from governance.yml on
  // the BASE branch (H1), then clamped to the live membership so a solo group needs 0, a shared group needs at
  // least 1, and the requirement never exceeds what the non-author membership can supply. A repo with no
  // governance.yml uses the default 2/1, and the clamp still applies (a 3-person group is unaffected).
  const gov = governanceFromBase();
  const members = await memberCount();
  const configured = configuredFor(active.length ? active : files, gov);
  // Fail closed: if the member count is unknown, use the un-clamped configured rule so a transient API failure
  // can never weaken the gate. A known count applies the clamp (design C4).
  const clamped = members == null ? configured : effectiveApprovals(configured, members);
  const approvers = await countApprovals(prAuthor);
  let effectiveRequired = clamped;
  const hasOverride = labels.includes(gov.absence_override_label);
  if (hasOverride) {
    if (clamped < 2) err(`absence-override label is present but this proposal only requires ${clamped} approval(s), so the override changes nothing`);
    else if (!/absence override:/i.test(prBody)) err('absence-override label is present but the proposal body records no "Absence override:" justification naming the absent member');
    else {
      // H2: in a flat model the author could self-apply the label; reject an override the author granted.
      const applier = await overrideApplier(gov.absence_override_label);
      if (applier && applier === prAuthor) err('the absence-override label was applied by the proposal author; an override must be applied by another member, not self-granted');
      else effectiveRequired = 1;
    }
  }
  const approvalsMet = approvers.length >= effectiveRequired;

  console.log(`changed: ${files.length} file(s); decisions ${decisionsChanged.length}, deleted ${decisionsDeleted.length}, documents ${documentsChanged.length}`);
  console.log(`governance: members ${members}, configured ${configured}, effective ${clamped}${hasOverride ? ' (+absence-override)' : ''}`);
  console.log(`approvals: ${approvers.length}/${effectiveRequired} from [${approvers.join(', ')}]`);
  if (errors.length) { console.error('validation errors:'); for (const e of errors) console.error(`  - ${e}`); }

  if (errors.length > 0) { await setStatus('failure', `${errors.length} error(s); approvals ${approvers.length}/${effectiveRequired}`); process.exit(1); }
  if (!approvalsMet) {
    // Set a pending commit status so the required "validate" context reads as waiting, and also exit
    // non-zero so the Actions check run fails while the gate is unsatisfied. Never exit 0 on unmet approvals.
    await setStatus('pending', `awaiting approvals ${approvers.length}/${effectiveRequired}`);
    process.exit(1);
  }
  await setStatus('success', `content ok; approvals ${approvers.length}/${effectiveRequired}`);
}

main().catch(async (e) => {
  console.error(e && e.stack ? e.stack : String(e));
  await setStatus('failure', `validator error: ${String(e.message || e).slice(0, 100)}`);
  process.exit(1);
});
