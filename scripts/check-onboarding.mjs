// Contract tests use mocked Supabase clients; no real accounts are modified.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { z } from "zod";
import * as jsxRuntime from "react/jsx-runtime";

function moduleFrom(path, dependencies) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  new Function("require", "exports", source)(id => {
    assert.ok(id in dependencies, `Unexpected dependency ${id}`);
    return dependencies[id];
  }, exports);
  return exports;
}
const logic = moduleFrom("../lib/onboarding.ts", { zod: { z } });
const tracks = [
  { id: "11111111-1111-4111-8111-111111111111", slug: "full-stack-js", title: "Full Stack JavaScript", projects: 8 },
  { id: "22222222-2222-4222-8222-222222222222", slug: "python-backend", title: "Python Backend Development", projects: 7 },
  { id: "33333333-3333-4333-8333-333333333333", slug: "php-laravel", title: "PHP & Laravel", projects: 9 },
];
const expectedModerate = {
  beginner: { job: 0, skills: 2, portfolio: 0, "current-job": 2 },
  intermediate: { job: 0, skills: 1, portfolio: 0, "current-job": 0 },
  advanced: { job: 1, skills: 1, portfolio: 1, "current-job": 1 },
};
let combinations = 0;
for (const experience_level of Object.keys(expectedModerate)) {
  for (const goal of ["job", "skills", "portfolio", "current-job"]) {
    for (const timeline of ["6weeks", "12weeks", "24+weeks"]) {
      for (const technology_preference of ["javascript", "python", "php", "not-sure"]) {
      const preferredIndex = { javascript: 0, python: 1, php: 2 }[technology_preference];
      const expected = tracks[preferredIndex ?? (timeline === "6weeks" ? 0 : timeline === "24+weeks" ? 1 : expectedModerate[experience_level][goal])];
      const result = logic.getRecommendation({ experience_level, goal, timeline, technology_preference }, tracks);
      assert.equal(result.recommendedTrackId, expected.id);
      assert.equal(result.recommendedTrackName, expected.title);
      assert.equal(result.projects, expected.projects, "Project count must come from the database");
      assert.equal(result.estimatedHoursPerWeek, timeline === "6weeks" ? 40 : timeline === "12weeks" ? 25 : 12);
      if (timeline === "24+weeks") assert.ok(result.estimatedWeeks >= 24);
      if (technology_preference !== "not-sure") assert.match(result.reason, /Matches your technology preference/);
      combinations++;
      }
    }
  }
}
const answers = { experience_level: "intermediate", goal: "job", timeline: "12weeks", technology_preference: "not-sure" };
assert.throws(() => logic.getRecommendation(answers, []), /unavailable/);
for (const value of [null, {}, { ...answers, timeline: "soon" }, { ...answers, experience_level: "expert" }, { ...answers, goal: "php" }, { ...answers, technology_preference: "ruby" }, { ...answers, technology_preference: undefined }]) assert.equal(logic.quizSchema.safeParse(value).success, false);
assert.equal(logic.trackSelectionSchema.safeParse({ track_id: "track-1-js" }).success, false);

function setup({ authenticated = true, databaseError = null, rpcError = null, savedResponse = null } = {}) {
  const calls = [];
  let saved = savedResponse;
  const query = {
    select() { return this; }, eq(column, value) { calls.push(["eq", column, value]); return this; },
    in() { return this; },
    async order() { return { data: tracks.map(t => ({ ...t, projects: Array.from({ length: t.projects }, (_, i) => ({ id: i })) })), error: null }; },
    async maybeSingle() { return { data: saved, error: databaseError }; },
    async upsert(value, options) { calls.push(["upsert", value, options]); if (!databaseError) saved = value; return { error: databaseError }; },
  };
  const supabase = {
    auth: { getUser: async () => ({ data: { user: authenticated ? { id: "signed-in-user" } : null } }) },
    from(table) { calls.push(["table", table]); return query; },
    async rpc(name, args) { calls.push(["rpc", name, args]); return { error: rpcError }; },
  };
  const base = { "@/lib/supabase/server": { createClient: async () => supabase }, "@/lib/onboarding": logic };
  const server = moduleFrom("../lib/onboarding-server.ts", base);
  const deps = { ...base, "@/lib/onboarding-server": server, "next/server": { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200, headers: options?.headers }) } } };
  return {
    calls,
    save: moduleFrom("../app/api/onboarding/quiz-answers/route.ts", deps).POST,
    get: moduleFrom("../app/api/onboarding/recommendation/route.ts", deps).GET,
    select: moduleFrom("../app/api/onboarding/select-track/route.ts", deps).POST,
    enroll: moduleFrom("../app/api/tracks/enroll/route.ts", deps).POST,
  };
}
function request(body, origin = "https://zerointern.vercel.app") {
  return new Request("https://zerointern.vercel.app/api/onboarding", { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
for (const name of ["save", "select", "enroll"]) {
  let test = setup();
  assert.equal((await test[name](request(answers, "https://untrusted.example"))).status, 403);
  assert.equal(test.calls.length, 0);
  test = setup({ authenticated: false });
  assert.equal((await test[name](request(answers))).status, 401);
  assert.equal(test.calls.length, 0);
  test = setup();
  assert.equal((await test[name](request({}))).status, 400);
  assert.equal(test.calls.length, 0);
  assert.equal((await test[name](new Request("https://zerointern.vercel.app/api/onboarding", { method: "POST", headers: { origin: "https://zerointern.vercel.app" }, body: "{" }))).status, 400);
}
assert.equal((await setup({ authenticated: false }).get()).status, 401);
let test = setup();
assert.deepEqual((await test.get()).body, { quizCompleted: false, userAnswers: null, recommendation: null });
let response = await test.save(request({ ...answers, user_id: "victim", recommended_track_id: tracks[2].id }));
assert.equal(response.status, 200);
assert.equal(response.body.recommendation.recommendedTrackId, tracks[0].id);
const write = test.calls.find(call => call[0] === "upsert");
assert.equal(write[1].user_id, "signed-in-user");
assert.equal(write[1].quiz_completed, true);
assert.equal(write[2].onConflict, "user_id");
const restored = await test.get();
assert.deepEqual(restored.body.recommendation, response.body.recommendation);
assert.deepEqual(restored.body.userAnswers, answers);
assert.equal(restored.body.quizCompleted, true);
assert.equal(restored.headers["Cache-Control"], "private, no-store");
const preferredAnswers = { ...answers, timeline: "6weeks", technology_preference: "python" };
assert.equal((await test.save(request(preferredAnswers))).status, 200);
const preferredRestored = (await test.get()).body;
assert.deepEqual(preferredRestored.userAnswers, preferredAnswers);
assert.equal(preferredRestored.recommendation.recommendedTrackId, tracks[1].id);
const legacyAnswers = { experience_level: "intermediate", goal: "job", timeline: "12weeks", quiz_completed: true };
const legacyRestored = (await setup({ savedResponse: legacyAnswers }).get()).body;
assert.equal(legacyRestored.userAnswers.technology_preference, "not-sure");
assert.equal(legacyRestored.recommendation.recommendedTrackId, tracks[0].id);
assert.ok(test.calls.some(call => call[0] === "eq" && call[1] === "user_id" && call[2] === "signed-in-user"));
assert.equal((await setup({ databaseError: { code: "failure" } }).save(request(answers))).status, 500);
assert.equal((await setup({ databaseError: { code: "failure" } }).get()).status, 500);

test = setup();
for (let i = 0; i < 2; i++) assert.equal((await test.select(request({ track_id: tracks[0].id, user_id: "victim" }))).status, 200);
assert.deepEqual(test.calls.filter(call => call[0] === "rpc"), Array.from({ length: 2 }, () => ["rpc", "select_onboarding_track", { p_track_id: tracks[0].id }]));
assert.equal((await setup({ rpcError: { code: "P0002" } }).select(request({ track_id: tracks[0].id }))).status, 404);
assert.equal((await setup({ rpcError: { code: "failure" } }).select(request({ track_id: tracks[0].id }))).status, 500);
test = setup();
assert.equal((await test.enroll(request({ trackId: tracks[1].id }))).status, 200);
assert.deepEqual(test.calls.find(call => call[0] === "rpc"), ["rpc", "select_onboarding_track", { p_track_id: tracks[1].id }]);
console.log(`Passed: ${combinations} recommendation combinations, validation, authentication, origin checks, ownership, refresh recovery, repeated selection, RPC errors, and enrollment integration.`);

const redirect = path => { throw new Error(`REDIRECT:${path}`); };
for (const completed of [false, true]) {
  const profile = { onboarding_completed: completed, active_track_id: completed ? tracks[1].id : null };
  const server = { getOnboardingProfile: async () => profile, getTrackChoices: async () => tracks, getSavedRecommendation: async () => ({ userAnswers: answers, recommendation: logic.getRecommendation(answers, tracks) }) };
  const dependencies = {
    "react/jsx-runtime": jsxRuntime,
    "next/navigation": { redirect },
    "@/lib/auth": { getUser: async () => ({ id: "current-user", email: "test@example.com", user_metadata: {} }) },
    "@/lib/supabase/server": { createClient: async () => ({}) },
    "@/lib/onboarding-server": server,
    "@/components/onboarding/OnboardingQuiz": { default: () => null },
    "@/components/track/DashboardTrackContent": { default: () => null },
  };
  const page = moduleFrom("../app/onboarding/page.tsx", dependencies).default;
  const dashboard = moduleFrom("../app/dashboard/page.tsx", dependencies).default;
  if (completed) {
    await assert.rejects(() => page({ searchParams: Promise.resolve({}) }), /REDIRECT:\/dashboard/);
    const switching = await page({ searchParams: Promise.resolve({ switch: "1" }) });
    assert.equal(switching.props.switching, true);
    assert.equal(switching.props.activeTrackId, tracks[1].id);
    const result = await dashboard();
    assert.equal(result.props.trackId, tracks[1].id);
  } else {
    const welcome = await page({ searchParams: Promise.resolve({ switch: "1" }) });
    assert.equal(welcome.props.switching, false, "An incomplete user cannot bypass onboarding with a query parameter");
    await assert.rejects(() => dashboard(), /REDIRECT:\/onboarding/);
  }
  const anonymous = moduleFrom("../app/onboarding/page.tsx", { ...dependencies, "@/lib/auth": { getUser: async () => null } }).default;
  await assert.rejects(() => anonymous({ searchParams: Promise.resolve({}) }), /REDIRECT:\/auth\/signin/);

  const callback = moduleFrom("../app/api/auth/callback/route.ts", {
    "@/lib/onboarding-server": server,
    "@supabase/supabase-js": { createClient: () => ({ from: () => ({ upsert: async () => ({ error: null }) }) }) },
    "@/lib/supabase/server": { createClient: async () => ({ auth: { exchangeCodeForSession: async () => ({ error: null }), getUser: async () => ({ data: { user: { id: "current-user", email: "test@example.com", user_metadata: {} } }, error: null }) } }) },
    "next/server": { NextResponse: { redirect: url => url.pathname } },
  }).GET;
  assert.equal(await callback(new Request("https://zerointern.vercel.app/api/auth/callback?code=test-code")), completed ? "/dashboard" : "/onboarding");
  assert.equal(await callback(new Request("https://zerointern.vercel.app/api/auth/callback")), "/auth/callback");
}
console.log("Passed: OAuth redirects, dashboard gating, active-track rendering, returning users, and switch-track access.");
