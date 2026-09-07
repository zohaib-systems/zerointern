// Read-only route checks: Supabase is mocked; no account data is changed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { z } from "zod";

const source = ts.transpileModule(readFileSync(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function setup({ authenticated = true, authError = null, profileError = null } = {}) {
  const calls = [];
  const query = {
    update(value) { calls.push(["update", value]); return this; },
    eq(column, value) { calls.push(["filter", column, value]); return this; },
    select() { return this; },
    async maybeSingle() { return { data: profileError ? null : { id: "current-user" }, error: profileError }; },
  };
  const supabase = {
    auth: {
      async getUser() { return { data: { user: authenticated ? { id: "current-user" } : null } }; },
      async updateUser(value) { calls.push(["auth", value]); return { error: authError }; },
    },
    from(table) { assert.equal(table, "users"); return query; },
  };
  const exports = {};
  const dependencies = {
    "next/server": { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    zod: { z },
    "@/lib/supabase/server": { createClient: async () => supabase },
  };
  new Function("require", "exports", source)((id) => {
    assert.ok(id in dependencies, `Unexpected dependency: ${id}`);
    return dependencies[id];
  }, exports);
  return { run: exports.PATCH, calls };
}
function request(body, origin = "https://zerointern.vercel.app") {
  return new Request("https://zerointern.vercel.app/api/profile", {
    method: "PATCH", headers: { "content-type": "application/json", origin }, body: JSON.stringify(body),
  });
}
let test = setup();
assert.equal((await test.run(request({ name: "Alex" }, "https://untrusted.example"))).status, 403);
assert.deepEqual(test.calls, []);
test = setup({ authenticated: false });
assert.equal((await test.run(request({ name: "Alex" }))).status, 401);
assert.deepEqual(test.calls, []);
for (const name of [" ", "a".repeat(101), null]) {
  test = setup();
  assert.equal((await test.run(request({ name }))).status, 400);
  assert.deepEqual(test.calls, []);
}
test = setup();
assert.equal((await test.run(request({ name: "  Alex  ", id: "another-user" }))).status, 200);
assert.equal(test.calls.find(call => call[0] === "auth")[1].data.full_name, "Alex");
assert.deepEqual(test.calls.find(call => call[0] === "filter"), ["filter", "id", "current-user"]);
test = setup({ authError: { message: "failure" } });
assert.equal((await test.run(request({ name: "Alex" }))).status, 500);
assert.equal(test.calls.some(call => call[0] === "update"), false);
test = setup({ profileError: { message: "failure" } });
const partial = await test.run(request({ name: "Alex" }));
assert.equal(partial.status, 500);
assert.match(partial.body.error, /Please try saving again/);
console.log("Profile route checks passed: origin, authentication, validation, ownership, success, and partial failures.");
