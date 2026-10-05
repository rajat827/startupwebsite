import {api,isAdmin} from './api.mjs';
import {assets} from './assets.mjs';
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname.startsWith('/api/'))return api(request,env);
 if(['/admin','/admin/','/admin.html'].includes(url.pathname)&&!isAdmin(request)){
  if(!request.headers.get('oai-authenticated-user-id'))return Response.redirect(url.origin+'/signin-with-chatgpt?return_to=%2Fadmin',302);
  return new Response('This area is only available to the BuildAdda admin.',{status:403,headers:{'Content-Type':'text/plain;charset=utf-8','Cache-Control':'no-store'}});
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const key={'/':'/index.html','/apply':'/apply.html','/apply/':'/apply.html','/admin':'/admin.html','/admin/':'/admin.html'}[url.pathname]||url.pathname;
 const asset=assets[key];if(!asset)return new Response('Not found',{status:404});
 const body=asset.binary?Uint8Array.from(atob(asset.body),c=>c.charCodeAt(0)):asset.body;
 return new Response(request.method==='HEAD'?null:body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});
}};
