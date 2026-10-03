import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
const require = createRequire(import.meta.url);
const cache = path.join(process.env.LOCALAPPDATA ?? '', 'npm-cache', '_npx');
const cachedPackages = await readdir(cache, { withFileTypes: true }).catch(() => []);
const searchPaths = [process.cwd(), ...cachedPackages.filter(entry => entry.isDirectory()).map(entry => path.join(cache, entry.name, 'node_modules'))];
const { chromium } = require(require.resolve('playwright', { paths: searchPaths }));
const { webpack } = require('next/dist/compiled/webpack/webpack');
const root = process.cwd();
const temp = path.join(root, '.next', 'notification-browser-check');
await mkdir(temp, {recursive: true});
await writeFile(path.join(temp, 'loader.cjs'), `const ts = require(${JSON.stringify(require.resolve('typescript'))}); module.exports = function(source) { return ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText; };`);
await writeFile(path.join(temp, 'navigation.mjs'), "export const usePathname=()=>'/dashboard/notifications';");
await writeFile(path.join(temp, 'link.tsx'), 'export default function Link({children,...props}) {return <a {...props}>{children}</a>;}');
await writeFile(path.join(temp, 'entry.tsx'), `import {createRoot} from 'react-dom/client'; import Bell from '@/components/common/NotificationBell'; import Inbox from '@/components/notifications/NotificationInbox'; import Composer from '@/components/admin/AnnouncementComposer'; createRoot(document.getElementById('app')).render(location.pathname==='/admin' ? <Composer/> : <><Bell/><Inbox/></>);`);
await new Promise((resolve,reject)=>{
  const compiler=webpack({mode:'development',devtool:false,entry:path.join(temp,'entry.tsx'),output:{path:temp,filename:'bundle.js'},resolve:{extensions:['.tsx','.ts','.js'],alias:{'@':root,'next/navigation':path.join(temp,'navigation.mjs'),'next/link':path.join(temp,'link.tsx')}},module:{rules:[{test:/\.tsx?$/,exclude:/node_modules/,use:path.join(temp,'loader.cjs')}]}});
  compiler.run((error,stats)=>compiler.close(()=>error||stats.hasErrors()?reject(error??new Error(stats.toString({all:false,errors:true}))):resolve()));
});
const cssDirectory = path.join(root, '.next', 'static', 'chunks');
const cssFiles = (await readdir(cssDirectory)).filter(file => file.endsWith('.css'));
const css = (await Promise.all(cssFiles.map(file => readFile(path.join(cssDirectory, file), 'utf8')))).join('\n');
const server=createServer(async(req,res)=>{ if(req.url==='/bundle.js'){res.setHeader('Content-Type','text/javascript');res.end(await readFile(path.join(temp,'bundle.js')));}else{res.setHeader('Content-Type','text/html');res.end(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="app"></div><script src="/bundle.js"></script></body></html>`);} });
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage();
  let items=[{id:'11111111-1111-4111-8111-111111111111',title:'Enable email notifications',message:'Open settings to receive updates.',path:'/dashboard/settings',created_at:'2026-10-03T00:00:00Z',read:false}];
  await page.route('**/api/notifications', async route=>{
    if(route.request().method()==='PATCH') {const {ids}=route.request().postDataJSON();items=items.map(item=>({...item,read:ids.includes(item.id)||item.read}));await route.fulfill({json:{success:true}});}
    else await route.fulfill({json:{notifications:items}});
  });
  await page.goto(origin);
  await page.getByRole('link',{name:'Notifications, 1 unread'}).waitFor();
  assert.equal(await page.getByRole('link',{name:'Open settings'}).getAttribute('href'),'/dashboard/settings');
  await page.getByRole('button',{name:'Mark all as read'}).click();
  await page.getByRole('link',{name:'Notifications, 0 unread'}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Mark as read',exact:true}).count(),0);
  await page.reload();
  await page.getByRole('link',{name:'Notifications, 0 unread'}).waitFor();
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  await page.screenshot({path:path.join(temp,'inbox-mobile.png'),fullPage:true});
  let published;
  await page.route('**/api/admin/announcements',async route=>{
    if(route.request().method()==='POST'){published=route.request().postDataJSON();await route.fulfill({status:201,json:{announcement:{...items[0],...published}}});}
    else await route.fulfill({json:{announcements:[]}});
  });
  await page.goto(`${origin}/admin`);
  await page.getByRole('button',{name:'Use email reminder'}).click();
  assert.equal(await page.getByLabel('Link destination').inputValue(),'/dashboard/settings');
  assert.equal(published,undefined,'preset does not publish automatically');
  await page.getByRole('button',{name:'Publish to all users'}).click();
  await page.getByRole('status').filter({hasText:'Announcement published'}).waitFor();
  assert.equal(published.path,'/dashboard/settings');
  assert.equal(published.title,'Enable email notifications');
  await page.screenshot({path:path.join(temp,'admin-mobile.png'),fullPage:true});
  console.log('Browser: unread bell, settings link, mark-all, persisted read state, mobile inbox, reminder preset, explicit admin publishing passed.');
} finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
