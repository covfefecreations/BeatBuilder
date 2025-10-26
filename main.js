import * as Tone from "https://cdn.skypack.dev/tone@14.8.39";

let svg, playhead;
let isPlaying = false;
let currentStep = 0;
let totalSteps = 16;
let tempo = 110;
let sequenceData = [];
let drumSampler;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  svg = document.getElementById("sequencer");
  playhead = createPlayhead();
  svg.appendChild(playhead);
  
  document.getElementById("loadJSON").addEventListener("click", loadJSON);
  document.getElementById("play").addEventListener("click", startPlayback);
  document.getElementById("stop").addEventListener("click", stopPlayback);
  document.getElementById("export").addEventListener("click", exportMIDI);

  await setupSampler();
}

async function setupSampler() {
  drumSampler = new Tone.Sampler({
    urls: {
      Kick: "https://tonejs.github.io/audio/drum-samples/breakbeat/Kick.wav",
      Snare: "https://tonejs.github.io/audio/drum-samples/breakbeat/Snare.wav",
      Hat: "https://tonejs.github.io/audio/drum-samples/breakbeat/HiHat.wav",
      Clap: "https://tonejs.github.io/audio/drum-samples/breakbeat/Clap.wav"
    },
    onload: () => console.log("Sampler loaded!")
  }).toDestination();
}

async function loadJSON() {
  const response = await fetch("drumkit.json");
  const data = await response.json();
  sequenceData = data.grooves[0].bars[0].notation; // First groove, first bar
  renderSequencer(sequenceData);
}

function renderSequencer(data) {
  svg.innerHTML = "";
  svg.appendChild(playhead);

  const rows = Object.keys(data);
  const cellWidth = 60;
  const cellHeight = 30;

  rows.forEach((instrument, rowIndex) => {
    for (let step = 0; step < 16; step++) {
      const x = step * cellWidth + 50;
      const y = rowIndex * cellHeight + 50;

      const isActive = data[instrument].split(" ")[step] === "X";
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", cellWidth - 4);
      rect.setAttribute("height", cellHeight - 4);
      rect.setAttribute("rx", 6);
      rect.setAttribute("ry", 6);
      rect.setAttribute("class", `note-cell ${isActive ? "note-active" : ""}`);
      rect.dataset.instrument = instrument;
      rect.dataset.step = step;

      rect.addEventListener("click", toggleNote);
      svg.appendChild(rect);
    }

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.textContent = instrument;
    label.setAttribute("x", 10);
    label.setAttribute("y", rowIndex * cellHeight + 70);
    label.setAttribute("fill", "#bbb");
    label.setAttribute("font-size", "12px");
    svg.appendChild(label);
  });
}

function toggleNote(e) {
  const rect = e.target;
  rect.classList.toggle("note-active");
  rect.classList.toggle("note-pulse");
  setTimeout(() => rect.classList.remove("note-pulse"), 300);
}

function createPlayhead() {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", 50);
  line.setAttribute("y1", 40);
  line.setAttribute("x2", 50);
  line.setAttribute("y2", 400);
  line.setAttribute("class", "playhead");
  return line;
}

function startPlayback() {
  if (isPlaying) return;
  isPlaying = true;
  Tone.Transport.bpm.value = tempo;
  Tone.Transport.scheduleRepeat(stepPlayback, "16n");
  Tone.Transport.start();
}

function stopPlayback() {
  isPlaying = false;
  Tone.Transport.stop();
  currentStep = 0;
  movePlayhead();
}

function stepPlayback(time) {
  movePlayhead();
  const activeNotes = Array.from(document.querySelectorAll(".note-active"));
  activeNotes.forEach((rect) => {
    const step = parseInt(rect.dataset.step);
    const instrument = rect.dataset.instrument;
    if (step === currentStep) {
      drumSampler.triggerAttack(instrument, time);
      animateCell(rect);
    }
  });

  currentStep = (currentStep + 1) % totalSteps;
}

function movePlayhead() {
  const x = currentStep * 60 + 50;
  playhead.setAttribute("x1", x);
  playhead.setAttribute("x2", x);
}

function animateCell(rect) {
  rect.classList.add("note-hit");
  setTimeout(() => rect.classList.remove("note-hit"), 150);
}

function exportMIDI() {
  alert("MIDI export coming soon!");
}