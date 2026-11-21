#!/usr/bin/env node
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
for(const relative of ['dist/client/index.html','worker/index.js','.openai/hosting.json','drizzle/0000_control.sql','drizzle/meta/_journal.json'])if(!existsSync(path.join(root,relative)))throw new Error('Missing Sites build input: '+relative);
mkdirSync(path.join(dist,'server'),{recursive:true});mkdirSync(path.join(dist,'.openai'),{recursive:true});
copyFileSync(path.join(root,'worker/index.js'),path.join(dist,'server/index.js'));
copyFileSync(path.join(root,'.openai/hosting.json'),path.join(dist,'.openai/hosting.json'));
cpSync(path.join(root,'drizzle'),path.join(dist,'.openai/drizzle'),{recursive:true});
writeFileSync(path.join(dist,'server/wrangler.json'),JSON.stringify({name:'molecule-foundry-control',main:'index.js',compatibility_date:'2026-11-01',assets:{directory:'../client',binding:'ASSETS'},d1_databases:[{binding:'DB',database_name:'molecule-foundry-local',database_id:'00000000-0000-4000-8000-000000000000',migrations_dir:'../../drizzle'}]},null,2)+'\n');
const hosting=JSON.parse(readFileSync(path.join(root,'.openai/hosting.json'),'utf8'));
if(hosting.d1!=='DB')throw new Error('Expected Sites D1 binding DB.');
console.log('Prepared Worker, static assets, D1 migrations, and hosting manifest.');
