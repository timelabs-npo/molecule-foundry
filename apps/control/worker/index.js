const REPO = "timelabs-npo/molecule-foundry";
const API_BASE = `https://api.github.com/repos/${REPO}`;
const MEMBERS = new Set(["timelabs.ad@gmail.com", "arcologies@icloud.com"]);
const STATES = new Set(["queued", "active", "review", "done", "blocked"]);
const PRIORITIES = new Set(["normal", "high", "critical"]);
let githubCache = null;
const GITHUB_SNAPSHOT_TTL_MS = 20 * 60 * 1000;

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function identity(request) {
  const id = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  return id && email ? { id, email, canWrite: MEMBERS.has(email) } : null;
}
export function authorizeMutation(request) {
  const user = identity(request);
  if (!user) throw new ApiError(401, "Sign in with ChatGPT to change shared records.");
  if (!user.canWrite) throw new ApiError(403, "Your account is not a member of this development workspace.");
  if (request.headers.get("origin") !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") throw new ApiError(403, "A same-origin browser request is required.");
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new ApiError(415, "Use application/json.");
  return user;
}
function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: {"content-type": "application/json; charset=utf-8", "cache-control": "private, no-store", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin"} });
}
function database(env) {
  if (!env.DB) throw new ApiError(503, "Shared storage is not connected. No changes were saved.");
  return env.DB;
}
function field(value, label, max = 160, optional = false) {
  if (optional && (value === undefined || value === null || value === "")) return "";
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new ApiError(400, `${label} must contain 1–${max} characters.`);
  return value.trim();
}
export function validateTask(body) {
  const title = field(body.title, "Task title"), detail = field(body.detail, "Task detail", 3000, true), priority = body.priority || "normal";
  if (!PRIORITIES.has(priority)) throw new ApiError(400, "Invalid task priority.");
  const owner = body.owner || "unassigned";
  if (owner !== "unassigned" && !MEMBERS.has(owner)) throw new ApiError(400, "Choose a verified workspace member or Unassigned.");
  return { title, detail, priority, owner };
}
export function validateConfig(body) {
  const title = field(body.title, "Draft title", 120), notes = field(body.notes, "Change notes", 2000), config = body.config;
  if (!config || Array.isArray(config) || typeof config !== "object") throw new ApiError(400, "Configuration must be an object.");
  const fields = { unitCostLimit: [0.01, 100], projectBudget: [100, 1000000], cohortSize: [20, 5000], fatigueLimit: [0, 100], liverSignalLimit: [0, 100] }, clean = {};
  for (const [key, [min,max]] of Object.entries(fields)) {
    const value = config[key];
    if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new ApiError(400, `${key} must be between ${min} and ${max}.`);
    if (["projectBudget", "cohortSize"].includes(key) && !Number.isInteger(value)) throw new ApiError(400, `${key} must be a whole number.`);
    if (key === "cohortSize" && value % 2 !== 0) throw new ApiError(400, "Cohort size must be even so treatment and control arms have equal sizes.");
    clean[key] = value;
  }
  if (!Number.isInteger(body.baseRevision) || body.baseRevision < 0) throw new ApiError(400, "A valid base revision is required.");
  return { title, notes, config: clean, baseRevision: body.baseRevision };
}
async function requestBody(request) {
  const raw = await request.text();
  if (raw.length > 16384) throw new ApiError(413, "This change exceeds the 16 KB request limit.");
  try { const value=JSON.parse(raw); if (!value || Array.isArray(value) || typeof value!=="object") throw new Error(); return value; }
  catch { throw new ApiError(400, "Send a valid JSON object."); }
}
function mapTask(row) { return { ...row, version: Number(row.version) }; }
function mapConfig(row) { return { ...row, revision:Number(row.revision), config:JSON.parse(row.config_json), config_json:undefined }; }
async function receiptContext(request, db, user, body) {
  const key = request.headers.get("idempotency-key");
  if (!key || !/^[A-Za-z0-9._:-]{16,128}$/.test(key)) throw new ApiError(400, "A valid Idempotency-Key is required.");
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(new URL(request.url).pathname + JSON.stringify(body)));
  const hash = Array.from(new Uint8Array(hashBuffer), byte=>byte.toString(16).padStart(2,"0")).join("");
  const existing = await db.prepare("SELECT actor_id, request_hash, response_json FROM mutation_receipts WHERE id = ?").bind(key).first();
  if (existing && (existing.actor_id !== user.id || existing.request_hash !== hash)) throw new ApiError(409, "This operation key was already used for a different change.");
  return { key, hash, existing: existing ? JSON.parse(existing.response_json) : null };
}
function receiptStatement(db, context, user, result, now, guard = "", guards = []) {
  return db.prepare(`INSERT INTO mutation_receipts (id, actor_id, request_hash, response_json, created_at) SELECT ?, ?, ?, ?, ? ${guard}`).bind(context.key,user.id,context.hash,JSON.stringify(result),now,...guards);
}
function auditStatement(db, user, action, subject, summary, now, guard = "", guards = []) {
  return db.prepare(`INSERT INTO audit_events (id, actor_id, actor_email, action, subject_id, summary, created_at) SELECT ?, ?, ?, ?, ?, ?, ? ${guard}`).bind(crypto.randomUUID(),user.id,user.email,action,subject,summary,now,...guards);
}
async function recoverReceipt(db, context, user, error) {
  const existing=await db.prepare("SELECT actor_id, request_hash, response_json FROM mutation_receipts WHERE id = ?").bind(context.key).first();
  if (existing && existing.actor_id===user.id && existing.request_hash===context.hash) return json(JSON.parse(existing.response_json));
  throw error;
}
async function mutateTasks(request, env) {
  const user = authorizeMutation(request), db = database(env), body = await requestBody(request), context = await receiptContext(request, db, user, body);
  if (context.existing) return json(context.existing);
  const now = new Date().toISOString();
  if (body.action === "create") {
    const input=validateTask(body), id=crypto.randomUUID(), task={id,...input,status:"queued",version:1,created_at:now,updated_at:now,created_by:user.id}, result={task};
    try { await db.batch([
      db.prepare("INSERT INTO tasks (id,title,detail,priority,owner,status,version,created_at,updated_at,created_by,operation_id) VALUES (?,?,?,?,?,'queued',1,?,?,?,?)").bind(id,input.title,input.detail,input.priority,input.owner,now,now,user.id,context.key),
      auditStatement(db,user,"task.created",id,input.title,now), receiptStatement(db,context,user,result,now),
    ]); } catch(error) { return recoverReceipt(db,context,user,error); }
    return json(result,201);
  }
  if (body.action === "set_status") {
    const id=field(body.id,"Task ID",64);
    if (!STATES.has(body.status)) throw new ApiError(400,"Invalid task status.");
    if (!Number.isInteger(body.version) || body.version<1) throw new ApiError(400,"A valid task version is required.");
    const current=await db.prepare("SELECT * FROM tasks WHERE id = ?").bind(id).first();
    if(!current) throw new ApiError(404,"Task not found.");
    if(Number(current.version)!==body.version) throw new ApiError(409,"This task changed in another session. Refresh and review its latest state.");
    const task={...mapTask(current),status:body.status,version:body.version+1,updated_at:now,operation_id:context.key}, result={task};
    const guard="WHERE EXISTS (SELECT 1 FROM tasks WHERE id = ? AND operation_id = ?)",guards=[id,context.key];
    let batch;
    try { batch=await db.batch([
      db.prepare("UPDATE tasks SET status = ?, version = version + 1, updated_at = ?, operation_id = ? WHERE id = ? AND version = ?").bind(body.status,now,context.key,id,body.version),
      auditStatement(db,user,"task.status_changed",id,`${current.status} → ${body.status}: ${current.title}`,now,guard,guards),
      receiptStatement(db,context,user,result,now,guard,guards),
    ]); } catch(error) { return recoverReceipt(db,context,user,error); }
    if(!batch[0]?.meta?.changes) throw new ApiError(409,"This task changed in another session. Refresh before retrying.");
    return json(result);
  }
  throw new ApiError(400,"Unknown task operation.");
}
async function mutateConfig(request,env) {
  const user=authorizeMutation(request),db=database(env),body=await requestBody(request),input=validateConfig(body),context=await receiptContext(request,db,user,body);
  if(context.existing) return json(context.existing);
  const current=await db.prepare("SELECT COALESCE(MAX(revision),0) AS revision FROM config_versions").first();
  if(Number(current.revision)!==input.baseRevision) throw new ApiError(409,"A newer draft exists. Refresh and review it before saving.");
  const id=crypto.randomUUID(),now=new Date().toISOString(),revision=input.baseRevision+1;
  const version={id,revision,title:input.title,notes:input.notes,config:input.config,status:"draft",created_at:now,created_by:user.id,author_email:user.email},result={version};
  try { await db.batch([
    db.prepare("INSERT INTO config_versions (id,revision,title,notes,config_json,status,created_at,created_by,author_email) VALUES (?,?,?,?,?,'draft',?,?,?)").bind(id,revision,input.title,input.notes,JSON.stringify(input.config),now,user.id,user.email),
    auditStatement(db,user,"config.drafted",id,`Draft ${revision}: ${input.title}`,now),receiptStatement(db,context,user,result,now),
  ]); } catch(error) {
    const existing=await db.prepare("SELECT actor_id,request_hash,response_json FROM mutation_receipts WHERE id = ?").bind(context.key).first();
    if(existing&&existing.actor_id===user.id&&existing.request_hash===context.hash) return json(JSON.parse(existing.response_json));
    if(String(error).includes("UNIQUE")) throw new ApiError(409,"A newer draft was saved at the same time. Refresh before retrying.");
    throw error;
  }
  return json(result,201);
}
export async function githubOverview(fetcher = fetch) {
  const endpoints = { repo:"", commits:"/commits?per_page=5", branches:"/branches?per_page=20", issues:"/issues?state=open&per_page=20", workflows:"/actions/runs?per_page=10" }, data={},errors=[];
  await Promise.all(Object.entries(endpoints).map(async([name,path])=>{
    try {
      const response=await fetcher(API_BASE+path,{headers:{Accept:"application/vnd.github+json","User-Agent":"MoleculeFoundry-Control","X-GitHub-Api-Version":"2022-11-28"},signal:AbortSignal.timeout(12000)});
      if(!response.ok) throw new Error(response.status===403||response.status===429?"GitHub rate limit or access restriction":`GitHub returned ${response.status}`);
      data[name]=await response.json();
    } catch(error) {errors.push({source:name,message:error.name==="TimeoutError"?"GitHub request timed out":String(error.message).slice(0,140)});}
  }));
  return {source:"GitHub REST API",repository:REPO,observedAt:new Date().toISOString(),errors,
    repo:data.repo?{url:data.repo.html_url,defaultBranch:data.repo.default_branch,pushedAt:data.repo.pushed_at,license:data.repo.license?.spdx_id,openIssues:data.repo.open_issues_count,visibility:data.repo.visibility}:null,
    commits:(Array.isArray(data.commits)?data.commits:[]).map(c=>({sha:c.sha,message:c.commit?.message?.split("\n")[0],date:c.commit?.committer?.date,url:c.html_url,author:c.author?.login||c.commit?.author?.name})),
    branches:(Array.isArray(data.branches)?data.branches:[]).map(b=>({name:b.name,sha:b.commit?.sha,protected:b.protected})),
    issues:(Array.isArray(data.issues)?data.issues:[]).filter(i=>!i.pull_request).map(i=>({number:i.number,title:i.title,url:i.html_url,updatedAt:i.updated_at})),
    workflows:(data.workflows?.workflow_runs||[]).map(w=>({id:w.id,name:w.name,path:w.path,status:w.status,conclusion:w.conclusion,sha:w.head_sha,branch:w.head_branch,createdAt:w.created_at,url:w.html_url})),
  };
}
/** Share only public GitHub observations across isolates; never cache visitor identity or D1 state. */
export async function cachedGithubOverview(origin, fetcher = fetch, cache = globalThis.caches?.default) {
  const key = new Request(new URL("/__internal/molecule-foundry-github-observations-v1", origin));
  if (cache) {
    try {
      const response = await cache.match(key);
      if (response?.ok) {
        const snapshot = await response.json();
        const age = Date.now() - Date.parse(snapshot?.observedAt);
        if (snapshot?.repository === REPO && Number.isFinite(age) && age >= 0 && age < GITHUB_SNAPSHOT_TTL_MS) return snapshot;
      }
    } catch { /* Cross-isolate cache is optional; fall back to the public API. */ }
  }
  const snapshot = await githubOverview(fetcher);
  const hasEvidence = !!snapshot.repo || snapshot.commits.length > 0 || snapshot.branches.length > 0 || snapshot.issues.length > 0 || snapshot.workflows.length > 0;
  if (cache && hasEvidence) {
    try {
      await cache.put(key, new Response(JSON.stringify(snapshot), {
        headers: {"content-type":"application/json; charset=utf-8", "cache-control":"public, max-age=1200"}
      }));
    } catch { /* Never turn a cache failure into a false successful GitHub observation. */ }
  }
  return snapshot;
}
async function overview(request,env) {
  if(!githubCache || Date.now()-githubCache.time>GITHUB_SNAPSHOT_TTL_MS) githubCache={time:Date.now(),value:await cachedGithubOverview(new URL(request.url).origin)};
  let storage={available:false,taskCount:0,openTaskCount:0,configCount:0,error:null};
  if(env.DB) {try {const [tasks,configs]=await env.DB.batch([env.DB.prepare("SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status != 'done' THEN 1 ELSE 0 END),0) AS open FROM tasks"),env.DB.prepare("SELECT COUNT(*) AS total FROM config_versions")]);storage={available:true,taskCount:tasks.results?.[0]?.total??0,openTaskCount:tasks.results?.[0]?.open??0,configCount:configs.results?.[0]?.total??0,error:null};}catch {storage.error="Shared database is awaiting a successful migration.";}}
  let release={status:"blocked",appRecord:"unverified",testflight:"not_uploaded",reason:"Apple API credential returned HTTP 403 when registering the new bundle. App registration, signing and upload remain unverified.",observedAt:null};
  try {const response=await env.ASSETS.fetch(new Request(new URL("/release-evidence.json",request.url)));if(response.ok&&response.headers.get("content-type")?.includes("json")){const external=await response.json();if(external&&typeof external.status==="string")release=external;}} catch {}
  return json({identity:identity(request),github:githubCache.value,storage,release,serverTime:new Date().toISOString(),workspace:{name:"Molecule Foundry",members:[...MEMBERS],agents:[],agentStatus:"No agent runner connected",briefUrl:"https://docs.google.com/document/d/1Jx7aEoU3TACKicCIo9mYfSomvmHpxe8fLPOMa970okE/edit",configScope:"Saved drafts only; does not update a shipped app"}});
}
async function api(request,env,path) {
  if(path==="/api/overview" && request.method==="GET") return overview(request,env);
  if(path==="/api/tasks" && request.method==="POST") return mutateTasks(request,env);
  if(path==="/api/config" && request.method==="POST") return mutateConfig(request,env);
  if(!["/api/tasks","/api/config","/api/audit"].includes(path)) throw new ApiError(404,"API endpoint not found.");
  if(request.method!=="GET") throw new ApiError(405,"Method not allowed.");
  const user=identity(request);
  if(!user) throw new ApiError(401,"Sign in with ChatGPT to view shared development records.");
  if(!user.canWrite) throw new ApiError(403,"Your account is not a member of this development workspace.");
  const db=database(env);
  if(path==="/api/tasks") return json({tasks:(await db.prepare("SELECT * FROM tasks ORDER BY created_at DESC LIMIT 200").all()).results.map(mapTask)});
  if(path==="/api/config") return json({versions:(await db.prepare("SELECT * FROM config_versions ORDER BY revision DESC LIMIT 100").all()).results.map(mapConfig)});
  if(path==="/api/audit") return json({events:(await db.prepare("SELECT * FROM audit_events ORDER BY created_at DESC LIMIT 100").all()).results});
}
export default {
  async fetch(request,env) {
    const path=new URL(request.url).pathname;
    if(path.startsWith("/api/")) {
      try {return await api(request,env,path);}catch(error){return json({error:error instanceof ApiError?error.message:"The server could not complete this request. No success is recorded.",retryable:!(error instanceof ApiError)||error.status>=500},error instanceof ApiError?error.status:503);}
    }
    const response=await env.ASSETS.fetch(request),acceptsHtml=request.headers.get("accept")?.includes("text/html");
    if(response.status!==404||!acceptsHtml||!["GET","HEAD"].includes(request.method)) return response;
    const indexUrl=new URL(request.url);indexUrl.pathname=path.startsWith("/play")?"/play/index.html":"/index.html";indexUrl.search="";
    return env.ASSETS.fetch(new Request(indexUrl,request));
  },
};
