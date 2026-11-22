import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker,{authorizeMutation,validateConfig,githubOverview,cachedGithubOverview,isGithubSnapshotFresh} from '../worker/index.js';
import {selectLatestNativeValidation,nativeValidationPassed} from '../src/release-status.mjs';
function d1(){const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../drizzle/0000_control.sql',import.meta.url),'utf8'));return{sql,prepare(query){return{values:[],bind(...values){this.values=values;return this;},async first(){return sql.prepare(query).get(...this.values)||null},async all(){return {results:sql.prepare(query).all(...this.values)}},run(){const stmt=sql.prepare(query);if(/^\s*SELECT/i.test(query))return{results:stmt.all(...this.values),meta:{changes:0}};const r=stmt.run(...this.values);return{results:[],meta:{changes:Number(r.changes)}}}}},async batch(statements){sql.exec('BEGIN');try{const r=statements.map(s=>s.run());sql.exec('COMMIT');return r}catch(e){sql.exec('ROLLBACK');throw e}}};}
const origin='https://studio.example';
const headers={'oai-authenticated-user-id':'user-one','oai-authenticated-user-email':'timelabs.ad@gmail.com',origin,'content-type':'application/json'};
function post(path,body,key=crypto.randomUUID(),extra={}){return new Request(origin+path,{method:'POST',headers:{...headers,'idempotency-key':key,...extra},body:JSON.stringify(body)});}
const create={action:'create',title:'Verify a genuine TestFlight installation',detail:'Evidence must identify the version and build.',owner:'arcologies@icloud.com',priority:'high'};
const config={title:'First contract',notes:'Check first-play uncertainty.',baseRevision:0,config:{unitCostLimit:.3,projectBudget:5600,cohortSize:120,fatigueLimit:18,liverSignalLimit:11}};
const assets={fetch:async()=>new Response('missing',{status:404})};
test('writes require signed-in allowlisted identity and same origin',async()=>{
 for(const extra of [{'oai-authenticated-user-id':''},{'oai-authenticated-user-email':'stranger@example.com'},{origin:'https://evil.example'},{origin:''},{'sec-fetch-site':'cross-site'}]){
 const response=await worker.fetch(post('/api/tasks',create,crypto.randomUUID(),extra),{DB:d1(),ASSETS:assets});assert.ok([401,403].includes(response.status));}
 assert.equal(authorizeMutation(post('/api/tasks',create)).email,'timelabs.ad@gmail.com');
});
test('task save is durable, idempotent, and atomically audited',async()=>{
 const db=d1(),key=crypto.randomUUID(),env={DB:db,ASSETS:assets};
 let r=await worker.fetch(post('/api/tasks',create,key),env);assert.equal(r.status,201);const first=await r.json();assert.equal(first.task.status,'queued');
 r=await worker.fetch(post('/api/tasks',create,key),env);assert.equal(r.status,200);assert.deepEqual(await r.json(),first);
 assert.equal(db.sql.prepare('SELECT COUNT(*) AS n FROM tasks').get().n,1);assert.equal(db.sql.prepare('SELECT COUNT(*) AS n FROM audit_events').get().n,1);
 r=await worker.fetch(post('/api/tasks',{...create,title:'A different change'},key),env);assert.equal(r.status,409);
 r=await worker.fetch(new Request(origin+'/api/tasks',{headers}),env);assert.equal((await r.json()).tasks[0].title,create.title);
});
test('stale task versions cannot overwrite another developer or create false audit entries',async()=>{
 const db=d1(),env={DB:db,ASSETS:assets};const first=await(await worker.fetch(post('/api/tasks',create),env)).json();
 let r=await worker.fetch(post('/api/tasks',{action:'set_status',id:first.task.id,version:1,status:'active'}),env);assert.equal(r.status,200);assert.equal((await r.json()).task.version,2);
 r=await worker.fetch(post('/api/tasks',{action:'set_status',id:first.task.id,version:1,status:'done'}),env);assert.equal(r.status,409);
 assert.equal(db.sql.prepare('SELECT status FROM tasks').get().status,'active');assert.equal(db.sql.prepare('SELECT COUNT(*) AS n FROM audit_events').get().n,2);
});
test('an audit write failure rolls back the task and operation receipt',async()=>{
 const db=d1();db.sql.exec("CREATE TRIGGER fail_audit BEFORE INSERT ON audit_events BEGIN SELECT RAISE(ABORT,'audit unavailable'); END;");
 const r=await worker.fetch(post('/api/tasks',create),{DB:db,ASSETS:assets});assert.equal(r.status,503);assert.equal(db.sql.prepare('SELECT COUNT(*) AS n FROM tasks').get().n,0);assert.equal(db.sql.prepare('SELECT COUNT(*) AS n FROM mutation_receipts').get().n,0);
});
test('configuration saves immutable drafts and rejects stale base revisions',async()=>{
 const db=d1(),env={DB:db,ASSETS:assets};let r=await worker.fetch(post('/api/config',config),env);assert.equal(r.status,201);let v=(await r.json()).version;assert.equal(v.status,'draft');assert.equal(v.revision,1);
 r=await worker.fetch(post('/api/config',{...config,title:'Conflict'}),env);assert.equal(r.status,409);
 r=await worker.fetch(post('/api/config',{...config,baseRevision:1,title:'A revised cohort',config:{...config.config,cohortSize:300}}),env);assert.equal(r.status,201);
 assert.equal(db.sql.prepare('SELECT COUNT(*) AS n FROM config_versions').get().n,2);assert.equal(JSON.parse(db.sql.prepare('SELECT config_json FROM config_versions WHERE revision=1').get().config_json).cohortSize,120);
});
test('invalid balance values and unrecognized owners fail validation',async()=>{
 for(const override of [{cohortSize:0},{cohortSize:21.5},{unitCostLimit:-1},{fatigueLimit:101},{projectBudget:Infinity}])assert.throws(()=>validateConfig({...config,config:{...config.config,...override}}));
 const r=await worker.fetch(post('/api/tasks',{...create,owner:'unconfirmed@example.com'}),{DB:d1(),ASSETS:assets});assert.equal(r.status,400);
});
test('private task and audit reads require workspace membership',async()=>{
 for(const path of ['/api/tasks','/api/config','/api/audit']){
 const r=await worker.fetch(new Request(origin+path),{DB:d1(),ASSETS:assets});assert.equal(r.status,401);
 const denied=await worker.fetch(new Request(origin+path,{headers:{...headers,'oai-authenticated-user-email':'outsider@example.com'}}),{DB:d1(),ASSETS:assets});assert.equal(denied.status,403);}
});
test('GitHub reads are bounded to the exact repository and failures stay unverified',async()=>{
 const urls=[];const r=await githubOverview(async(url)=>{urls.push(url);return new Response('{"message":"rate limit"}',{status:403,headers:{'content-type':'application/json'}})});
 assert.equal(urls.length,5);assert.ok(urls.every(u=>u.startsWith('https://api.github.com/repos/timelabs-npo/molecule-foundry')));assert.equal(r.repo,null);assert.equal(r.workflows.length,0);assert.equal(r.errors.length,5);assert.ok(r.observedAt);
});
test('public GitHub snapshot is reused across isolates and total failures remain uncached',async()=>{
 const stored=new Map(),cache={
  async match(request){return stored.get(request.url)?.clone();},
  async put(request,response){stored.set(request.url,response.clone());}
 };
 let calls=0;
 const fakeFetch=async(url)=>{
  calls++;
  const payload=url.includes('/commits?')||url.includes('/branches?')||url.includes('/issues?')?[]:
    url.includes('/actions/runs?')?{workflow_runs:[]}:
    {html_url:'https://github.com/timelabs-npo/molecule-foundry',default_branch:'main',visibility:'public',license:{spdx_id:'MIT'}};
  return new Response(JSON.stringify(payload),{status:200,headers:{'content-type':'application/json'}});
 };
 const first=await cachedGithubOverview(origin,fakeFetch,cache);
 const second=await cachedGithubOverview(origin,()=>{throw Error('Cached public evidence was not reused');},cache);
 assert.equal(calls,5);
 assert.deepEqual(second,JSON.parse(JSON.stringify(first))); // Cache API returns JSON without undefined fields.
 assert.equal(stored.size,1);
 assert.equal(first.repo.visibility,'public');
 let failedCacheWrites=0;
 const noCache={async match(){return null},async put(){failedCacheWrites++;}};
 const failed=await cachedGithubOverview('https://rate-limited.example',async()=>new Response('rate limited',{status:403}),noCache);
 assert.equal(failed.errors.length,5);
 assert.equal(failed.repo,null);
 assert.equal(failedCacheWrites,0);
});

test('local cache TTL uses original observation time and short failure retry',()=>{
 const time=Date.parse('2026-11-22T01:00:00Z');
 const snapshot={source:'GitHub REST API',repository:'timelabs-npo/molecule-foundry',
  observedAt:new Date(time).toISOString(),repo:{visibility:'public'},commits:[],branches:[],issues:[],workflows:[],errors:[]};
 assert.equal(isGithubSnapshotFresh(snapshot,time+20*60*1000-1),true);
 assert.equal(isGithubSnapshotFresh(snapshot,time+20*60*1000),false);
 const unavailable={...snapshot,repo:null,errors:[{source:'repo',message:'GitHub rate limit or access restriction'}]};
 assert.equal(isGithubSnapshotFresh(unavailable,time+60*1000-1),true);
 assert.equal(isGithubSnapshotFresh(unavailable,time+60*1000),false);
 assert.equal(isGithubSnapshotFresh({...snapshot,repository:'other/repository'},time),false);
 assert.equal(isGithubSnapshotFresh({...snapshot,observedAt:'not-a-date'},time),false);
});
test('unknown APIs never fall through to a successful app shell',async()=>{
 let calls=0;const response=await worker.fetch(new Request(origin+'/api/not-real',{headers:{accept:'text/html'}}),{ASSETS:{fetch:async()=>{calls++;return new Response('shell')}}});assert.equal(response.status,404);assert.equal(calls,0);
});
test('a competing write between read and commit cannot create a false audit or receipt',async()=>{
 const db=d1(),env={DB:db,ASSETS:assets};const first=await(await worker.fetch(post('/api/tasks',create),env)).json();
 const realBatch=db.batch.bind(db);db.batch=async(statements)=>{db.sql.prepare("UPDATE tasks SET version=2,status='review',operation_id='another-operation' WHERE id=?").run(first.task.id);return realBatch(statements)};
 const r=await worker.fetch(post('/api/tasks',{action:'set_status',id:first.task.id,version:1,status:'done'}),env);assert.equal(r.status,409);
 assert.equal(db.sql.prepare('SELECT status FROM tasks').get().status,'review');assert.equal(db.sql.prepare('SELECT COUNT(*) AS n FROM audit_events').get().n,1);assert.equal(db.sql.prepare('SELECT COUNT(*) AS n FROM mutation_receipts').get().n,1);
});
test('odd trial cohorts are rejected without saving an unbalanced draft or audit event',async()=>{
 const db=d1(),r=await worker.fetch(post('/api/config',{...config,config:{...config.config,cohortSize:137}}),{DB:db,ASSETS:assets});
 assert.equal(r.status,400);assert.match((await r.json()).error,/even.*equal sizes/);
 assert.equal(db.sql.prepare('SELECT COUNT(*) AS n FROM config_versions').get().n,0);
 assert.equal(db.sql.prepare('SELECT COUNT(*) AS n FROM audit_events').get().n,0);
});
test('flight readiness selects native workflow evidence and preserves its actual branch and commit',()=>{
 const runs=[
  {id:3,name:'CodeQL',path:'.github/workflows/codeql.yml',status:'completed',conclusion:'success',branch:'main',sha:'main-sha',createdAt:'2026-11-21T22:00:00Z'},
  {id:2,name:'iOS validation and TestFlight',path:'.github/workflows/ios-testflight.yml',status:'in_progress',conclusion:null,branch:'fix/native-runtime-play',sha:'pr-sha',createdAt:'2026-11-21T21:30:00Z'},
  {id:1,name:'iOS validation and TestFlight',path:'.github/workflows/ios-testflight.yml',status:'completed',conclusion:'success',branch:'main',sha:'old-sha',createdAt:'2026-11-21T20:00:00Z'},
 ];
 const chosen=selectLatestNativeValidation(runs);assert.equal(chosen.id,2);assert.equal(chosen.branch,'fix/native-runtime-play');assert.equal(chosen.sha,'pr-sha');assert.equal(nativeValidationPassed(chosen),false);
 assert.equal(selectLatestNativeValidation([runs[0]]),null);
});
