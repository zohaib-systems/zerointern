import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { PGlite } from '@electric-sql/pglite';
const require = createRequire(import.meta.url);
const ts = require('typescript');
function load(file, mocks = {}) {
  const source = ts.transpileModule(readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const testModule = {exports:{}};
  vm.runInNewContext(source, {module:testModule,exports:testModule.exports,require:name=>mocks[name]??require(name),Set,Map,Date,Buffer,console});
  return testModule.exports;
}
const certificateLib = load('lib/certificate.ts');
const { createCertificateIfEarned, generateCryptoHash } = certificateLib;
const { getCertificateData } = load('lib/certificateData.ts', {'./certificate':certificateLib});
function setup(beginnerCount, advancedCount = 0, {duplicate = false, fail = '', concurrent = false} = {}) {
  const projects = Array.from({length:8},(_,i)=>({id:`p${i}`,title:`Project ${i}`,project_order:i+1,track_id:'track',difficulty_level:i<4?'beginner':'advanced'}));
  const submissions = projects.filter((p,i)=>i<beginnerCount || (i>=4&&i<4+advancedCount)).map(p=>({user_id:'user',project_id:p.id,status:'APPROVED'}));
  if (duplicate) submissions.push({...submissions[0]});
  submissions.push({user_id:'user',project_id:'other-project',status:'APPROVED'}, {user_id:'someone-else',project_id:'p3',status:'APPROVED'});
  const tables = {projects,submissions,certificates:[],users:[{id:'user',name:'Learner'}],tracks:[{id:'track',title:'JavaScript'}]};
  let inserts=0;
  const client={from(table){
    let rows=tables[table]; let inserting=false; let values;
    const query={select(){return query;},eq(key,value){rows=rows.filter(row=>row[key]===value);return query;},in(key,ids){rows=rows.filter(row=>ids.includes(row[key]));return query;},order(){return query;},insert(value){inserting=true;values=value;return query;},async maybeSingle(){return {data:rows[0]??null,error:fail===table?{message:'lookup failed'}:null};},async single(){if(inserting){inserts++;const row={id:'credential',...values};tables.certificates.push(row);return concurrent?{data:null,error:{code:'23505'}}:{data:row,error:null};}return {data:rows[0]??null,error:null};},then(resolve){return Promise.resolve({data:rows,error:fail===table?{message:'lookup failed'}:null}).then(resolve);}};
    return query;
  }};
  return {client,tables,inserts:()=>inserts};
}
for (const [beginners,advanced,duplicate] of [[0,4,false],[3,4,false],[3,0,true],[4,0,false]]) {
  const state=setup(beginners,advanced,{duplicate});
  const result=await createCertificateIfEarned(state.client,'user','track');
  assert.equal(Boolean(result),beginners===4,'only four distinct own beginner approvals qualify');
  assert.equal(state.inserts(),beginners===4?1:0);
}
const state=setup(4);
const issued=await createCertificateIfEarned(state.client,'user','track');
assert.equal(issued.crypto_hash,generateCryptoHash('user','track',issued.issued_at));
let data=await getCertificateData(state.client,issued.verification_code);
assert.equal(data.sealLevel,'standard');
for (const p of state.tables.projects.filter(p=>p.difficulty_level==='advanced')) state.tables.submissions.push({user_id:'user',project_id:p.id,status:'APPROVED'});
const existing=await createCertificateIfEarned(state.client,'user','track');
assert.equal(existing.id,issued.id);assert.equal(state.inserts(),1);
data=await getCertificateData(state.client,issued.verification_code);
assert.equal(data.sealLevel,'advanced');assert.equal(data.issuedAt,issued.issued_at);assert.equal(data.cryptoHash,issued.crypto_hash);
for(const fail of ['projects','submissions','certificates']) await assert.rejects(createCertificateIfEarned(setup(4,0,{fail}).client,'user','track'));
assert.equal((await createCertificateIfEarned(setup(4,0,{concurrent:true}).client,'user','track')).id,'credential');

const db=new PGlite();
const user='11111111-1111-4111-8111-111111111111', track='22222222-2222-4222-8222-222222222222', other='33333333-3333-4333-8333-333333333333';
await db.exec(`create table projects(id uuid primary key default gen_random_uuid(),track_id uuid,difficulty_level text);
create table submissions(user_id uuid,project_id uuid,status text);
create table certificates(id uuid default gen_random_uuid(),user_id uuid,track_id uuid,issued_at timestamptz,crypto_hash text,verification_code text unique,unique(user_id,track_id));
insert into projects(track_id,difficulty_level) select '${track}','beginner' from generate_series(1,4);
insert into projects(track_id,difficulty_level) select '${track}','advanced' from generate_series(1,4);
insert into submissions select '${user}',id,'APPROVED' from projects where difficulty_level='beginner';
insert into submissions select '${other}',id,'APPROVED' from projects where difficulty_level='advanced';`);
const repair=readFileSync('supabase/20261003_repair_beginner_certificates.sql','utf8');
await db.exec(repair);
const repaired=(await db.query('select * from certificates')).rows;
assert.equal(repaired.length,1);assert.equal(repaired[0].user_id,user);
assert.equal(repaired[0].crypto_hash,generateCryptoHash(user,track,new Date(repaired[0].issued_at).toISOString()));
await db.exec(repair);
assert.equal((await db.query('select * from certificates')).rows.length,1);
assert.equal((await db.query('select * from certificates')).rows[0].verification_code,repaired[0].verification_code);
await db.close();
console.log('Passed beginner issuance, duplicates/other users/advanced exclusions, repeat and concurrent approvals, seal upgrade preserving credential, lookup failures, repair hash and rerun checks.');
