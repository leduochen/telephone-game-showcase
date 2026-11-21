# Telephone Game — audio experiment showcase

Two static sample browsers, with all playback audio stored in this repository:

- **[50-input experiment](https://leduochen.github.io/telephone-game-showcase/)** — 50 English source recordings, six conditions, three independent runs, ten hops; 8,997 recorded outputs out of 9,000 planned.
- **[Emotion & prosody](https://leduochen.github.io/telephone-game-showcase/emotion.html)** — six selected A/B pairs from the 30-pair experiment, four audio models, three runs, ten hops; 1,430 recorded outputs out of 1,440 planned.

The interface and explanatory text are in English. Original source transcripts, generated transcripts, and model-native captions are preserved in their original language, including Chinese. Each page has source provenance, experiment settings, exact prompts, and audio players. The 50-input page compares three runs in columns. The emotion/prosody page lists all six inputs; each has 12 expandable model/run sections showing H0–H10 in order, with A/B side by side. Navigation connects the two experiments directly.

## Deploy with GitHub Pages

No package installation, build step, server, API key, or Git LFS is needed.

1. Open this repository’s **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select **main** and **/ (root)**, then **Save**.
4. Wait for the **pages build and deployment** job to finish. The site will be available at `https://leduochen.github.io/telephone-game-showcase/`.

Subsequent pushes to `main` update the site automatically. The empty `.nojekyll` file makes this a plain static site. All site asset URLs are relative, so the repository subpath works without configuration. See [GitHub’s publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

For local preview, run from the repository root:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`. Serve over HTTP; the browsers load JSON with `fetch()`.

## Included experiments

Frozen export dated November 20, 2026:

| Page | Source run | Conditions |
| --- | --- | --- |
| 50-input | `telephone-real50-short-sixarms-20261120` | GPT-Live, GPT-Realtime, Gemini, Grok with audio input; GPT-Realtime and Gemini with text input |
| Emotion & prosody | `telephone-prosodic-pairs-short-20261120` | The same four models with audio input |

Model IDs: `gpt-live-1` (cedar), `gpt-realtime-2.1` (cedar), `gemini-3.8-live` (Aoede), `grok-voice-3.0` (eve). Each hop uses a fresh session. The audio conditions relay the preceding audio; text conditions relay its independent ASR transcript, while still producing audio. Every run restarts from the same H0. No new model calls were made to build this website.

Selected pairs:

| Pair ID | Example |
| --- | --- |
| `debate_seg_016_017_s0` | Chicken and duck |
| `iud_006_pid_f05` | Moving the lamp |
| `contra_50002` | Receipt statement/question; also same text with different intonation |
| `debate_seg_057_058_s4` | Concert and refunds |
| `debate_seg_043_044_s1` | Two leaders or two plans |
| `debate_seg_055_056_s8` | Xiaoming and Xiaohong: who loses whom |

The six inputs cover every case named in the text or figures of the 30-pair experimental findings report, alongside the original concert/refund example. The selected pairs include every available model/run/hop, not just the highlighted observations. Known missing outputs remain missing: Real50 Gemini audio R3/vtr_0046 H8–H10, and prosody Gemini R2/contra_50002 side B H1–H10.

## Audio and files

- `index.html`, `emotion.html`: the two pages.
- `assets/site.css`: shared styling; `assets/app.js`: the 50-input browser; `assets/emotion.js`: expandable, full-chain prosody timelines.
- `assets/data/`: compact source metadata and per-input result files; loaded on demand.
- `assets/audio/real50/`: 9,047 AAC playback files (50 sources + 8,997 outputs), 48 kb/s, encoded from the experiment WAVs without gain, trim, or speed changes.
- `assets/audio/prosody/`: 1,442 lossless FLAC files (12 sources + 1,430 outputs). Every decoded PCM sample was checked against the experiment WAV. No gain, trim, resampling, or speed changes during this export.
- `assets/data/provenance.json`: source IDs, pinned revisions, and original publication links.
- `assets/data/audio-manifest.json`: SHA-256 hashes of exported files and the corresponding experiment WAVs.
- `ATTRIBUTION.md`, `licenses/`: dataset attribution and available publisher license notices.

The site is approximately 810 MB, below GitHub Pages’ 1 GB site limit. Audio uses `preload="none"` and loads only on playback. Only one recording plays at a time. The site needs no external JavaScript, font service, analytics, or model API.

## Attribution

Source recordings retain their respective dataset licenses; this repository does not relicense them. See [ATTRIBUTION.md](ATTRIBUTION.md) for credits, source links, and transformations. Source meaning labels are taken from dataset metadata; displayed transcripts are ASR or model-native captions.
