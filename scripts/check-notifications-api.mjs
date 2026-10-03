import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
function load(file, mocks = {}) {
  const source = ts.transpileModule(readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const testModule = {exports:{}};
  vm.runInNewContext(source, {module:testModule,exports:testModule.exports,require:name=>mocks[name]??require(name),Set,Date,URL,console});
  return testModule.exports;
}
const { announcementSchema } = load('lib/announcements.ts');
let admin = false;
let signedIn = false;
const writes = [];
const rows = [{id:'11111111-1111-4111-8111-111111111111',title:'Reminder',message:'Enable emails',path:'/dashboard/settings',created_at:'2026-10-03'}];
const client = {
  auth:{getUser:async()=>({data:{user:signedIn?{id:'owner'}:null}})},
  from(table) {
    const query={select(){return query;},order(){return query;},limit(){return query;},eq(key,value){if(table==='announcement_reads'&&key==='user_id')assert.equal(value,'owner');return query;},in(){return query;},single(){return Promise.resolve({data:rows[0],error:null});},insert(value){writes.push({table,value});return query;},upsert(value){writes.push({table,value});return Promise.resolve({error:null});},then(resolve){return Promise.resolve({data:table==='announcements'?rows:[],error:null}).then(resolve);}};
    return query;
  }
};
const responseMock={NextResponse:{json:(body,init={})=>({body,status:init.status??200})}};
const userRoute=load('app/api/notifications/route.ts',{'next/server':responseMock,'@/lib/supabase/server':{createClient:async()=>client}});
const adminRoute=load('app/api/admin/announcements/route.ts',{'next/server':responseMock,'@/lib/admin':{requireAdmin:async()=>admin?client:null},'@/lib/announcements':{announcementSchema}});
const request=(body,origin='https://zerointern.vercel.app')=>new Request('https://zerointern.vercel.app/api/notifications',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
assert.equal((await userRoute.GET()).status,401);
assert.equal((await adminRoute.GET()).status,401);
assert.equal((await adminRoute.POST(request({title:'Reminder',message:'Enable email',path:'/dashboard/settings'}))).status,401);
assert.equal(writes.length,0);
admin=true;
assert.equal((await adminRoute.POST(request({title:'Reminder',message:'Enable email',path:'/dashboard/settings'},'https://evil.example'))).status,403);
for(const path of ['//evil.example','https://evil.example','/dashboard/settings?redirect=evil']) assert.equal((await adminRoute.POST(request({title:'Reminder',message:'Message',path}))).status,400);
assert.equal((await adminRoute.POST(request({title:'   ',message:'Message',path:'/dashboard'}))).status,400);
assert.equal((await adminRoute.POST(request({title:' Reminder ',message:' Message ',path:'/dashboard/settings'}))).status,201);
assert.equal(writes[0].value.title,'Reminder');
signedIn=true;
assert.equal((await userRoute.GET()).body.notifications[0].read,false);
assert.equal((await userRoute.PATCH(request({ids:[rows[0].id],user_id:'someone-else'}))).status,400);
assert.equal((await userRoute.PATCH(request({ids:[rows[0].id,rows[0].id]}))).status,200);
assert.equal(writes[1].value.length,1);
assert.equal(writes[1].value[0].user_id,'owner');
assert.equal((await userRoute.PATCH(request({ids:[rows[0].id]},'https://evil.example'))).status,403);
console.log('API authorization, same-origin protection, validation, authenticated inbox, server-owned receipt IDs and deduplication passed.');
