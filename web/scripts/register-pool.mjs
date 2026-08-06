#!/usr/bin/env node
/**
 * Register a contract as a Cleanverse compliance pool.
 *
 *   node scripts/register-pool.mjs --contract 0xRouter [--min-sub-tier 30]
 *
 * The owner signature is specified two different ways, and Cleanverse has not
 * reconciled them publicly:
 *
 *   A (CVI guide)  keccak256(chain + contract_address), signed as a digest
 *   B (API docs)   EIP-191 personal_sign over the literal "chain + address"
 *
 * Both are lowercase, no separator ("monad0xabc…"). Several builders reported
 * "Invalid contract owner signature" using B alone, so this tries A first and
 * falls back to B, reporting which one the server accepted.
 *
 * Requires PRIVATE_KEY (contracts/.env) — must be the contract's Ownable owner.
 */
import { createCipheriv } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, toHex } from "viem";

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
const chainEnv = readEnvFile(resolve(here, "..", "..", "contracts", ".env"));

const contract = args.contract ?? web.NEXT_PUBLIC_ROUTER;
if (!contract || !/^0x[a-fA-F0-9]{40}$/.test(contract)) {
  fail("Pass --contract 0x… (or set NEXT_PUBLIC_ROUTER in web/.env.local)");
}

const apiId = web.CLEANVERSE_API_ID;
const apiKey = web.CLEANVERSE_API_KEY;
const pk = chainEnv.PRIVATE_KEY;
if (!apiId || !apiKey) fail("CLEANVERSE_API_ID / CLEANVERSE_API_KEY missing from web/.env.local");
if (!pk) fail("PRIVATE_KEY missing from contracts/.env");

const base = web.CLEANVERSE_BASE_URL ?? "https://uatapi.cleanverse.com/api/cooperate";
const chain = web.CLEANVERSE_CHAIN ?? "monad";

const account = privateKeyToAccount(pk.startsWith("0x") ? pk : `0x${pk}`);
const message = `${chain.toLowerCase()}${contract.toLowerCase()}`;

// The rule the pool enforces. Defaults are permissive: any valid A-Pass.
// Cleanverse computes the country bitmap server-side from `countries`.
const rule = {
  allowed_group: args.group ?? "",
  allowed_sub_group: args["sub-group"] ?? "",
  min_tier: Number(args["min-tier"] ?? 0),
  min_sub_tier: Number(args["min-sub-tier"] ?? 0),
  is_black_list: false,
  countries: [],
};

console.log(`\n  Register compliance pool → ${chain}`);
console.log(`  contract   ${contract}`);
console.log(`  signer     ${account.address}`);
console.log(`  message    "${message}"`);
console.log(`  rule       min_tier=${rule.min_tier} min_sub_tier=${rule.min_sub_tier}`);

async function signVariant(which) {
  if (which === "A") {
    // Hash first, then sign the 32-byte digest as a raw message.
    return account.signMessage({ message: { raw: keccak256(toHex(message)) } });
  }
  // Plain EIP-191 over the literal string.
  return account.signMessage({ message });
}

async function attempt(which) {
  const owner_signature = await signVariant(which);
  const payload = { chain, contract_address: contract, rule, owner_signature };
  const res = await fetch(`${base}/validator/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-id": apiId,
      "X-Request-ID": crypto.randomUUID(),
    },
    body: JSON.stringify({ data: encrypt(payload, apiKey) }),
  });
  const body = await res.json().catch(() => ({ code: `HTTP ${res.status}` }));
  return { which, ok: body.code === "0000", body };
}

if (args["dry-run"]) {
  console.log(`\n  A (keccak digest) ${await signVariant("A")}`);
  console.log(`  B (personal_sign) ${await signVariant("B")}`);
  console.log("\n  Dry run — nothing sent.\n");
  process.exit(0);
}

const results = [];
for (const which of ["A", "B"]) {
  const label = which === "A" ? "keccak256 digest (CVI guide)" : "EIP-191 literal (API docs)";
  process.stdout.write(`\n  → variant ${which}: ${label} … `);
  const r = await attempt(which);
  results.push(r);
  if (r.ok) {
    console.log("accepted");
    console.log(`\n  ✓ Registered. ${JSON.stringify(r.body.data)}`);
    console.log(`\n  Signature scheme that works: variant ${which} (${label}).\n`);
    process.exit(0);
  }
  console.log(`rejected — ${r.body.code}: ${r.body.message}`);
}

console.error("\n  ✗ Both signature variants were rejected.");
for (const r of results) {
  console.error(`    ${r.which}: ${r.body.code} ${r.body.message}`);
}
console.error(
  "\n  The signer must be the contract's Ownable owner() on this chain.\n" +
    `  Check:  cast call ${contract} "owner()(address)" --rpc-url $MONAD_RPC\n`,
);
process.exit(1);
