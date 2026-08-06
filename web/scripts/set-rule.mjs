#!/usr/bin/env node
/**
 * Set the compliance rule on a registered pool.
 *
 *   node scripts/set-rule.mjs --min-sub-tier 30
 *   node scripts/set-rule.mjs --min-sub-tier 30 --add     # append (OR) instead of replace
 *   node scripts/set-rule.mjs --show                      # read current rules
 *
 * POST /validator/set_rule replaces the rule list; /validator/add_rule appends
 * one (rules are OR'd). Both take an encrypted body.
 *
 * The on-chain setRuleV2FromContract path reverts for a pool registered
 * through the API, so rule management goes through the API.
 */
import { createCipheriv } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

function fail(msg) {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
}

function readEnvFile(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return {};
  }
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) { args[key] = next; i++; }
    else args[key] = true;
  }
  return args;
}

function cipherFor(key) {
  const alg = { 16: "aes-128-cbc", 24: "aes-192-cbc", 32: "aes-256-cbc" }[key.length];
  if (!alg) fail(`api-key decodes to ${key.length} bytes; expected 16, 24, or 32`);
  return alg;
}

function encrypt(payload, apiKey) {
  const key = Buffer.from(apiKey, "base64");
  const cipher = createCipheriv(cipherFor(key), key, Buffer.alloc(16, 0));
  return Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]).toString("base64");
}

const args = parseArgs(process.argv.slice(2));
const web = readEnvFile(resolve(here, "..", ".env.local"));

const contract = args.contract ?? web.NEXT_PUBLIC_ROUTER;
const apiId = web.CLEANVERSE_API_ID;
const apiKey = web.CLEANVERSE_API_KEY;
if (!contract) fail("Pass --contract 0x… or set NEXT_PUBLIC_ROUTER");
if (!apiId || !apiKey) fail("CLEANVERSE_API_ID / CLEANVERSE_API_KEY missing");

const base = web.CLEANVERSE_BASE_URL ?? "https://uatapi.cleanverse.com/api/cooperate";
const chain = web.CLEANVERSE_CHAIN ?? "monad";

async function call(path, body, encrypted) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-id": apiId,
      "X-Request-ID": crypto.randomUUID(),
    },
    body: JSON.stringify(encrypted ? { data: encrypt(body, apiKey) } : body),
  });
  return res.json().catch(() => ({ code: `HTTP ${res.status}`, message: "unparseable" }));
}

if (args.show) {
  const out = await call("/validator/rules", { chain, contract_address: contract }, false);
  console.log(`\n  ${contract} on ${chain}`);
  console.log(`  ${JSON.stringify(out.data ?? out, null, 2)}\n`);
  process.exit(0);
}

const rule = {
  allowed_group: args.group ?? "",
  allowed_sub_group: args["sub-group"] ?? "",
  min_tier: Number(args["min-tier"] ?? 0),
  min_sub_tier: Number(args["min-sub-tier"] ?? 0),
  is_black_list: false,
  countries: [],
};

const endpoint = args.add ? "/validator/add_rule" : "/validator/set_rule";

console.log(`\n  ${args.add ? "Append" : "Replace"} rule → ${contract}`);
console.log(`  min_tier=${rule.min_tier}  min_sub_tier=${rule.min_sub_tier}`);
console.log(`  group="${rule.allowed_group}"  sub_group="${rule.allowed_sub_group}"`);

const out = await call(endpoint, { chain, contract_address: contract, rule }, true);
if (out.code !== "0000") {
  fail(`${endpoint} rejected — ${out.code}: ${out.message}`);
}

console.log(`\n  ✓ ${out.message}`);
console.log(`  ${JSON.stringify(out.data)}\n`);
