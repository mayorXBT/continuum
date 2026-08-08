# Vercel deployment — settings and environment

The whole app deploys as one Vercel project. The three routes under
`web/src/app/api/cleanverse/` become serverless functions, so there is no
separate backend to stand up. The contracts are already live on Monad testnet.

## Project settings

| Setting | Value |
| --- | --- |
| Framework preset | Next.js (auto-detected) |
| **Root Directory** | **`web`** |
| Build command | default (`next build`) |
| Node version | 20.x or later |

The root directory matters. This repo is a monorepo and the Next.js app lives in
`web/`, so a default root will fail to build.

## Non-secret variables

Every value here is public. The contract addresses are already published in the
README and on the explorer. Paste this whole block into Vercel's "Add
Environment Variable" screen, which accepts `.env` format, and apply it to
Production, Preview, and Development.

```
NEXT_PUBLIC_ROUTER=0x4c0316B790a6a7E194abd06E69e42fdf8c67c5F6
NEXT_PUBLIC_STMON=0x940d14C41d6F8E47549e51402219898398C8b31a
NEXT_PUBLIC_VAULT=0x75dC8959c906679f477F9c8720A0656589B4A37a
NEXT_PUBLIC_QUEUE=0x1819cA49E22e143025eCb5689873D2155E7647Db
NEXT_PUBLIC_APASS=0xfC15b21eAD5D556455F562376a2D92EccBFeB677
CLEANVERSE_BASE_URL=https://uatapi.cleanverse.com/api/cooperate
CLEANVERSE_CHAIN=monad
DEMO_ONBOARDING_MAX=250
```

`NEXT_PUBLIC_APASS` is the live registry, confirmed on-chain: it is what
`ComplianceRouter.local()` returns. The `0x5cFcF818...` address in
`contracts/broadcast/` is the superseded original and must not be used.

## Secret variables

Add these yourself in the Vercel dashboard. Never commit them, and never paste
them into a chat or a file in this repo.

| Variable | What it is |
| --- | --- |
| `CLEANVERSE_API_ID` | Sandbox institution id, sent as the `api-id` header |
| `CLEANVERSE_API_KEY` | Used locally to AES-encrypt request bodies. Never transmitted |
| `OPERATOR_PRIVATE_KEY` | Key for the **operator** account, see the warning below |
| `CHALLENGE_SECRET` | Any long random string. Falls back to the operator key if unset. Set it explicitly |

### Which key goes in OPERATOR_PRIVATE_KEY

It must be the key for the registry's `operator`, **not** the owner. Verified
on-chain:

```
MockAPass 0xfC15b21eAD5D556455F562376a2D92EccBFeB677
  owner    0xe6D52f0dF2ce8698a5DAa33c2Cac1058125B8d6a   <- do NOT use this key
  operator 0x1ecC3a63849AEDC757D11AaFbC81C2647E93499f   <- use this one
```

The operator can only call `verify()`. It cannot revoke a credential, change the
compliance mode, or touch the vault. If it leaks, the damage is a polluted
registry rather than the protocol. The owner key can do all of those things and
must never reach a web server.

The operator held 0.4708 MON at deploy time, which is plenty of gas. If
self-serve onboarding starts failing in production, check this balance first,
since an empty operator fails silently from the user's point of view.

## The one judgement call: DEMO_ONBOARDING

| Value | Effect |
| --- | --- |
| unset or empty | The self-serve route is disabled entirely. Visitors can read the app but cannot get a credential |
| any non-empty value | A visitor can issue themselves a testnet A-Pass from the Verify panel and actually use the product |

Turning it on is recommended for judging. It lets a judge try the real flow
instead of just watching the video, the operator role is verify-only, and
`DEMO_ONBOARDING_MAX=250` caps how many credentials a single process will issue.
Turn it off after judging closes.

Note that the rate limit is in-memory, so it resets when the serverless function
cold-starts and does not span instances. That is acceptable for a hackathon
demo, not for production.

## After deploying

1. Point `usecontinuum.cc` at the Vercel project and let the certificate issue.
2. Load `/app`, connect a wallet, and confirm the Verify panel reads a live
   A-Pass. That proves `CLEANVERSE_API_ID` and `CLEANVERSE_API_KEY` are correct.
3. If the app renders but every credential read fails, the Cleanverse secrets are
   wrong or missing. If the build fails outright, the root directory is not
   `web`.
