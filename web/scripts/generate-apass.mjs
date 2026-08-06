#!/usr/bin/env node
/**
 * Register a sandbox A-Pass (CVI) for a wallet on Monad.
 *
 *   node scripts/generate-apass.mjs --address 0xabc... [--sub-tier 60] [--sub-group AB]
 *   node scripts/generate-apass.mjs --address 0xabc... --dry-run
 *
 * POST /generate_apass takes an AES-encrypted body. During the hackathon
 * Cleanverse relaxed the KYC checks, so kycSource/kycId are omitted and tier
 * is expressed through subTier, which callers set themselves.
 *
 * Registration is asynchronous on-chain — poll with query-apass.mjs (or the
 * app's Verify panel) until the record appears.
 */
import { createCipheriv } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

// Minimal .env.local reader — avoids a dependency just to run a one-off script.
function loadEnv() {
  const path = resolve(here, "..", ".env.local");
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    fail(`Could not read ${path}`);
  }
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

function fail(msg) {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

/** Key width follows the decoded api-key: Cleanverse issues 32 bytes (AES-256). */
function cipherFor(key) {
  const alg = { 16: "aes-128-cbc", 24: "aes-192-cbc", 32: "aes-256-cbc" }[key.length];
  if (!alg) fail(`api-key decodes to ${key.length} bytes; expected 16, 24, or 32`);
  return alg;
}

function encrypt(payload, apiKey) {
  const key = Buffer.from(apiKey, "base64");
  const iv = Buffer.alloc(16, 0); // fixed 16 zero bytes, per the docs
  const cipher = createCipheriv(cipherFor(key), key, iv);
  return Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]).toString("base64");
}

/** customerId must be 12+ chars, letters and digits only — no separators. */
function makeCustomerId(address) {
  return `continuum${address.slice(2, 10)}${Date.now().toString(36)}`.replace(
    /[^A-Za-z0-9]/g,
    "",
  );
}

const args = parseArgs(process.argv.slice(2));
const env = loadEnv();

const address = args.address;
if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
  fail("Pass a wallet: --address 0x…  (40 hex chars)");
}

const apiId = env.CLEANVERSE_API_ID;
const apiKey = env.CLEANVERSE_API_KEY;
if (!apiId || !apiKey) fail("CLEANVERSE_API_ID / CLEANVERSE_API_KEY missing from .env.local");

const base = env.CLEANVERSE_BASE_URL ?? "https://uatapi.cleanverse.com/api/cooperate";
const chain = env.CLEANVERSE_CHAIN ?? "monad";

// Default: valid for one year. subTier is the dial we control for tier rules.
const expirationTime =
  Number(args.expires) || Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

const payload = {
  customerId: args["customer-id"] ?? makeCustomerId(address),
  expirationTime,
  wallet: { address, chain },
};
if (args["sub-tier"]) payload.subTier = Number(args["sub-tier"]);
if (args["sub-group"]) payload.subGroup = String(args["sub-group"]);

console.log(`\n  A-Pass registration → ${chain}`);
console.log(`  wallet      ${address}`);
console.log(`  customerId  ${payload.customerId}`);
console.log(`  subTier     ${payload.subTier ?? "(unset)"}`);
console.log(`  subGroup    ${payload.subGroup ?? "(unset)"}`);
console.log(`  expires     ${new Date(expirationTime * 1000).toISOString().slice(0, 10)}`);

if (args["dry-run"]) {
  console.log("\n  Dry run — nothing sent.\n");
  process.exit(0);
}

const res = await fetch(`${base}/generate_apass`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "api-id": apiId,
    "X-Request-ID": crypto.randomUUID(),
  },
  body: JSON.stringify({ data: encrypt(payload, apiKey) }),
});

if (!res.ok) fail(`HTTP ${res.status} from generate_apass`);

const body = await res.json();
if (body.code !== "0000") {
  fail(`Cleanverse rejected it — ${body.code}: ${body.message}`);
}

console.log(`\n  ✓ Submitted. ${body.message}`);
console.log(`  ${JSON.stringify(body.data)}`);
console.log(
  `\n  On-chain registration is async. Check with:\n` +
    `  curl "http://localhost:3000/api/cleanverse/apass?address=${address}"\n`,
);
