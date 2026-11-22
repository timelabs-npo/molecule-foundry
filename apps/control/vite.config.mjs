import { defineConfig } from 'vite';
import { readFile } from 'node:fs/promises';
import react from '@vitejs/plugin-react';
import worker from './worker/index.js';
async function previewAssetsFetch(request){
 if(request.method!=='GET'||new URL(request.url).pathname!=='/release-evidence.json')return new Response('Not found',{status:404});
 try{return new Response(await readFile(new URL('./public/release-evidence.json',import.meta.url),'utf8'),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
 catch{return new Response('Not found',{status:404})}
}
function readonlyWorkerPreview(){return {name:'control-readonly-preview',configureServer(server){server.middlewares.use(async(req,res,next)=>{
 if(!req.url?.startsWith('/api/'))return next();
 const chunks=[];for await(const chunk of req)chunks.push(chunk);
 const headers=new Headers();for(const [key,value]of Object.entries(req.headers)){if(!key.startsWith('oai-authenticated-user-')&&value)headers.set(key,Array.isArray(value)?value.join(','):value);}
 const body=Buffer.concat(chunks),method=req.method||'GET';
 const request=new Request(new URL(req.url,'http://'+req.headers.host),{method,headers,...(!['GET','HEAD'].includes(method)?{body}: {})});
 const response=await worker.fetch(request,{ASSETS:{fetch:previewAssetsFetch}});
 res.statusCode=response.status;for(const[key,value]of response.headers)res.setHeader(key,value);res.end(await response.text());
});}}}
export default defineConfig({build:{outDir:'dist/client'},optimizeDeps:{include:['react','react-dom/client']},server:{host:'0.0.0.0',allowedHosts:['terminal.local'],warmup:{clientFiles:['./src/main.jsx']}},plugins:[react(),readonlyWorkerPreview()]});
