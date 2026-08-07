# Recording the wallet-connected shots (your part)

The demo video is built and renders from real screenshots of the running app. Three moments
still need a **connected wallet**, which only you can do, because it needs your deployer key
in a wallet extension. Everything else is done.

Record these three and I will cut them into the video in place of the current recreations.

## Setup

1. `cd web && npm run dev`, open `http://localhost:3000/app`
2. Connect the deployer wallet `0xe6D52f0d…8d6a` (sub-tier 60, passes the rule)
3. Set your screen recorder to **1920x1080**, hide bookmarks and notifications
4. Zoom the browser to ~110% so the numbers read on video

## The three shots

**Shot 1 · Stake (about 15s)**
Stake tab. Type `1`, hit **Stake**, confirm in the wallet, wait for `YOUR STMON` to update.
Then hit **Drip simulated rewards (+0.1)** so the rate ticks up from `1.0000`.
*What matters on camera:* your stMON balance appearing, and the rate moving.

**Shot 2 · The refusal (about 20s) — the important one**
Transfer tab. Paste the low-tier wallet `0x5C6CCA4C687C60B15bf83EAE5843a77a325EEda9`,
amount `1`, hit **Send**. Let the revert render with the `NotVerified` reason visible.
*What matters on camera:* the error text. Hold on it for 3 seconds before stopping.

**Shot 3 · Controlled exit (about 25s)**
Console tab. Request a redemption to a verified receiver, approve it as the officer, and let
the payout settle.
*What matters on camera:* the request appearing, the approval, and the final settled state.

## Sending them to me

Save as `demo-video/continuum-demo/assets/footage/shot1.mp4` (and `shot2`, `shot3`). Any
format your recorder produces is fine. Tell me they are in and I will re-cut and re-render.

## If you would rather not

The video already works without them. Scenes 4, 6 and 7 currently use the real UI plus the
verified on-chain results from `docs/deployment.md`, presented as a visualization rather than
claimed as a live recording. Swapping in real footage makes the refusal moment hit harder,
which is why it is worth the ten minutes.
