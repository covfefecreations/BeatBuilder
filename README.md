# BeatBuilder
BandLab Beat Builder 
## Live MIDI & Quantize — How it works

### Features
- Load structured JSON (drums.json, bass.json, chords.json) via adapters
- Visual SVG sequencer (multi-track) with click-to-toggle and drag-to-move (quantized)
- Live MIDI input recording (WebMIDI) with quantize to grid
- Playback via Tone.js Transport, per-track scheduling using Tone.Part
- Export session JSON and simple MIDI file (MidiWriterJS)

### Run locally
1. Serve the repo with a static server (VSCode Live Server or `npx serve .`)
2. Open `index.html`
3. Click **Load JSON** (assumes `data/drums.json`, `data/bass.json`, `data/chords.json`)
4. Use **Record MIDI** with a MIDI controller (allow browser MIDI). Stop then export or edit.

### File Map
