// === main.js ===
// SVG-BASED SEQUENCER CORE
// Handles visual grid rendering, audio routing, and interaction logic.

// --- GLOBALS ---
let audioCtx;
let isPlaying = false;
let currentStep = 0;
let bpm = 120;
let sequencerData = [];
let svgGrid;
let stepInterval;
let stepCount = 16;

// For MIDI
let midiAccess = null;
let activeNotes = new Set();

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  svgGrid = document.getElementById("sequencer");
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  loadInstruments();
  drawGrid();
  setupControls();
  setupMIDI();
});

// --- LOAD JSON INSTRUMENTS ---
async function loadInstruments() {
  try {
    const response = await fetch("instruments/drumkit.json");
    const data = await response.json();
    sequencerData = data.tracks || [];
  } catch (e) {
    console.error("Error loading instruments:", e);
  }
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
function startSequencer() {
  if (isPlaying) return;
  isPlaying = true;
  currentStep = 0;
  const stepTime = (60 / bpm) / 4; // Sixteenth note timing

  stepInterval = setInterval(() => {
    playStep(currentStep);
    highlightStep(currentStep);
    currentStep = (currentStep + 1) % stepCount;
  }, stepTime * 1000);
}

function stopSequencer() {
  isPlaying = false;
  clearInterval(stepInterval);
  resetHighlights();
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

// --- EXPORT PATTERN ---
function exportPattern() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sequencerData, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "pattern.json");
  dlAnchor.click();
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