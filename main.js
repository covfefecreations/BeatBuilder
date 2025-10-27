// === main.js ===
// SVG-BASED SEQUENCER CORE with Advanced Visual Sequencer Upgrades
// Keeps your modular architecture and adds refined visuals: smooth playhead, pad pulse, velocity overlay,
// responsive resizing, and better highlight transitions.

// Import advanced modules (your existing modules stay unchanged)
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
let stepCount = 16; // default 16 steps
let viewportWidth = 800;
let viewportHeight = 400;

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

// Track state (mute/solo/volume)
let trackStates = [];

// UI Elements
let playheadElement = null;
let svgColWidth = 0;
let svgRowHeight = 0;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
  svgGrid = document.getElementById("sequencer");
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // detect Tone.js
  if (typeof Tone !== 'undefined') {
    await initAdvancedFeatures();
    useAdvancedEngine = true;
  }

  await loadInstruments();
  initializeTrackStates();
  renderStepNumbers();
  renderTrackControls();
  drawGrid();
  setupControls();
  setupAdvancedControls();
  updateStatusBar();
  window.addEventListener('resize', debounce(resizeSequencer, 120));

  if (!useAdvancedEngine) {
    setupMIDI(); // Fallback
  }
});

// --- INITIALIZE ADVANCED FEATURES ---
async function initAdvancedFeatures() {
  audioEngine = new AudioEngine();
  exportManager = new ExportManager();
  dataManager = new DataManager();

  // Initialize audio engine
  await audioEngine.init({});
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
    sequencerData = []; // fallback empty
  }
}

// --- PARSE DRUMS.JSON (unchanged) ---
function parseDrumsJSON(data) {
  const tracks = [];
  if (!data.grooves || data.grooves.length === 0) return tracks;
  const firstGroove = data.grooves[0];
  const allNotations = {};
  firstGroove.bars.forEach(bar => {
    Object.entries(bar.notation).forEach(([instrument, notation]) => {
      if (!allNotations[instrument]) {
        allNotations[instrument] = notation;
      }
    });
  });
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

function parseNotation(notation) {
  const steps = [];
  const chars = notation.replace(/\s+/g, '').split('');
  for (let i = 0; i < stepCount; i++) {
    const char = chars[i] || '-';
    steps.push({
      active: char.toUpperCase() === 'X',
      velocity: (char === 'x') ? 0.35 : 1.0 // ghost = lower velocity
    });
  }
  return steps;
}

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

// --- INIT TRACK STATES ---
function initializeTrackStates() {
  trackStates = sequencerData.map(() => ({
    muted: false,
    solo: false,
    volume: 100
  }));
}

// --- RENDER STEP NUMBERS (unchanged visual) ---
function renderStepNumbers() {
  const stepNumbersContainer = document.getElementById("stepNumbers");
  if (!stepNumbersContainer) return;
  stepNumbersContainer.innerHTML = "";
  for (let i = 0; i < stepCount; i++) {
    const stepDiv = document.createElement("div");
    stepDiv.className = "step-number";
    if (i % 4 === 0) {
      stepDiv.classList.add("beat-start");
      stepDiv.textContent = (i / 4) + 1;
    } else {
      stepDiv.textContent = i + 1;
    }
    stepNumbersContainer.appendChild(stepDiv);
  }
}

// --- RENDER TRACK CONTROLS (unchanged) ---
function renderTrackControls() {
  const trackControlsPanel = document.getElementById("trackControls");
  if (!trackControlsPanel) return;
  trackControlsPanel.innerHTML = "";
  sequencerData.forEach((track, index) => {
    const trackControl = document.createElement("div");
    trackControl.className = "track-control";
    trackControl.style.borderLeftColor = getTrackColor(track);
    const label = document.createElement("div");
    label.className = "track-label";
    label.textContent = track.sound || `Track ${index + 1}`;
    trackControl.appendChild(label);
    const buttons = document.createElement("div");
    buttons.className = "track-buttons";
    const muteBtn = document.createElement("button");
    muteBtn.className = "track-btn"; muteBtn.textContent = "M"; muteBtn.title = "Mute";
    muteBtn.addEventListener("click", (e) => toggleMute(index, e.target));
    const soloBtn = document.createElement("button");
    soloBtn.className = "track-btn"; soloBtn.textContent = "S"; soloBtn.title = "Solo";
    soloBtn.addEventListener("click", (e) => toggleSolo(index, e.target));
    buttons.appendChild(muteBtn); buttons.appendChild(soloBtn);
    trackControl.appendChild(buttons);
    const volumeDiv = document.createElement("div");
    volumeDiv.className = "track-volume";
    const volumeLabel = document.createElement("span"); volumeLabel.className = "track-volume-label"; volumeLabel.textContent = "Vol";
    const volumeSlider = document.createElement("input"); volumeSlider.type = "range"; volumeSlider.min = 0; volumeSlider.max = 100; volumeSlider.value = 100;
    volumeSlider.addEventListener("input", (e) => setTrackVolume(index, e.target.value));
    volumeDiv.appendChild(volumeLabel); volumeDiv.appendChild(volumeSlider);
    trackControl.appendChild(volumeDiv);
    trackControlsPanel.appendChild(trackControl);
  });
}

// --- GET TRACK COLOR (unchanged) ---
function getTrackColor(track) {
  const sound = (track.sound || "").toLowerCase();
  if (sound.includes("kick") || sound.includes("snare") || sound.includes("hat") || sound.includes("clap")) {
    return "#ff4466";
  } else if (sound.includes("bass")) {
    return "#4488ff";
  } else if (sound.includes("chord")) {
    return "#aa44ff";
  }
  return "#00ffee";
}

// --- TRACK CONTROL FUNCTIONS (unchanged) ---
function toggleMute(trackIndex, button) {
  trackStates[trackIndex].muted = !trackStates[trackIndex].muted;
  button.classList.toggle("active");
  if (trackStates[trackIndex].muted && trackStates[trackIndex].solo) {
    trackStates[trackIndex].solo = false;
    const soloBtn = button.parentElement.querySelector('[title="Solo"]');
    if (soloBtn) soloBtn.classList.remove("active");
  }
}
function toggleSolo(trackIndex, button) {
  trackStates[trackIndex].solo = !trackStates[trackIndex].solo;
  button.classList.toggle("active");
  if (trackStates[trackIndex].solo && trackStates[trackIndex].muted) {
    trackStates[trackIndex].muted = false;
    const muteBtn = button.parentElement.querySelector('[title="Mute"]');
    if (muteBtn) muteBtn.classList.remove("active");
  }
}
function setTrackVolume(trackIndex, volume) {
  trackStates[trackIndex].volume = parseInt(volume);
}
function isTrackAudible(trackIndex) {
  const anySolo = trackStates.some(state => state.solo);
  if (anySolo) return trackStates[trackIndex].solo;
  else return !trackStates[trackIndex].muted;
}

/* ---------------------------
   DRAW GRID (visual upgrades)
   - calculates responsive sizes
   - creates nicer rects and attaches hover overlays
---------------------------- */
function drawGrid() {
  if (!svgGrid) return;
  svgGrid.innerHTML = "";

  // responsive viewport dims
  const bbox = svgGrid.getBoundingClientRect();
  viewportWidth = Math.max(600, Math.floor(bbox.width || 800));
  viewportHeight = Math.max(260, Math.floor(bbox.height || 400));
  svgGrid.setAttribute("viewBox", `0 0 ${viewportWidth} ${viewportHeight}`);

  if (sequencerData.length === 0) return;

  svgColWidth = viewportWidth / stepCount;
  svgRowHeight = viewportHeight / sequencerData.length;

  // vertical beat guide lines (every 4 steps)
  for (let i = 0; i <= stepCount; i++) {
    if (i % 4 === 0) {
      const line = createSVG('line', {
        x1: i * svgColWidth, y1: 0, x2: i * svgColWidth, y2: viewportHeight, class: 'beat-line'
      });
      svgGrid.appendChild(line);
    }
  }

  // Rows + steps
  sequencerData.forEach((track, rowIndex) => {
    // subtle row background (rect)
    const rowBg = createSVG('rect', {
      x: 0, y: rowIndex * svgRowHeight, width: viewportWidth, height: svgRowHeight, rx: 6, ry: 6,
      fill: 'transparent'
    });
    svgGrid.appendChild(rowBg);

    for (let step = 0; step < stepCount; step++) {
      const x = step * svgColWidth + 4;
      const y = rowIndex * svgRowHeight + 6;
      const w = Math.max(8, svgColWidth - 10);
      const h = Math.max(10, svgRowHeight - 12);

      const rect = createSVG('rect', {
        x, y, width: w, height: h, rx: 6, ry: 6, class: 'step',
      });

      rect.dataset.row = rowIndex;
      rect.dataset.step = step;

      // type class
      const sound = (track.sound || "").toLowerCase();
      if (sound.includes("kick") || sound.includes("snare") || sound.includes("hat") || sound.includes("clap")) {
        rect.classList.add('track-drum');
      } else if (sound.includes("bass")) {
        rect.classList.add('track-bass');
      } else if (sound.includes("chord")) {
        rect.classList.add('track-chord');
      }

      // active?
      const stepObj = (track.steps && track.steps[step]) ? track.steps[step] : { active:false };
      if (stepObj.active) {
        rect.classList.add('active');
        if ((stepObj.velocity || 1) < 0.6) rect.classList.add('velocity-low');
        else if ((stepObj.velocity || 1) > 0.85) rect.classList.add('velocity-high');
      }

      // mouse interactions
      rect.addEventListener('click', toggleStep);
      rect.addEventListener('mouseenter', showStepInfo);
      rect.addEventListener('mouseleave', hideTooltip);

      // add a gentle drop shadow via filter (optional)
      svgGrid.appendChild(rect);
    }
  });

  // playhead - create on top
  playheadElement = createSVG('rect', {
    x: 0, y: 0, width: svgColWidth, height: viewportHeight, class: 'playhead'
  });
  svgGrid.appendChild(playheadElement);
}

/* helper to create svg elements with attributes */
function createSVG(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k,v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}

/* hover tooltip overlay (native title fallback used earlier)
   create small SVG text bubble near cursor (for visual polish)
*/
let tooltipEl = null;
function showStepInfo(e){
  const rect = e.target;
  const row = parseInt(rect.dataset.row);
  const step = parseInt(rect.dataset.step);
  if (!sequencerData[row] || !sequencerData[row].steps[step]) return;
  const stepData = sequencerData[row].steps[step];
  const trackName = sequencerData[row].sound;
  const velocity = Math.round((stepData.velocity || 1) * 100);

  // set native title for accessibility
  rect.setAttribute('title', `${trackName} — Step ${step+1} — Vel ${velocity}%`);

  // create small overlay near rect
  hideTooltip();
  tooltipEl = createSVG('g', {});
  const bubble = createSVG('rect', { rx:6, ry:6, width:120, height:32, fill:'rgba(0,0,0,0.6)' });
  const text = createSVG('text', { x:8, y:20, fill:'#fff', 'font-size':12 });
  text.textContent = `${trackName} • Step ${step+1} • ${velocity}%`;
  tooltipEl.appendChild(bubble);
  tooltipEl.appendChild(text);

  // position bubble above the rect
  const bbox = rect.getBBox();
  tooltipEl.setAttribute('transform', `translate(${bbox.x + bbox.width + 8}, ${bbox.y})`);
  svgGrid.appendChild(tooltipEl);
}
function hideTooltip(){
  if (tooltipEl && tooltipEl.parentNode) tooltipEl.parentNode.removeChild(tooltipEl);
  tooltipEl = null;
}

/* toggleStep - also animates the rectangle
   (keeps your edit behavior but visually smooth)
*/
function toggleStep(event){
  const rect = event.target;
  const row = parseInt(rect.dataset.row);
  const step = parseInt(rect.dataset.step);
  const stepObj = sequencerData[row].steps[step];
  stepObj.active = !stepObj.active;
  // toggle class and add tiny pop animation
  if (stepObj.active) {
    rect.classList.add('active');
    rect.animate([{ transform: 'scale(0.96)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' });
  } else {
    rect.classList.remove('active');
  }
}

/* PLAYBACK LOOP (unchanged logic) */
async function startSequencer() {
  if (isPlaying) return;
  isPlaying = true;

  if (useAdvancedEngine && audioEngine) {
    await audioEngine.start(bpm);
    currentStep = 0;
    const stepTime = (60 / bpm) / 4;
    stepInterval = setInterval(() => {
      highlightStep(currentStep);
      currentStep = (currentStep + 1) % stepCount;
    }, stepTime * 1000);
  } else {
    currentStep = 0;
    const stepTime = (60 / bpm) / 4;
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
  if (useAdvancedEngine && audioEngine) audioEngine.stop();
}

/* playStep (unchanged) */
function playStep(step) {
  sequencerData.forEach((track, trackIndex) => {
    if (!isTrackAudible(trackIndex)) return;
    const note = track.steps[step];
    if (note && note.active) {
      const volume = trackStates[trackIndex].volume / 100;
      triggerSound(track.sound, track.midiNote, volume, note.velocity || 1.0);
    }
  });
}

/* triggerSound - small improvement: velocity affects gain */
function triggerSound(sound, midiNote, volume = 1.0, velocity = 1.0) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = midiNoteToFreq(midiNote);
  const base = 0.12 * volume;
  gain.gain.setValueAtTime(base * Math.max(0.06, velocity), audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18 + (1-velocity)*0.2);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.45);
}
function midiNoteToFreq(note) { return 440 * Math.pow(2, (note - 69) / 12); }

/* VISUAL HIGHLIGHTING - smooth playhead movement & pad pulse */
function highlightStep(step) {
  resetHighlights();
  const rects = svgGrid.querySelectorAll(`[data-step="${step}"]`);
  rects.forEach(r => r.classList.add("highlight"));

  // update playhead with transition (use attribute + CSS transition)
  if (playheadElement) {
    const x = step * svgColWidth;
    playheadElement.setAttribute('x', x);
    playheadElement.setAttribute('width', svgColWidth);
  }
  updatePosition(step);
}
function resetHighlights() {
  svgGrid.querySelectorAll(".highlight").forEach(r => r.classList.remove("highlight"));
}

/* updateStatusBar & position (unchanged) */
function updateStatusBar() {
  const trackCountEl = document.getElementById("trackCount");
  const bpmDisplay = document.getElementById("bpmDisplay");
  const playStatus = document.getElementById("playStatus");
  if (trackCountEl) trackCountEl.textContent = sequencerData.length;
  if (bpmDisplay) bpmDisplay.textContent = bpm;
  if (playStatus) { playStatus.textContent = isPlaying ? "Playing" : "Stopped"; playStatus.classList.toggle("playing", isPlaying); }
}
function updatePosition(step) {
  const position = document.getElementById("position");
  if (!position) return;
  const bar = Math.floor(step / 16) + 1;
  const beat = Math.floor((step % 16) / 4) + 1;
  const sixteenth = (step % 4) + 1;
  position.textContent = `${bar}.${beat}.${sixteenth}`;
}

/* CONTROLS (unchanged) */
function setupControls(){
  document.getElementById("playBtn").addEventListener("click", () => { startSequencer(); updateStatusBar(); });
  document.getElementById("stopBtn").addEventListener("click", () => { stopSequencer(); updateStatusBar(); });
  document.getElementById("exportBtn").addEventListener("click", exportPattern);
  document.getElementById("bpm").addEventListener("change", e => {
    bpm = parseInt(e.target.value); updateStatusBar();
    if (isPlaying) { stopSequencer(); setTimeout(()=>startSequencer(), 80); }
  });
}

/* ADVANCED CONTROLS (unchanged, re-used) */
function setupAdvancedControls() {
  const loadDataBtn = document.getElementById("loadDataBtn");
  const recordMidiBtn = document.getElementById("recordMidiBtn");
  const stopRecordBtn = document.getElementById("stopRecordBtn");
  const exportMidiBtn = document.getElementById("exportMidiBtn");
  const quantizeSelect = document.getElementById("quantize");
  if (!useAdvancedEngine || !audioEngine) {
    if (loadDataBtn) loadDataBtn.disabled = true;
    if (recordMidiBtn) recordMidiBtn.disabled = true;
    if (stopRecordBtn) stopRecordBtn.disabled = true;
    if (exportMidiBtn) exportMidiBtn.disabled = true;
    return;
  }
  if (loadDataBtn) {
    loadDataBtn.addEventListener("click", async () => {
      try {
        const [drumData, bassData, chordData] = await Promise.all([
          dataManager.loadData("drums"),
          dataManager.loadData("bass"),
          dataManager.loadData("chords")
        ]);
        const drumTracks = DrumAdapter.loadFromJSON(drumData, bpm);
        const bassTracks = BassAdapter.loadFromJSON(bassData, bpm);
        const chordTracks = ChordAdapter.loadFromJSON(chordData, bpm);
        allTracks = [...drumTracks, bassTracks[0], chordTracks[0]].filter(Boolean);
        audioEngine.loadTracks(allTracks);
        updateStatusBar();
        alert(`Loaded ${allTracks.length} tracks!`);
      } catch (e) { console.error("Error loading data:", e); alert("Error loading data: " + e.message); }
    });
  }
  if (recordMidiBtn) {
    recordMidiBtn.addEventListener("click", () => {
      if (audioEngine) { audioEngine.startRecording(); recordMidiBtn.style.background = "#ff0055"; console.log("MIDI recording started"); }
    });
  }
  if (stopRecordBtn) {
    stopRecordBtn.addEventListener("click", () => {
      if (audioEngine) {
        const quantize = quantizeSelect.value;
        const pattern = audioEngine.stopRecordingAndQuantize({ quantize, bpm });
        recordMidiBtn.style.background = "";
        const newTrack = { id: "midi_recording_" + Date.now(), title: "MIDI Recording", pattern, bpm, meta: { type: "midi" } };
        allTracks.push(newTrack);
        audioEngine.loadTracks(allTracks);
        alert(`Recorded ${pattern.length} notes`);
      }
    });
  }
  if (exportMidiBtn) {
    exportMidiBtn.addEventListener("click", () => {
      if (exportManager && allTracks.length > 0) exportManager.exportMIDI(allTracks, bpm, "beatbuilder_export.mid");
      else alert("No tracks to export. Load data first!");
    });
  }
  if (quantizeSelect) {
    quantizeSelect.addEventListener("change", (e) => { if (audioEngine) audioEngine.setQuantize(e.target.value); });
  }
}

/* EXPORT pattern (unchanged) */
function exportPattern() {
  if (useAdvancedEngine && exportManager && audioEngine) {
    const session = audioEngine.exportSession();
    exportManager.exportJSON(session, "beatbuilder_session.json");
  } else {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sequencerData, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "pattern.json");
    dlAnchor.click();
  }
}

/* MIDI input (unchanged) */
async function setupMIDI() {
  if (navigator.requestMIDIAccess) {
    try {
      midiAccess = await navigator.requestMIDIAccess();
      midiAccess.inputs.forEach(input => { input.onmidimessage = handleMIDIMessage; });
    } catch (err) { console.warn("MIDI access denied:", err); }
  }
}
function handleMIDIMessage(event) {
  const [status, note, velocity] = event.data;
  const cmd = status >> 4;
  const channel = status & 0xf;
  if (cmd === 9 && velocity > 0) { activeNotes.add(note); triggerSound("midi", note); }
  else if (cmd === 8 || velocity === 0) { activeNotes.delete(note); }
}

/* Utility: debounce */
function debounce(fn, wait=100){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }

/* Responsive resize for sequencer */
function resizeSequencer(){
  // redraw grid preserving pattern
  drawGrid();
}

/* Small helper to debounce redraw on resize (already wired above) */
function hideTooltip(){ if (tooltipEl && tooltipEl.parentNode) tooltipEl.parentNode.removeChild(tooltipEl); tooltipEl = null; }

/* End of file */
