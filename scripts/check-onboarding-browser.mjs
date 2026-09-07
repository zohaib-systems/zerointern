// Browser component checks with real React UI and mocked network/router.
// Run: npm.cmd exec --yes --package=@playwright/test -- node scripts/check-onboarding-browser.mjs
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(require.resolve("playwright", { paths: (process.env.PATH ?? "").split(path.delimiter).map(entry => path.dirname(entry)) }));
const { webpack } = require("next/dist/compiled/webpack/webpack");
const root = process.cwd();
const temp = path.join(root, ".next", "onboarding-browser-check");
await mkdir(temp, { recursive: true });
const tracks = [
  { id: "11111111-1111-4111-8111-111111111111", slug: "full-stack-js", title: "Full Stack JavaScript", description: "Build complete web applications with JavaScript.", projects: 8 },
  { id: "22222222-2222-4222-8222-222222222222", slug: "python-backend", title: "Python Backend", description: "Build APIs and production backend systems.", projects: 8 },
  { id: "33333333-3333-4333-8333-333333333333", slug: "php-laravel", title: "PHP & Laravel", description: "Build web applications with Laravel.", projects: 8 },
];
const recommendation = { recommendedTrackId: tracks[0].id, recommendedTrackName: tracks[0].title, reason: "Build complete web apps", whyGood: ["Frontend and backend skills", "Portfolio projects"], estimatedWeeks: 12, estimatedHoursPerWeek: 25, projects: 8 };
await writeFile(path.join(temp, "loader.cjs"), `const ts = require(${JSON.stringify(require.resolve("typescript"))}); module.exports = function(source) { return ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText; };`);
await writeFile(path.join(temp, "css-loader.cjs"), `module.exports = function(source) { const classes = Object.fromEntries([...source.matchAll(/\\.([a-zA-Z][\\w-]*)/g)].map(m => [m[1], m[1]])); const css = source.replace(/:global\\(([^)]+)\\)/g, '$1'); return 'const style=document.createElement("style"); style.textContent=' + JSON.stringify(css) + ';document.head.appendChild(style);export default ' + JSON.stringify(classes); };`);
await writeFile(path.join(temp, "navigation.mjs"), "export const useRouter = () => ({ replace: path => { window.__navigation = path; }, refresh: () => {} });");
await writeFile(path.join(temp, "link.tsx"), "export default function Link({children, ...props}) { return <a {...props}>{children}</a>; }");
await writeFile(path.join(temp, "image.tsx"), "export default function Image({unoptimized, priority, ...props}) { return <img {...props} />; }");
await writeFile(path.join(temp, "entry.tsx"), `import { createRoot } from 'react-dom/client'; import Quiz from '@/components/onboarding/OnboardingQuiz'; const params = new URLSearchParams(location.search); createRoot(document.getElementById('app')).render(<Quiz user={{name:'Alex Developer',email:'alex@example.com',image:null}} tracks={${JSON.stringify(tracks)}} initialAnswers={null} initialRecommendation={params.has('saved') ? ${JSON.stringify(recommendation)} : null} switching={params.has('switch')} activeTrackId={params.has('switch') ? '${tracks[0].id}' : null} />);`);
await new Promise((resolve, reject) => {
  const compiler = webpack({ mode: "development", devtool: false, entry: path.join(temp, "entry.tsx"), output: { path: temp, filename: "bundle.js" }, resolve: { extensions: [".tsx", ".ts", ".js"], alias: { "@": root, "next/navigation": path.join(temp, "navigation.mjs"), "next/link": path.join(temp, "link.tsx"), "next/image": path.join(temp, "image.tsx") } }, module: { rules: [{ test: /\.tsx?$/, exclude: /node_modules/, use: path.join(temp, "loader.cjs") }, { test: /\.css$/, use: path.join(temp, "css-loader.cjs") }] } });
  compiler.run((error, stats) => compiler.close(() => error || stats.hasErrors() ? reject(error ?? new Error(stats.toString({ all: false, errors: true }))) : resolve()));
});
const systemCss = (await readFile(path.join(root, "styles/system.css"), "utf8")).replace(/@theme inline\s*\{[^}]*\}/, "");
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;color:#f8fafc;background:#0f172a;font-family:Arial,sans-serif}h1,h2,h3,p,dl,dd{margin:0}button,input{font:inherit}button{border:0;background:none;color:inherit}a{color:inherit;text-decoration:none}fieldset{border:0;padding:0;margin:0}legend{padding:0}button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid #67e8f9;outline-offset:3px}.zi-eyebrow{color:#67e8f9;font-size:12px;text-transform:uppercase;letter-spacing:.15em}${systemCss}</style></head><body><div id="app"></div><script src="/bundle.js"></script></body></html>`;
const server = createServer(async (req, res) => {
  if (req.url === "/bundle.js") { res.setHeader("Content-Type", "application/javascript"); res.end(await readFile(path.join(temp, "bundle.js"))); }
  else if (req.url === "/icon.png") { res.setHeader("Content-Type", "image/png"); res.end(await readFile(path.join(root, "public/icon.png"))); }
  else { res.setHeader("Content-Type", "text/html"); res.end(html); }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const base = `http://127.0.0.1:${server.address().port}`;
  let savedAnswers;
  let selectedTrack;
  let failSave = true;
  await page.route("**/api/onboarding/quiz-answers", async route => {
    savedAnswers = route.request().postDataJSON();
    await route.fulfill({ status: failSave ? 500 : 200, contentType: "application/json", body: JSON.stringify(failSave ? { error: "Save failed. Please try again." } : { recommendation }) });
    failSave = false;
  });
  await page.route("**/api/onboarding/select-track", async route => {
    selectedTrack = route.request().postDataJSON().track_id;
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, redirectTo: "/dashboard" }) });
  });
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base);
    await page.getByRole("heading", { name: "Welcome to ZeroIntern, Alex!" }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.getByRole("button", { name: "Get started" }).click();
    assert.equal(await page.getByRole("button", { name: "Next" }).isDisabled(), true);
    await page.getByRole("radio", { name: "Beginner" }).focus();
    await page.keyboard.press("ArrowDown");
    assert.equal(await page.getByRole("radio", { name: "Intermediate" }).isChecked(), true);
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("radio", { name: "Job/Freelance" }).check();
    await page.getByRole("button", { name: "Back" }).click();
    assert.equal(await page.getByRole("radio", { name: "Intermediate" }).isChecked(), true);
    await page.getByRole("button", { name: "Next" }).click();
    assert.equal(await page.getByRole("radio", { name: "Job/Freelance" }).isChecked(), true);
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("heading", { name: "Which technology would you like to learn?" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Next" }).isDisabled(), true);
    await page.getByRole("radio", { name: "Python" }).check();
    await page.screenshot({ path: path.join(temp, `technology-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Back" }).click();
    assert.equal(await page.getByRole("radio", { name: "Python" }).isChecked(), true);
    await page.getByRole("radio", { name: "Not sure" }).check();
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("progressbar", { name: "Question 4 of 4" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "See my recommendation" }).isDisabled(), true);
    await page.getByRole("radio", { name: "12 weeks", exact: false }).check();
    await page.screenshot({ path: path.join(temp, `question-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "See my recommendation" }).click();
    if (width === 375) {
      await page.getByRole("alert").waitFor();
      assert.equal(await page.getByRole("radio", { name: "12 weeks" }).isChecked(), true);
      await page.getByRole("button", { name: "See my recommendation" }).click();
    }
    await page.getByRole("heading", { name: "A track for your goals" }).waitFor();
    assert.deepEqual(savedAnswers, { experience_level: "intermediate", goal: "job", timeline: "12weeks", technology_preference: "not-sure" });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: path.join(temp, `results-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "Start Full Stack JavaScript" }).click();
    await page.waitForFunction(() => window.__navigation === "/dashboard");
    assert.equal(selectedTrack, tracks[0].id);
  }
  await page.goto(base);
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.getByRole("button", { name: /PHP & Laravel/ }).click();
  await page.waitForFunction(() => window.__navigation === "/dashboard");
  assert.equal(selectedTrack, tracks[2].id);
  await page.goto(`${base}?saved=1`);
  await page.getByRole("heading", { name: "A track for your goals" }).waitFor();
  await page.goto(`${base}?switch=1`);
  await page.getByRole("heading", { name: "Choose your track" }).waitFor();
  await page.getByRole("button", { name: /Python Backend/ }).click();
  await page.waitForFunction(() => window.__navigation === "/dashboard");
  assert.equal(selectedTrack, tracks[1].id);
  assert.deepEqual(errors, []);
  console.log("Passed browser checks at 375, 768, and 1280px: welcome, four questions, technology selection, Back, disabled Next, retry, results, manual selection, restored results, switching, and no horizontal overflow.");
  console.log("Screenshots: .next/onboarding-browser-check/");
} finally {
  await browser?.close();
  server.close();
}
