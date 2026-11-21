import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import worker from './worker/index.js';
function readonlyWorkerPreview(){return {name:'control-readonly-preview',configureServer(server){server.middlewares.use(async(req,res,next)=>{
 if(!req.url?.startsWith('/api/'))return next();
 const chunks=[];for await(const chunk of req)chunks.push(chunk);
 const headers=new Headers();for(const [key,value]of Object.entries(req.headers)){if(!key.startsWith('oai-authenticated-user-')&&value)headers.set(key,Array.isArray(value)?value.join(','):value);}
 const body=Buffer.concat(chunks),method=req.method||'GET';
 const request=new Request(new URL(req.url,'http://'+req.headers.host),{method,headers,...(!['GET','HEAD'].includes(method)?{body}: {})});
 const response=await worker.fetch(request,{ASSETS:{fetch:async()=>new Response('Not found',{status:404})}});
 res.statusCode=response.status;for(const[key,value]of response.headers)res.setHeader(key,value);res.end(await response.text());
});}}}
export default defineConfig({build:{outDir:'dist/client'},optimizeDeps:{include:['react','react-dom/client']},server:{host:'0.0.0.0',allowedHosts:['terminal.local'],warmup:{clientFiles:['./src/main.jsx']}},plugins:[react(),readonlyWorkerPreview()]});
