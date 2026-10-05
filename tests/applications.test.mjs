import {test} from 'node:test';import assert from 'node:assert/strict';
import {api} from '../src/api.mjs';import {localDatabase} from '../db/local.mjs';
import {clean,validate,recommend,journeys,reviewStatuses} from '../public/application-model.js';
const valid={fullName:'Test Builder',email:'builder@example.com',phone:'+91 9876543210',city:'Bengaluru',currentStatus:'Student',college:'Test University',course:'Design',year:'3',journey:journeys[0],motivation:'I want to solve everyday problems.',hasIdea:'NOT YET',interests:'Small business operations',goals:'Find a viable direction.',program:'SPARK',joinReason:'Meet builders and validate a direction.',success:'A clear 90-day plan.',confirm:true};
function request(path,method='GET',body,identity='applicant',origin='https://buildadda.test'){return new Request('https://buildadda.test'+path,{method,headers:{'content-type':'application/json',origin,...(identity?{'oai-authenticated-user-id':identity,'oai-authenticated-user-email':identity==='admin'?'rajat@sportozen.com':'applicant@example.com'}:{})},body:body===undefined?undefined:JSON.stringify(body)})}
test('No-idea applicants qualify for SPARK; manual IGNITE selection is not rejected',()=>{assert.deepEqual(validate(clean(valid)),{});assert.equal(recommend(valid),'SPARK');assert.deepEqual(validate(clean({...valid,program:'IGNITE'})),{});assert.equal(recommend({...valid,hasIdea:'YES',journey:journeys[4],ideaStage:'MVP'}),'IGNITE')});
test('Validation handles malformed bodies, conditional fields and invalid contact data',()=>{assert.ok(validate(clean(null)).fullName);assert.ok(validate(clean({...valid,email:'not-email'})).email);assert.ok(validate(clean({...valid,phone:'abc'})).phone);assert.ok(validate(clean({...valid,confirm:false})).confirm);assert.ok(validate(clean({...valid,hasIdea:'YES'})).building);assert.equal(clean({...valid,building:'old idea',company:'old company'}).building,'');assert.equal(clean({...valid,company:'old company'}).company,'');assert.ok(validate(clean({...valid,age:'-2'})).age)});
test('Persist applications, retry safely, protect access, review every status and audit changes',async()=>{const DB=localDatabase(),env={DB};try{
 const id=crypto.randomUUID(),body={id,application:valid};
 assert.equal((await api(request('/api/applications','POST',body,null),env)).status,401);
 assert.equal((await api(request('/api/applications','POST',body,'applicant','https://evil.test'),env)).status,403);
 assert.equal((await api(request('/api/applications','POST',{id,application:{...valid,email:'bad'}}),env)).status,422);
 const submitted=await api(request('/api/applications','POST',body),env);assert.equal(submitted.status,201);const receipt=(await submitted.json()).application;assert.equal(receipt.status,'UNDER REVIEW');assert.equal(receipt.program,'SPARK');
 assert.equal((await api(request('/api/applications','POST',body),env)).status,201);
 assert.equal((await api(request('/api/applications','POST',body,'another-applicant'),env)).status,409);
 assert.equal((await api(request('/api/admin/applications'),env)).status,403);
 assert.equal((await api(request('/api/admin/applications/'+id,'GET',undefined,'applicant'),env)).status,403);
 const listing=await (await api(request('/api/admin/applications','GET',undefined,'admin'),env)).json();assert.equal(listing.applications.length,1);
 const detail=await (await api(request('/api/admin/applications/'+id,'GET',undefined,'admin'),env)).json();assert.equal(detail.application.answers.interests,valid.interests);
 let revision=0;for(const status of reviewStatuses){if(status==='UNDER REVIEW'&&revision===0)continue;const response=await api(request('/api/admin/applications/'+id,'PATCH',{status,revision},'admin'),env);assert.equal(response.status,200);revision=(await response.json()).application.revision;}
 assert.equal((await api(request('/api/admin/applications/'+id,'PATCH',{status:'ACCEPTED',revision:0},'admin'),env)).status,409);
 const after=await (await api(request('/api/admin/applications/'+id,'GET',undefined,'admin'),env)).json();assert.equal(after.application.status,'REJECTED');assert.equal(after.history.length,revision);
 const noSpark=await (await api(request('/api/admin/applications?program=IGNITE','GET',undefined,'admin'),env)).json();assert.equal(noSpark.applications.length,0);
 }finally{DB.close()}});
test('Storage failures are recoverable and never report success',async()=>{const response=await api(request('/api/applications','POST',{id:crypto.randomUUID(),application:valid}),{DB:{prepare(){throw new Error('offline')}}});assert.equal(response.status,503);assert.ok((await response.json()).error.includes('try again'))});
