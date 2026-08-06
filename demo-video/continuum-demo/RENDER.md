# Rendering the Continuum demo — local steps

The composition (`index.html`) is authored and **passes `hyperframes check`** (0 errors).
The final MP4 render couldn't run in the build sandbox (disk was full — headless Chromium +
frame buffers need a few GB free). Run these on your machine.

> Free disk first: your `C:` was ~98% full. The render writes ~2,600 frames; keep a few GB free.

## 1. Preview (optional but recommended)

```bash
cd demo-video/continuum-demo
npm run dev
```

Open the printed URL and scrub the timeline. Fix anything that looks off, then re-check:

```bash
npm run check
```

## 2. Add the voiceover (optional — the video renders silent without it)

Generate narration from the script in `../../docs/demo-video-prompt.md` (FULL VOICEOVER
SCRIPT section):

```bash
npx hyperframes tts "PASTE THE FULL SCRIPT HERE" --voice af_nova --speed 1.02 --out assets/narration.wav
```

Then add one line just before `</div>` closes the root composition in `index.html`:

```html
<audio data-audio-track src="assets/narration.wav" data-start="0"></audio>
```

(Captions are currently placed on an ~85s manual grid. For frame-accurate sync, transcribe
the narration and nudge each `.cap` `data-start` to the word timestamps.)

## 3. Swap in the real $MON coin

Drop your chosen coin PNG at `assets/mon-coin.png`, then replace the three
`<div class="coin-fallback">…</div>` blocks in `index.html` with:

```html
<img class="coin" src="assets/mon-coin.png" alt="MON" />
```

(The gradient `coin-fallback` is only a placeholder so the composition renders without the
asset.)

## 4. Render

```bash
npm run render
```

Output MP4 lands in the project (the CLI prints the path). For the vertical cut, re-init or
re-render at `--resolution portrait` — key text is kept in a central safe band for cropping.

## Notes / honesty
- Rewards are simulated on testnet; the video says so. Don't add real-yield claims.
- stMON is a policy-gated receipt, not a CVA — keep it that way on screen.
- All addresses shown are the real Monad-testnet deployment.
