// visualSequencer.js
// Multi-track SVG Sequencer with live editing and JSON integration

export default class VisualSequencer {
	  constructor(container, appState) {
	    this.container = container;
	    this.appState = appState;
	    this.appState.subscribe('tracks', (tracks) => this.loadTracks(tracks));
	    this.appState.subscribe('currentBeat', (beat) => this.updateCursor(beat));
	    this.appState.subscribe('isPlaying', (playing) => this.handlePlaybackState(playing));
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
    this.noteRects = new Map(); // Store references to note rects for real-time highlighting
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
	    
	    // Render track controls panel
	    this.renderTrackControls();

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
	    
	    // Add event listeners for track controls
	    this.container.addEventListener('click', (e) => {
	      const btn = e.target.closest('.track-btn');
	      if (btn) {
	        const trackId = btn.dataset.trackId;
	        if (btn.classList.contains('mute-btn')) {
	          this.appState.toggleTrackMute(trackId);
	        } else if (btn.classList.contains('solo-btn')) {
	          this.appState.toggleTrackSolo(trackId);
	        }
	      }
	    });
	    
	    this.container.addEventListener('input', (e) => {
	      const slider = e.target.closest('.volume-slider');
	      if (slider) {
	        const trackId = slider.dataset.trackId;
	        this.appState.setTrackVolume(trackId, parseFloat(slider.value));
	      }
	    });
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
	    const isAudible = this.appState.isTrackAudible(track.id);
	    const opacity = isAudible ? 1.0 : 0.4; // Dim the track if not audible
    const yOffset = trackIndex * this.heightPerTrack;
    const group = document.createElementNS(this.svgNS, "g");
    group.setAttribute("transform", `translate(0, ${yOffset})`);

	    const label = document.createElementNS(this.svgNS, "text");
	    label.setAttribute("x", 10);
	    label.setAttribute("y", 18); // Adjusted y position
	    label.setAttribute("fill", "#ccc");
	    label.textContent = track.title;
	    group.appendChild(label);
	    
	    // Track background to show loaded state
	    const trackBg = document.createElementNS(this.svgNS, "rect");
	    trackBg.setAttribute("x", 0);
	    trackBg.setAttribute("y", 0);
	    trackBg.setAttribute("width", "100%");
	    trackBg.setAttribute("height", this.heightPerTrack);
	    trackBg.setAttribute("fill", track.color);
	    trackBg.setAttribute("opacity", "0.05");
	    group.insertBefore(trackBg, label);

    track.pattern.forEach((note) => {
      const rect = document.createElementNS(this.svgNS, "rect");
      const key = `${track.id}-${note.time}-${note.duration}`;
      this.noteRects.set(key, rect);
      rect.setAttribute("x", note.time * this.zoom);
      rect.setAttribute("y", 20); // Adjusted y position
      rect.setAttribute("width", note.duration * this.zoom); // FIX: Use note.duration for width
      rect.setAttribute("height", 40);
	      rect.setAttribute("fill", track.color);
	      rect.setAttribute("opacity", note.active ? (isAudible ? "0.8" : "0.3") : "0.1"); // Dim notes if not audible
      rect.style.cursor = "pointer";

      rect.addEventListener("click", () => {
        note.active = !note.active;
        rect.setAttribute("opacity", note.active ? "0.8" : "0.3");
        this.emitUpdate();
        // Rerender to update the track's visual state
        this.loadTracks(this.appState.get('tracks'));
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
	    // Scroll the container to keep the playhead in view
	    const containerWidth = this.container.clientWidth;
	    const scrollPos = time * this.zoom - containerWidth / 2;
	    this.container.scrollLeft = scrollPos;
	  }
	  
	  renderTrackControls() {
	    // Use the pre-existing container from index.html
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
	            <button class="track-btn mute-btn ${isMuted ? 'active' : ''} ${isForcedMute ? 'forced-mute' : ''}" data-track-id="${track.id}">M</button>
	            <button class="track-btn solo-btn ${isSolo ? 'active' : ''}" data-track-id="${track.id}">S</button>
	          </div>
	          <input type="range" min="0" max="1" step="0.01" value="${volume}" class="volume-slider" data-track-id="${track.id}">
	        </div>
	      `;
	    }).join('');
	  }
	  
	  // Override loadTracks to also call renderTrackControls
	  loadTracks(trackArray) {
	    this.tracks = trackArray;
	    this.render();
	    this.renderTrackControls();
	  }
	  
	  // Override render to remove the old track controls container if it exists
	  render() {
	    this.container.innerHTML = "";
	    this.noteRects = new Map(); // Store references to note rects for real-time highlighting
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
	    
	    // Render track controls panel
	    this.renderTrackControls();
	
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
	    
	    // The event listeners for track controls are now handled by the UIController or attached to the controlsContainer
	    // We will keep the logic in VisualSequencer for now, but attach it to the controlsContainer in the next step.
	  }
  }

  handlePlaybackState(isPlaying) {
    this.isPlaying = isPlaying;
    if (!isPlaying) {
      this.playheadTime = 0;
      this.updateCursor(0);
    }
  }

  // New method to handle real-time note highlighting
  highlightNote(trackId, noteTime, duration, highlight = true) {
    const key = `${trackId}-${noteTime}-${duration}`;
    const rect = this.noteRects.get(key);
    if (rect) {
      rect.setAttribute('opacity', highlight ? '1.0' : '0.8');
      rect.setAttribute('stroke', highlight ? '#fff' : 'none');
      rect.setAttribute('stroke-width', highlight ? '2' : '0');
    }
  }
}
