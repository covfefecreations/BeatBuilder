// app.js - main bootstrap
import VisualSequencer from "./visualSequencer.js";
import AudioEngine from "./audioEngine.js";
import MidiManager from "./midiManager.js";
import ExportManager from "./exportManager.js";
import DataManager from "./dataManager.js";
import BassAdapter from "./bassAdapter.js";
import DrumAdapter from "./drumAdapter.js";
import ChordAdapter from "./chordAdapter.js";

const containerId = "sequencer";
const sequencer = new VisualSequencer(containerId);
const audioEngine = new AudioEngine();
const midiManager = new MidiManager(audioEngine);
const exportManager = new ExportManager();
const dataManager = new DataManager();

let allTracks = [];
let bpm = 110;

async function init() {
  // init audio engine with sample set (adjust paths to your repo)
  await audioEngine.init({
    Kick: "assets/samples/kick.wav",
    Snare: "assets/samples/snare.wav",
    Hat: "assets/samples/hihat.wav",
    Clap: "assets/samples/clap.wav"
  });

  await midiManager.init();

  // wire sequencer UI updates -> audio engine
  const container = document.getElementById(containerId);
  container.addEventListener("sequencerUpdate", (e) => {
    const updated = e.detail;
    // replace matching tracks in allTracks by title
    updated.forEach(u => {
      const idx = allTracks.findIndex(t => t.title === u.title);
      if (idx !== -1) allTracks[idx].pattern = u.pattern;
    });
    audioEngine.loadTracks(allTracks);
  });

  // wire audioEngine recorded pattern callback
  audioEngine.onPatternRecorded = (pattern) => {
    // create a new track visually for the recorded pattern
    const track = {
      id: "midi-record",
      title: "MIDI Input",
      pattern: pattern,
      color: "#9b59b6",
      meta: { type: "midi" }
    };
    allTracks.push(track);
    sequencer.loadTracks(allTracks);
    audioEngine.loadTracks(allTracks);
  };

  // UI buttons
  document.getElementById("play").onclick = async () => {
    await audioEngine.start(bpm);
    sequencer.play();
  };

  document.getElementById("stop").onclick = () => {
    audioEngine.stop();
    sequencer.stop();
  };

  document.getElementById("record-midi").onclick = () => {
    audioEngine.startRecording();
  };
  document.getElementById("stop-midi").onclick = () => {
    const pattern = audioEngine.stopRecordingAndQuantize({ quantize: document.getElementById("quantize").value, bpm });
    // attach to default track or create a new track (audioEngine handles callback)
    // If audioEngine returned a pattern, convert midi numbers to note names for visualization
    const track = {
      id: "midi-record-temp",
      title: "MIDI Recording (quantized)",
      pattern: pattern.map(p => ({ ...p, note: p.note, active: true })),
      color: "#ff8c42",
      meta: { type: "midi" }
    };
    allTracks.push(track);
    sequencer.loadTracks(allTracks);
    audioEngine.loadTracks(allTracks);
  };

  document.getElementById("quantize").onchange = (e) => {
    audioEngine.setQuantize(e.target.value);
  };

  document.getElementById("export-json").onclick = () => {
    const snapshot = audioEngine.exportSession();
    exportManager.exportJSON(snapshot, "session.json");
  };

  document.getElementById("export-midi").onclick = () => {
    exportManager.exportMIDI(allTracks, bpm, "export.mid");
  };

  document.getElementById("load-json").onclick = async () => {
    // load your existing JSON files via DataManager
    const [bassData, drumData, chordData] = await Promise.all([
      dataManager.loadData("bass"),
      dataManager.loadData("drums"),
      dataManager.loadData("chords")
    ]);

    // adapters convert to sequencer-friendly tracks
    const bassTracks = BassAdapter.loadFromJSON(bassData, bpm).map(t => ({ ...t, meta: { type: "bass" }, color: "#ffcc66" }));
    const drumTracks = DrumAdapter.loadFromJSON(drumData, bpm).map(t => ({ ...t, meta: { type: "drum" }, color: "#ff6666" }));
    const chordTracks = ChordAdapter.loadFromJSON(chordData, bpm).map(t => ({ ...t, meta: { type: "chord" }, color: "#66b3ff" }));

    // For simple sequencing, convert each adapter result to one unified track entry
    allTracks = [
      ...drumTracks,
      ...bassTracks,
      ...chordTracks
    ].map(t => ({ ...t, title: t.title || t.id }));

    sequencer.loadTracks(allTracks);
    audioEngine.loadTracks(allTracks);
  };
}

init();