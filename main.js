// === main.js ===
// SVG-BASED SEQUENCER CORE with Advanced Features Integration
// Handles visual grid rendering, audio routing, and interaction logic.

// Import advanced modules
import AudioEngine from "./src/audioengine.js";
import MidiManager from "./src/midimanager.js";
import ExportManager from "./src/exportmanager.js";
import DataManager from "./src/datamanager.js";
import DrumAdapter from "./src/drumadapter.js";
import BassAdapter from "./src/bassadapter.js";
import ChordAdapter from "./src/chordadapter.js";

// --- GLOBALS ---
let audioCtx;
let isPlaying = false;
let currentStep = 0;
let bpm = 120;
let sequencerData = [];
let svgGrid;
let stepInterval;
let stepCount = 16;

// Advanced features
let audioEngine = null;
let midiManager = null;
let exportManager = null;
let dataManager = null;
let allTracks = [];
let useAdvancedEngine = false;

// For simple MIDI
let midiAccess = null;
let activeNotes = new Set();

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  svgGrid = document.getElementById("sequencer");
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Initialize advanced features if Tone.js is available
  if (typeof Tone !== 'undefined') {
    console.log("Tone.js detected - initializing advanced features");
    await initAdvancedFeatures();
    useAdvancedEngine = true;
  }

  await loadInstruments();
  drawGrid();
  setupControls();
  setupAdvancedControls();

  if (!useAdvancedEngine) {
    setupMIDI(); // Fallback to simple MIDI
  }
});

// --- INITIALIZE ADVANCED FEATURES ---
async function initAdvancedFeatures() {
  audioEngine = new AudioEngine();
  exportManager = new ExportManager();
  dataManager = new DataManager();

  // Initialize audio engine (no samples for now, just synths)
  await audioEngine.init({});

  // Initialize MIDI manager
  midiManager = new MidiManager(audioEngine);
  await midiManager.init();

  console.log("Advanced features initialized");
}

// --- LOAD JSON INSTRUMENTS ---
async function loadInstruments() {
  try {
    const response = await fetch("instruments/drums.json");
    const data = await response.json();
    sequencerData = parseDrumsJSON(data);
  } catch (e) {
    console.error("Error loading instruments:", e);
  }
}

// --- PARSE DRUMS.JSON FORMAT ---
function parseDrumsJSON(data) {
  const tracks = [];
  const soundPalette = data.soundPalette || [];

  // Get the first groove's first bar as our starting pattern
  if (!data.grooves || data.grooves.length === 0) return tracks;

  const firstGroove = data.grooves[0];
  const allNotations = {};

  // Collect all notation from all bars in the first groove
  firstGroove.bars.forEach(bar => {
    Object.entries(bar.notation).forEach(([instrument, notation]) => {
      if (!allNotations[instrument]) {
        allNotations[instrument] = notation;
      }
    });
  });

  // Convert each instrument's notation to track format
  Object.entries(allNotations).forEach(([instrumentName, notation]) => {
    const steps = parseNotation(notation);
    const midiNote = getMidiNoteForInstrument(instrumentName);

    tracks.push({
      id: instrumentName.toLowerCase().replace(/\s+/g, '_'),
      sound: instrumentName,
      midiNote: midiNote,
      steps: steps
    });
  });

  return tracks;
}

// --- PARSE NOTATION STRING (X = active, - = inactive) ---
function parseNotation(notation) {
  const steps = [];
  const chars = notation.replace(/\s+/g, '').split('');

  for (let i = 0; i < stepCount; i++) {
    const char = chars[i] || '-';
    steps.push({
      active: char.toUpperCase() === 'X'
    });
  }

  return steps;
}

// --- MAP INSTRUMENT NAMES TO MIDI NOTES ---
function getMidiNoteForInstrument(name) {
  const midiMap = {
    'Kick': 36,
    'Kick2': 35,
    'Sub Kick': 34,
    'Snare': 38,
    'Clap': 39,
    'Open Hat': 46,
    'Closed Hat': 42,
    'Tom': 45,
    'Wood': 37
  };
  return midiMap[name] || 40;
}

// --- DRAW SVG GRID ---
function drawGrid() {
  svgGrid.innerHTML = "";
  const width = svgGrid.clientWidth;
  const height = svgGrid.clientHeight;
  const rowHeight = height / sequencerData.length;
  const colWidth = width / stepCount;

  sequencerData.forEach((track, rowIndex) => {
    for (let step = 0; step < stepCount; step++) {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", step * colWidth);
      rect.setAttribute("y", rowIndex * rowHeight);
      rect.setAttribute("width", colWidth - 2);
      rect.setAttribute("height", rowHeight - 2);
      rect.setAttribute("rx", 6);
      rect.setAttribute("ry", 6);
      rect.classList.add("step");
      rect.dataset.row = rowIndex;
      rect.dataset.step = step;

      rect.addEventListener("click", toggleStep);
      svgGrid.appendChild(rect);
    }
  });
}

// --- TOGGLE STEP (USER EDITING) ---
function toggleStep(event) {
  const rect = event.target;
  const row = rect.dataset.row;
  const step = rect.dataset.step;
  const isActive = rect.classList.toggle("active");

  sequencerData[row].steps[step].active = isActive;
}

// --- PLAYBACK LOOP ---
async function startSequencer() {
  if (isPlaying) return;
  isPlaying = true;

  if (useAdvancedEngine && audioEngine) {
    // Use Tone.js engine for playback
    await audioEngine.start(bpm);
    currentStep = 0;
    const stepTime = (60 / bpm) / 4; // Sixteenth note timing
    stepInterval = setInterval(() => {
      highlightStep(currentStep);
      currentStep = (currentStep + 1) % stepCount;
    }, stepTime * 1000);
  } else {
    // Use simple oscillator-based playback
    currentStep = 0;
    const stepTime = (60 / bpm) / 4; // Sixteenth note timing
    stepInterval = setInterval(() => {
      playStep(currentStep);
      highlightStep(currentStep);
      currentStep = (currentStep + 1) % stepCount;
    }, stepTime * 1000);
  }
}

function stopSequencer() {
  isPlaying = false;
  clearInterval(stepInterval);
  resetHighlights();

  if (useAdvancedEngine && audioEngine) {
    audioEngine.stop();
  }
}

function playStep(step) {
  sequencerData.forEach(track => {
    const note = track.steps[step];
    if (note.active) {
      triggerSound(track.sound, track.midiNote);
    }
  });
}

function triggerSound(sound, midiNote) {
  // Simplified oscillator-based drum/synth
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = midiNoteToFreq(midiNote);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);

  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

function midiNoteToFreq(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

// --- VISUAL HIGHLIGHTING ---
function highlightStep(step) {
  resetHighlights();
  const rects = svgGrid.querySelectorAll(`[data-step="${step}"]`);
  rects.forEach(r => r.classList.add("highlight"));
}

function resetHighlights() {
  svgGrid.querySelectorAll(".highlight").forEach(r => r.classList.remove("highlight"));
}

// --- CONTROLS ---
function setupControls() {
  document.getElementById("playBtn").addEventListener("click", startSequencer);
  document.getElementById("stopBtn").addEventListener("click", stopSequencer);
  document.getElementById("exportBtn").addEventListener("click", exportPattern);
  document.getElementById("bpm").addEventListener("change", e => {
    bpm = parseInt(e.target.value);
  });
}

// --- ADVANCED CONTROLS ---
function setupAdvancedControls() {
  const loadDataBtn = document.getElementById("loadDataBtn");
  const recordMidiBtn = document.getElementById("recordMidiBtn");
  const stopRecordBtn = document.getElementById("stopRecordBtn");
  const exportMidiBtn = document.getElementById("exportMidiBtn");
  const quantizeSelect = document.getElementById("quantize");

  if (!useAdvancedEngine || !audioEngine) {
    // Disable advanced buttons if engine not available
    if (loadDataBtn) loadDataBtn.disabled = true;
    if (recordMidiBtn) recordMidiBtn.disabled = true;
    if (stopRecordBtn) stopRecordBtn.disabled = true;
    if (exportMidiBtn) exportMidiBtn.disabled = true;
    return;
  }

  // Load all JSON data and create multi-track sequence
  if (loadDataBtn) {
    loadDataBtn.addEventListener("click", async () => {
      try {
        const [drumData, bassData, chordData] = await Promise.all([
          dataManager.loadData("drums"),
          dataManager.loadData("bass"),
          dataManager.loadData("chords")
        ]);

        // Use adapters to convert to track format
        const drumTracks = DrumAdapter.loadFromJSON(drumData, bpm);
        const bassTracks = BassAdapter.loadFromJSON(bassData, bpm);
        const chordTracks = ChordAdapter.loadFromJSON(chordData, bpm);

        // Take first of each type for now
        allTracks = [
          ...drumTracks,
          bassTracks[0], // "The Foundation"
          chordTracks[0]  // "The Pop Standard"
        ].filter(Boolean);

        // Load into audio engine
        audioEngine.loadTracks(allTracks);

        console.log("Loaded tracks:", allTracks.map(t => t.title));
        alert(`Loaded ${allTracks.length} tracks:\n${allTracks.map(t => t.title).join('\n')}`);
      } catch (e) {
        console.error("Error loading data:", e);
        alert("Error loading data: " + e.message);
      }
    });
  }

  // MIDI Recording
  if (recordMidiBtn) {
    recordMidiBtn.addEventListener("click", () => {
      if (audioEngine) {
        audioEngine.startRecording();
        recordMidiBtn.style.background = "#ff0055";
        console.log("MIDI recording started");
      }
    });
  }

  if (stopRecordBtn) {
    stopRecordBtn.addEventListener("click", () => {
      if (audioEngine) {
        const quantize = quantizeSelect.value;
        const pattern = audioEngine.stopRecordingAndQuantize({ quantize, bpm });
        if (recordMidiBtn) recordMidiBtn.style.background = "";

        // Create a new track for the recording
        const newTrack = {
          id: "midi_recording_" + Date.now(),
          title: "MIDI Recording",
          pattern,
          bpm,
          meta: { type: "midi" }
        };
        allTracks.push(newTrack);
        audioEngine.loadTracks(allTracks);

        console.log("Recording stopped, quantized pattern:", pattern);
        alert(`Recorded ${pattern.length} notes`);
      }
    });
  }

  // Export MIDI
  if (exportMidiBtn) {
    exportMidiBtn.addEventListener("click", () => {
      if (exportManager && allTracks.length > 0) {
        exportManager.exportMIDI(allTracks, bpm, "beatbuilder_export.mid");
      } else {
        alert("No tracks to export. Load data first!");
      }
    });
  }

  // Quantize setting
  if (quantizeSelect) {
    quantizeSelect.addEventListener("change", (e) => {
      if (audioEngine) {
        audioEngine.setQuantize(e.target.value);
      }
    });
  }
}

// --- EXPORT PATTERN ---
function exportPattern() {
  if (useAdvancedEngine && exportManager && audioEngine) {
    // Export full session from audio engine
    const session = audioEngine.exportSession();
    exportManager.exportJSON(session, "beatbuilder_session.json");
  } else {
    // Export simple sequencer data
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sequencerData, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "pattern.json");
    dlAnchor.click();
  }
}

// --- MIDI INPUT SETUP ---
async function setupMIDI() {
  if (navigator.requestMIDIAccess) {
    try {
      midiAccess = await navigator.requestMIDIAccess();
      midiAccess.inputs.forEach(input => {
        input.onmidimessage = handleMIDIMessage;
      });
    } catch (err) {
      console.warn("MIDI access denied:", err);
    }
  }
}

function handleMIDIMessage(event) {
  const [status, note, velocity] = event.data;
  const cmd = status >> 4;
  const channel = status & 0xf;

  if (cmd === 9 && velocity > 0) { // Note on
    activeNotes.add(note);
    triggerSound("midi", note);
  } else if (cmd === 8 || velocity === 0) { // Note off
    activeNotes.delete(note);
  }
}