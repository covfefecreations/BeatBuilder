// Basic Web Audio Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const tempo = 100;
let isPlaying = false;
let currentStep = 0;
let quantize = "1/16";

// MIDI
let midiInput = null;

// Grid dimensions
const cols = 32; // time
const rows = 12; // pitch (C3–B3)
const notes = ["B3","A#3","A3","G#3","G3","F#3","F3","E3","D#3","D3","C#3","C3"];

// State: 2D grid of notes
let grid = Array.from({ length: rows }, () => Array(cols).fill(false));

// Initialize UI
const roll = document.getElementById("pianoRoll");
const labels = document.getElementById("noteLabels");

notes.forEach(n => {
  const label = document.createElement("div");
  label.textContent = n;
  labels.appendChild(label);
});

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.row = r;
    cell.dataset.col = c;
    cell.addEventListener("click", () => {
      grid[r][c] = !grid[r][c];
      cell.classList.toggle("active");
    });
    roll.appendChild(cell);
  }
}

// Sound
function playNote(note) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sawtooth";
  const freq = noteToFreq(note);
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
}

function noteToFreq(note) {
  const A4 = 440;
  const noteFreqMap = {
    "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56,
    "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00,
    "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94
  };
  return noteFreqMap[note] || A4;
}

// Sequencer loop
function playSequence() {
  if (isPlaying) return;
  isPlaying = true;
  const interval = (60 / tempo) / 4 * 1000;
  const cells = document.querySelectorAll(".cell");

  const loop = setInterval(() => {
    if (!isPlaying) {
      clearInterval(loop);
      return;
    }

    // Reset
    cells.forEach(c => c.classList.remove("playing"));
    for (let r = 0; r < rows; r++) {
      const note = notes[r];
      if (grid[r][currentStep]) {
        playNote(note);
        const idx = r * cols + currentStep;
        cells[idx].classList.add("playing");
      }
    }

    currentStep = (currentStep + 1) % cols;
  }, interval);
}

function stopSequence() {
  isPlaying = false;
  currentStep = 0;
  document.querySelectorAll(".cell").forEach(c => c.classList.remove("playing"));
}

function clearGrid() {
  grid = Array.from({ length: rows }, () => Array(cols).fill(false));
  document.querySelectorAll(".cell").forEach(c => c.classList.remove("active"));
}

function exportPattern() {
  const blob = new Blob([JSON.stringify(grid, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pattern.json";
  a.click();
  URL.revokeObjectURL(url);
}

// MIDI input
async function initMIDI() {
  if (!navigator.requestMIDIAccess) {
    document.getElementById("midiStatus").innerText = "MIDI not supported";
    return;
  }
  const midiAccess = await navigator.requestMIDIAccess();
  const inputs = midiAccess.inputs.values();
  const firstInput = inputs.next().value;
  if (firstInput) {
    midiInput = firstInput;
    document.getElementById("midiStatus").innerText = `Connected: ${midiInput.name}`;
    midiInput.onmidimessage = onMIDIMessage;
  }
}

function onMIDIMessage(msg) {
  const [status, note, velocity] = msg.data;
  const isNoteOn = (status & 0xf0) === 0x90 && velocity > 0;
  if (isNoteOn) {
    const noteName = midiToNoteName(note);
    const row = notes.indexOf(noteName);
    if (row === -1) return;
    const col = currentStep;
    grid[row][col] = true;
    const idx = row * cols + col;
    document.querySelectorAll(".cell")[idx].classList.add("active");
  }
}

function midiToNoteName(midi) {
  const octave = Math.floor(midi / 12) - 1;
  const n = midi % 12;
  const names = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  return `${names[n]}${octave}`;
}

// Event listeners
document.getElementById("playBtn").addEventListener("click", playSequence);
document.getElementById("stopBtn").addEventListener("click", stopSequence);
document.getElementById("clearBtn").addEventListener("click", clearGrid);
document.getElementById("exportBtn").addEventListener("click", exportPattern);
document.getElementById("quantizeSelect").addEventListener("change", e => quantize = e.target.value);

initMIDI();