import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { app } from "../src/server.js";

let server;
let baseUrl;

before(async () => {
  process.env.NODE_ENV = "test";
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("GET / - Health check returns 200 and status message", async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.message, "CourseHub API is running");
});

test("Security headers - Helmet is active", async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("x-dns-prefetch-control"), "off");
});

test("GET /api/courses - returns 200 and array of active courses", async () => {
  const res = await fetch(`${baseUrl}/api/courses`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
});

test("GET /api/courses - supports pagination query parameters", async () => {
  const res = await fetch(`${baseUrl}/api/courses?page=1&limit=2`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.ok(data.length <= 2);
});

test("GET /api/courses/categories - returns public categories list", async () => {
  const res = await fetch(`${baseUrl}/api/courses/categories`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  if (data.length > 0) {
    assert.ok(data[0].id);
    assert.ok(data[0].name);
  }
});

test("POST /api/auth/register - fails with 400 and structured Zod errors on invalid payload", async () => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "", email: "invalid-email", password: "123" }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.message, "Validation failed");
  assert.ok(data.errors && typeof data.errors === "object");
});

test("POST /api/auth/register & login - successful lifecycle", async () => {
  const uniqueEmail = `test_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
  const password = "Password123!";

  // 1. Register
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Integration Test User",
      email: uniqueEmail,
      password: password,
    }),
  });
  assert.equal(regRes.status, 201);
  const regData = await regRes.json();
  assert.ok(regData.token);
  assert.equal(regData.user.email, uniqueEmail);
  assert.equal(regData.user.role, "STUDENT");

  // 2. Login
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: uniqueEmail,
      password: password,
    }),
  });
  assert.equal(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.ok(loginData.token);
  assert.equal(loginData.user.email, uniqueEmail);
});

test("GET /api/courses/mine - requires authentication (401)", async () => {
  const res = await fetch(`${baseUrl}/api/courses/mine`);
  assert.equal(res.status, 401);
});
