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

## 2. Voiceover — already generated and wired

`assets/narration.wav` (Kokoro `af_nova`, 81.5s) is committed and already referenced by the
`<audio id="narration">` element in `index.html`. The scene cuts and captions are snapped to
this file's real word timestamps, so the current render is fully voiced and in sync.

To regenerate (e.g. different voice, or you edit `assets/narration.txt`): HyperFrames' TTS
and transcription run through a Python venv. What worked here:

```bash
python -m venv .ttsvenv
./.ttsvenv/Scripts/python -m pip install kokoro-onnx soundfile faster-whisper
# point HyperFrames at that venv (use a Windows-style path on Windows):
HYPERFRAMES_PYTHON='C:\...\.ttsvenv\Scripts\python.exe' \
  npx hyperframes tts assets/narration.txt --voice af_nova --speed 1.02 --output assets/narration.wav
```

If you change the narration length, re-align the scene/caption `data-start` values to the new
word timestamps (transcribe with word timestamps and remap) before re-rendering.

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
