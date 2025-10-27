// visualSequencer.js
// Multi-track SVG Sequencer with refined visual design and live editing

export default class VisualSequencer {
  constructor(container, appState) {
    this.container = container;
    this.appState = appState;
    
    // Subscribe to app state changes
    this.appState.subscribe('tracks', (tracks) => this.loadTracks(tracks));
    this.appState.subscribe('currentBeat', (beat) => this.updateCursor(beat));
    this.appState.subscribe('isPlaying', (playing) => this.handlePlaybackState(playing));
    
    // Core properties
    this.tracks = [];
    this.noteRects = new Map(); // Store references to note rects for real-time highlighting
    
    // Visual configuration
    this.zoom = 40; // pixels per beat
    this.heightPerTrack = 80;
    this.quantizeStep = 0.25; // quarter-beat resolution
    
    // Playback state
    this.cursor = null;
    this.playheadTime = 0;
    this.isPlaying = false;
    
    // SVG namespace
    this.svgNS = "http://www.w3.org/2000/svg";
  }

  loadTracks(trackArray) {
    this.tracks = trackArray;
    this.render();
    this.renderTrackControls();
  }

  render() {
    // Clear container
    this.container.innerHTML = "";
    this.noteRects = new Map();
    
    // Create SVG canvas
    const svg = document.createElementNS(this.svgNS, "svg");
    const svgHeight = this.tracks.length * this.heightPerTrack;
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", svgHeight);
    svg.style.background = "var(--bg-primary)";
    svg.style.display = "block";

    // Render grid
    this.renderGrid(svg);

    // Render each track
    this.tracks.forEach((track, i) => {
      this.renderTrack(svg, track, i);
    });

    // Render playback cursor
    this.cursor = document.createElementNS(this.svgNS, "rect");
    this.cursor.setAttribute("x", 0);
    this.cursor.setAttribute("y", 0);
    this.cursor.setAttribute("width", 2);
    this.cursor.setAttribute("height", svgHeight);
    this.cursor.setAttribute("fill", "var(--accent)");
    this.cursor.setAttribute("opacity", "0.8");
    this.cursor.setAttribute("class", "playhead");
    svg.appendChild(this.cursor);

    this.container.appendChild(svg);
    this.svg = svg;
  }

  renderGrid(svg) {
    const totalBeats = 64;
    const grid = document.createElementNS(this.svgNS, "g");
    grid.setAttribute("class", "sequencer-grid");

    // Vertical beat lines
    for (let i = 0; i <= totalBeats; i++) {
      const line = document.createElementNS(this.svgNS, "line");
      const x = i * this.zoom;
      line.setAttribute("x1", x);
      line.setAttribute("y1", 0);
      line.setAttribute("x2", x);
      line.setAttribute("y2", this.tracks.length * this.heightPerTrack);
      
      // Emphasize every 4th beat (bar lines)
      if (i % 4 === 0) {
        line.setAttribute("stroke", "var(--line-emphasis)");
        line.setAttribute("stroke-width", 1.5);
        line.setAttribute("class", "grid-line emphasis");
      } else {
        line.setAttribute("stroke", "var(--line)");
        line.setAttribute("stroke-width", 1);
        line.setAttribute("class", "grid-line");
      }
      
      grid.appendChild(line);
      
      // Add beat numbers at the top for emphasized lines
      if (i % 4 === 0 && i > 0) {
        const beatLabel = document.createElementNS(this.svgNS, "text");
        beatLabel.setAttribute("x", x);
        beatLabel.setAttribute("y", 12);
        beatLabel.setAttribute("fill", "var(--text-tertiary)");
        beatLabel.setAttribute("font-size", "10");
        beatLabel.setAttribute("font-weight", "500");
        beatLabel.setAttribute("text-anchor", "middle");
        beatLabel.textContent = i;
        grid.appendChild(beatLabel);
      }
    }

    // Horizontal track separator lines
    for (let i = 1; i < this.tracks.length; i++) {
      const line = document.createElementNS(this.svgNS, "line");
      const y = i * this.heightPerTrack;
      line.setAttribute("x1", 0);
      line.setAttribute("y1", y);
      line.setAttribute("x2", totalBeats * this.zoom);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "var(--line)");
      line.setAttribute("stroke-width", 1);
      line.setAttribute("class", "grid-line");
      grid.appendChild(line);
    }

    svg.appendChild(grid);
  }

  renderTrack(svg, track, trackIndex) {
    const isAudible = this.appState.isTrackAudible(track.id);
    const yOffset = trackIndex * this.heightPerTrack;
    const group = document.createElementNS(this.svgNS, "g");
    group.setAttribute("transform", `translate(0, ${yOffset})`);
    group.setAttribute("class", `track-group ${isAudible ? '' : 'track-muted'}`);

    // Track background for visual separation
    const trackBg = document.createElementNS(this.svgNS, "rect");
    trackBg.setAttribute("x", 0);
    trackBg.setAttribute("y", 0);
    trackBg.setAttribute("width", 64 * this.zoom);
    trackBg.setAttribute("height", this.heightPerTrack);
    trackBg.setAttribute("fill", isAudible ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.01)");
    trackBg.setAttribute("class", "track-background");
    group.appendChild(trackBg);

    // Track label
    const label = document.createElementNS(this.svgNS, "text");
    label.setAttribute("x", 10);
    label.setAttribute("y", 22);
    label.setAttribute("fill", isAudible ? "var(--text-secondary)" : "var(--text-tertiary)");
    label.setAttribute("font-size", "11");
    label.setAttribute("font-weight", "600");
    label.setAttribute("opacity", isAudible ? "0.7" : "0.4");
    label.setAttribute("class", "track-label-svg");
    label.textContent = track.title;
    group.appendChild(label);

    // Render notes
    track.pattern.forEach((note) => {
      this.renderNote(group, track, note, isAudible);
    });

    svg.appendChild(group);
  }

  renderNote(group, track, note, isAudible) {
    const rect = document.createElementNS(this.svgNS, "rect");
    const key = `${track.id}-${note.time}-${note.duration}`;
    this.noteRects.set(key, rect);

    // Position and size
    const x = note.time * this.zoom;
    const y = 30;
    const width = note.duration * this.zoom - 2; // 2px gap between notes
    const height = 44;

    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", Math.max(width, 2)); // Minimum 2px width
    rect.setAttribute("height", height);
    rect.setAttribute("rx", 3); // Subtle rounding
    rect.setAttribute("ry", 3);

    // Visual state based on active/inactive and audibility
    if (note.active) {
      if (isAudible) {
        rect.setAttribute("fill", "var(--accent)");
        rect.setAttribute("opacity", "0.8");
        rect.setAttribute("stroke", "var(--accent-bright)");
        rect.setAttribute("stroke-width", "1");
      } else {
        rect.setAttribute("fill", "var(--accent-dim)");
        rect.setAttribute("opacity", "0.3");
        rect.setAttribute("stroke", "var(--line)");
        rect.setAttribute("stroke-width", "1");
      }
    } else {
      rect.setAttribute("fill", "transparent");
      rect.setAttribute("opacity", "1");
      rect.setAttribute("stroke", "var(--line)");
      rect.setAttribute("stroke-width", "1");
    }

    rect.setAttribute("class", `step-cell ${note.active ? 'active' : ''}`);
    rect.style.cursor = "pointer";
    rect.style.transition = "all 0.15s ease";

    // Click to toggle note
    rect.addEventListener("click", (e) => {
      e.stopPropagation();
      note.active = !note.active;
      this.updateNoteVisual(rect, note, isAudible);
      this.emitUpdate();
    });

    // Hover effect
    rect.addEventListener("mouseenter", () => {
      if (note.active) {
        rect.setAttribute("stroke", "var(--accent-bright)");
        rect.setAttribute("stroke-width", "2");
      } else {
        rect.setAttribute("stroke", "var(--accent-bright)");
        rect.setAttribute("stroke-width", "2");
      }
    });

    rect.addEventListener("mouseleave", () => {
      if (note.active) {
        rect.setAttribute("stroke", isAudible ? "var(--accent-bright)" : "var(--line)");
        rect.setAttribute("stroke-width", "1");
      } else {
        rect.setAttribute("stroke", "var(--line)");
        rect.setAttribute("stroke-width", "1");
      }
    });

    // Drag to reposition note
    rect.addEventListener("mousedown", (e) => this.startDrag(e, note, rect, track, isAudible));

    group.appendChild(rect);
  }

  updateNoteVisual(rect, note, isAudible) {
    if (note.active) {
      if (isAudible) {
        rect.setAttribute("fill", "var(--accent)");
        rect.setAttribute("opacity", "0.8");
        rect.setAttribute("stroke", "var(--accent-bright)");
        rect.setAttribute("stroke-width", "1");
      } else {
        rect.setAttribute("fill", "var(--accent-dim)");
        rect.setAttribute("opacity", "0.3");
        rect.setAttribute("stroke", "var(--line)");
        rect.setAttribute("stroke-width", "1");
      }
      rect.setAttribute("class", "step-cell active");
    } else {
      rect.setAttribute("fill", "transparent");
      rect.setAttribute("opacity", "1");
      rect.setAttribute("stroke", "var(--line)");
      rect.setAttribute("stroke-width", "1");
      rect.setAttribute("class", "step-cell");
    }
  }

  startDrag(e, note, rect, track, isAudible) {
    e.stopPropagation();
    const startX = e.clientX;
    const origTime = note.time;

    // Visual feedback during drag
    rect.setAttribute("opacity", "0.6");
    rect.style.cursor = "grabbing";

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const deltaBeats = dx / this.zoom;
      let newTime = origTime + deltaBeats;

      // Quantize to step
      newTime = Math.round(newTime / this.quantizeStep) * this.quantizeStep;
      newTime = Math.max(0, Math.min(newTime, 63)); // Clamp to grid

      note.time = newTime;
      rect.setAttribute("x", note.time * this.zoom);
      this.emitUpdate();
    };

    const onUp = () => {
      // Restore visual state
      this.updateNoteVisual(rect, note, isAudible);
      rect.style.cursor = "pointer";
      
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
    
    const cursorX = time * this.zoom;
    this.cursor.setAttribute("x", cursorX);
    
    // Auto-scroll to keep playhead in view
    const containerWidth = this.container.clientWidth;
    const scrollPos = cursorX - containerWidth / 2;
    
    // Smooth scroll
    if (this.isPlaying) {
      this.container.scrollTo({
        left: Math.max(0, scrollPos),
        behavior: 'smooth'
      });
    }
  }

  renderTrackControls() {
    const controlsContainer = document.getElementById('track-controls-container');
    if (!controlsContainer) return;

    // Generate HTML for all track controls
    controlsContainer.innerHTML = this.tracks.map(track => {
      const isMuted = track.mute;
      const isSolo = track.solo;
      const isForcedMute = track.forcedMute;
      const volume = track.volume || 1;

      return `
        <div class="track-control-panel" data-track-id="${track.id}" style="height: ${this.heightPerTrack}px;">
          <div class="track-label">${track.title}</div>
          <div class="track-buttons">
            <button 
              class="track-btn mute-btn ${isMuted ? 'active' : ''} ${isForcedMute ? 'forced-mute' : ''}" 
              data-track-id="${track.id}"
              title="Mute track"
            >M</button>
            <button 
              class="track-btn solo-btn ${isSolo ? 'active' : ''}" 
              data-track-id="${track.id}"
              title="Solo track"
            >S</button>
          </div>
          <div class="volume-control">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value="${volume}" 
              class="volume-slider" 
              data-track-id="${track.id}"
              title="Volume: ${Math.round(volume * 100)}%"
            >
          </div>
        </div>
      `;
    }).join('');

    // Attach event listeners
    this.attachControlListeners(controlsContainer);
  }

  attachControlListeners(controlsContainer) {
    // Mute/Solo buttons
    controlsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.track-btn');
      if (!btn) return;

      const trackId = btn.dataset.trackId;
      
      if (btn.classList.contains('mute-btn')) {
        this.appState.toggleTrackMute(trackId);
      } else if (btn.classList.contains('solo-btn')) {
        this.appState.toggleTrackSolo(trackId);
      }

      // Refresh the entire sequencer to update visual states
      this.loadTracks(this.appState.get('tracks'));
    });

    // Volume sliders
    controlsContainer.addEventListener('input', (e) => {
      const slider = e.target.closest('.volume-slider');
      if (!slider) return;

      const trackId = slider.dataset.trackId;
      const volume = parseFloat(slider.value);
      
      // Update tooltip
      slider.setAttribute('title', `Volume: ${Math.round(volume * 100)}%`);
      
      this.appState.setTrackVolume(trackId, volume);
    });
  }

  handlePlaybackState(isPlaying) {
    this.isPlaying = isPlaying;
    
    if (!isPlaying) {
      this.playheadTime = 0;
      this.updateCursor(0);
      
      // Scroll back to start
      this.container.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
  }

  // Real-time note highlighting during playback
  highlightNote(trackId, noteTime, duration, highlight = true) {
    const key = `${trackId}-${noteTime}-${duration}`;
    const rect = this.noteRects.get(key);
    
    if (!rect) return;

    if (highlight) {
      // Brighten and emphasize during playback
      rect.setAttribute('opacity', '1.0');
      rect.setAttribute('stroke', 'var(--accent-bright)');
      rect.setAttribute('stroke-width', '2');
      rect.style.filter = 'brightness(1.2)';
    } else {
      // Return to normal state
      const note = this.findNote(trackId, noteTime, duration);
      const track = this.tracks.find(t => t.id === trackId);
      const isAudible = this.appState.isTrackAudible(trackId);
      
      if (note && track) {
        this.updateNoteVisual(rect, note, isAudible);
      }
      rect.style.filter = 'none';
    }
  }

  // Helper to find a note by trackId, time, and duration
  findNote(trackId, noteTime, duration) {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) return null;
    
    return track.pattern.find(
      n => n.time === noteTime && n.duration === duration
    );
  }

  // Utility: Get current zoom level (for future zoom controls)
  getZoom() {
    return this.zoom;
  }

  // Utility: Set zoom level (for future zoom controls)
  setZoom(newZoom) {
    this.zoom = Math.max(20, Math.min(newZoom, 100)); // Clamp between 20-100px per beat
    this.render();
    this.renderTrackControls();
  }

  // Utility: Destroy and clean up
  destroy() {
    if (this.svg) {
      this.svg.remove();
    }
    this.noteRects.clear();
    this.tracks = [];
  }
}