import {clean,validate,reviewStatuses} from '../public/application-model.js';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function isAdmin(request){return request.headers.get('oai-authenticated-user-email')?.toLowerCase()==='rajat@sportozen.com'&&!!request.headers.get('oai-authenticated-user-id')}
function database(env){if(!env.DB)throw new Error('D1 unavailable');return env.DB}
const receipt=row=>({id:row.id,name:row.name,program:row.program,status:row.status,submittedAt:row.submitted_at});
export async function api(request,env){
 const url=new URL(request.url),user=request.headers.get('oai-authenticated-user-id');
 if(!user)return json({error:'Please sign in to continue.',signIn:'/signin-with-chatgpt?return_to='+encodeURIComponent(url.pathname.startsWith('/api/admin')?'/admin':'/apply')},401);
 if(url.pathname.startsWith('/api/admin/')&&!isAdmin(request))return json({error:'This area is only available to the BuildAdda admin.'},403);
 if(['POST','PATCH'].includes(request.method)){
  if(request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Please submit from the BuildAdda website.'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Send a JSON application.'},415);
 }
 let body;
 if(['POST','PATCH'].includes(request.method)){
  if(Number(request.headers.get('content-length'))>18000)return json({error:'Your application is too long.'},413);
  const raw=await request.text();if(raw.length>18000)return json({error:'Your application is too long.'},413);
  try{body=JSON.parse(raw);if(!body||Array.isArray(body)||typeof body!=='object')throw 0;}catch{return json({error:'We could not read this application. Please try again.'},400)}
 }
 try{
  const db=database(env);
  if(url.pathname==='/api/applications'&&request.method==='POST'){
   if(!uuid.test(body.id||''))return json({error:'Refresh the application and try again.'},400);
   const data=clean(body.application),errors=validate(data);
   if(Object.keys(errors).length)return json({error:'Please check the highlighted answers.',errors},422);
   const payload=JSON.stringify(data),digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload));
   const hash=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
   const now=new Date().toISOString();
   await db.prepare('INSERT INTO applications (id,user_id,name,email,program,status,payload,payload_hash,submitted_at,updated_at,revision) VALUES (?,?,?,?,?,?,?,?,?,?,0) ON CONFLICT(id) DO NOTHING').bind(body.id,user,data.fullName,data.email,data.program,'UNDER REVIEW',payload,hash,now,now).run();
   const row=await db.prepare('SELECT * FROM applications WHERE id = ?').bind(body.id).first();
   if(!row||row.user_id!==user||row.payload_hash!==hash)return json({error:'This application reference was already used. Reload to start a new application.'},409);
   return json({application:receipt(row)},201);
  }
  if(url.pathname==='/api/admin/applications'&&request.method==='GET'){
   const status=url.searchParams.get('status')||'',program=url.searchParams.get('program')||'';
   if(status&&!reviewStatuses.includes(status)||program&&!['SPARK','IGNITE'].includes(program))return json({error:'Choose a valid filter.'},400);
   const offset=Math.max(0,Math.min(10000,parseInt(url.searchParams.get('offset')||'0',10)||0));
   const rows=await db.prepare('SELECT id,name,email,program,status,submitted_at,revision FROM applications WHERE (? = ? OR status = ?) AND (? = ? OR program = ?) ORDER BY submitted_at DESC,id DESC LIMIT 26 OFFSET ?').bind(status,'',status,program,'',program,offset).all();
   return json({applications:rows.results.slice(0,25),hasMore:rows.results.length>25,offset});
  }
  const match=url.pathname.match(/^\/api\/admin\/applications\/([a-f0-9-]+)$/i);
  if(match&&uuid.test(match[1])){
   const row=await db.prepare('SELECT * FROM applications WHERE id = ?').bind(match[1]).first();
   if(!row)return json({error:'Application not found.'},404);
   if(request.method==='GET'){
    const events=await db.prepare('SELECT status,actor,created_at,revision FROM application_events WHERE application_id = ? ORDER BY revision DESC').bind(row.id).all();
    return json({application:{...receipt(row),answers:JSON.parse(row.payload),revision:row.revision},history:events.results});
   }
   if(request.method==='PATCH'){
    if(!reviewStatuses.includes(body.status)||!Number.isInteger(body.revision))return json({error:'Choose a valid application status.'},422);
    if(row.revision!==body.revision)return json({error:'Another review changed this application. Reload it before saving.'},409);
    if(body.status===row.status)return json({application:{...receipt(row),revision:row.revision}});
    const now=new Date().toISOString();
    const changes=await db.batch([
     db.prepare('UPDATE applications SET status = ?, updated_at = ?, revision = revision + 1 WHERE id = ? AND revision = ?').bind(body.status,now,row.id,body.revision),
     db.prepare('INSERT INTO application_events (id,application_id,status,actor,created_at,revision) SELECT ?,id,status,?,updated_at,revision FROM applications WHERE id = ? AND revision = ? AND status = ? ON CONFLICT(application_id,revision) DO NOTHING').bind(crypto.randomUUID(),request.headers.get('oai-authenticated-user-email'),row.id,body.revision+1,body.status)
    ]);
    if(!changes[0].meta.changes)return json({error:'This application changed. Reload it before saving.'},409);
    return json({application:{...receipt({...row,status:body.status}),revision:body.revision+1}});
   }
  }
  return json({error:'Not found.'},404);
 }catch(error){console.error('Application storage failed',error?.name||'Error');return json({error:'We could not save or load the application right now. Your answers are still on this screen. Please try again.'},503)}
}
