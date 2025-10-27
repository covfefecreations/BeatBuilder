// visualSequencer.js
// Multi-track SVG Sequencer with live editing and JSON integration

export default class VisualSequencer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.tracks = [];
    this.zoom = 40; // pixels per beat
    this.heightPerTrack = 80;
    this.quantizeStep = 0.25; // quarter-beat resolution
    this.cursor = null;
    this.playheadTime = 0;
    this.isPlaying = false;
    this.svgNS = "http://www.w3.org/2000/svg";
  }

  loadTracks(trackArray) {
    this.tracks = trackArray;
    this.render();
  }

  render() {
    this.container.innerHTML = "";
    const svg = document.createElementNS(this.svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", this.tracks.length * this.heightPerTrack);
    svg.style.background = "#111";

    // render grid
    this.renderGrid(svg);

    // render each track
    this.tracks.forEach((track, i) => {
      this.renderTrack(svg, track, i);
    });

    // playback cursor
    this.cursor = document.createElementNS(this.svgNS, "rect");
    this.cursor.setAttribute("x", 0);
    this.cursor.setAttribute("y", 0);
    this.cursor.setAttribute("width", 2);
    this.cursor.setAttribute("height", this.tracks.length * this.heightPerTrack);
    this.cursor.setAttribute("fill", "#fff");
    this.cursor.setAttribute("opacity", "0.3");
    svg.appendChild(this.cursor);

    this.container.appendChild(svg);
    this.svg = svg;
  }

  renderGrid(svg) {
    const totalBeats = 64;
    const grid = document.createElementNS(this.svgNS, "g");

    for (let i = 0; i <= totalBeats; i++) {
      const line = document.createElementNS(this.svgNS, "line");
      line.setAttribute("x1", i * this.zoom);
      line.setAttribute("y1", 0);
      line.setAttribute("x2", i * this.zoom);
      line.setAttribute("y2", this.tracks.length * this.heightPerTrack);
      line.setAttribute("stroke", i % 4 === 0 ? "#444" : "#222");
      line.setAttribute("stroke-width", i % 4 === 0 ? 1.2 : 0.5);
      grid.appendChild(line);
    }

    svg.appendChild(grid);
  }

  renderTrack(svg, track, trackIndex) {
    const yOffset = trackIndex * this.heightPerTrack;
    const group = document.createElementNS(this.svgNS, "g");
    group.setAttribute("transform", `translate(0, ${yOffset})`);

    const label = document.createElementNS(this.svgNS, "text");
    label.setAttribute("x", 10);
    label.setAttribute("y", 18); // Adjusted y position
    label.setAttribute("fill", "#ccc");
    label.textContent = track.title;
    group.appendChild(label);

    track.pattern.forEach((note) => {
      const rect = document.createElementNS(this.svgNS, "rect");
      rect.setAttribute("x", note.time * this.zoom);
      rect.setAttribute("y", 20); // Adjusted y position
      rect.setAttribute("width", note.duration * this.zoom); // FIX: Use note.duration for width
      rect.setAttribute("height", 40);
      rect.setAttribute("fill", track.color);
      rect.setAttribute("opacity", note.active ? "0.8" : "0.3");
      rect.style.cursor = "pointer";

      rect.addEventListener("click", () => {
        note.active = !note.active;
        rect.setAttribute("opacity", note.active ? "0.8" : "0.3");
        this.emitUpdate();
      });

      // Drag and quantize
      rect.addEventListener("mousedown", (e) => this.startDrag(e, note, rect));

      group.appendChild(rect);
    });

    svg.appendChild(group);
  }

  startDrag(e, note, rect) {
    const startX = e.clientX;
    const origTime = note.time;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const deltaBeats = dx / this.zoom;
      let newTime = origTime + deltaBeats;

      // quantize
      newTime = Math.round(newTime / this.quantizeStep) * this.quantizeStep;
      note.time = Math.max(0, newTime);

      rect.setAttribute("x", note.time * this.zoom);
      this.emitUpdate();
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  emitUpdate() {
    const event = new CustomEvent("sequencerUpdate", {
      detail: this.tracks,
    });
    this.container.dispatchEvent(event);
  }

  updateCursor(time) {
    if (!this.cursor) return;
    this.cursor.setAttribute("x", time * this.zoom);
  }

  play() {
    this.isPlaying = true;
    const startTime = performance.now();

    const tick = () => {
      if (!this.isPlaying) return;
      const elapsed = (performance.now() - startTime) / 1000;
      this.playheadTime = elapsed * 2; // 2 beats per second (120 BPM)
      this.updateCursor(this.playheadTime);
      requestAnimationFrame(tick);
    };

    tick();
  }

  stop() {
    this.isPlaying = false;
    this.playheadTime = 0;
    this.updateCursor(0);
  }
}
