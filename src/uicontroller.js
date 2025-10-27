// src/uicontroller.js - UI event handling and state binding (Refactored for v0.3.0)

export class UIController {
  constructor(appState, audioEngine, exportManager, libraryManager) {
    this.state = appState;
    this.audio = audioEngine;
    this.export = exportManager;
    this.library = libraryManager;
    this.elementCache = {};

    this.cacheElements();
    this.setupEventListeners();
    this.setupStateSubscriptions();
    this.renderInitialState();
  }

  /**
   * Cache all necessary DOM elements.
   */
  cacheElements() {
    this.elementCache = {
      playBtn: document.getElementById('play-button'),
      stopBtn: document.getElementById('stop-button'),
      bpmInput: document.getElementById('bpm-input'),
      libraryToggleBtn: document.getElementById('library-toggle'),
      exportJsonBtn: document.getElementById('export-json'),
      exportMidiBtn: document.getElementById('export-midi'),
      libraryPanel: document.getElementById('library-panel'),
      statusBar: document.getElementById('status-bar'),
      trackCount: document.getElementById('track-count'),
      // Assuming record buttons are not in index.html yet, but good to check
      // recordButton: document.getElementById('record-button'),
    };
  }

  /**
   * Set up all global event listeners.
   */
  setupEventListeners() {
    const { playBtn, stopBtn, bpmInput, libraryToggleBtn, exportJsonBtn, exportMidiBtn } = this.elementCache;

    if (playBtn) playBtn.addEventListener('click', () => this.handlePlay());
    if (stopBtn) stopBtn.addEventListener('click', () => this.handleStop());
    if (bpmInput) bpmInput.addEventListener('change', (e) => this.handleBPMChange(e.target.value));
    if (libraryToggleBtn) libraryToggleBtn.addEventListener('click', () => this.handleLibraryToggle());
    if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => this.handleExport('json'));
    if (exportMidiBtn) exportMidiBtn.addEventListener('click', () => this.handleExport('midi'));

    // Prevent form submission on enter in BPM field
    if (bpmInput) {
      bpmInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') e.preventDefault();
      });
    }
  }

  /**
   * Set up subscriptions to AppState changes.
   */
  setupStateSubscriptions() {
    this.state.subscribe('isPlaying', (isPlaying) => this.updatePlayButton(isPlaying));
    this.state.subscribe('bpm', (bpm) => this.updateBPMInput(bpm));
    this.state.subscribe('tracks', (tracks) => this.updateTrackCount(tracks));
    this.state.subscribe('all', (value, key) => {
      // General status updates for all state changes, useful for debugging/logging
      // this.updateStatus(`State changed: ${key} = ${value}`);
    });
  }

  /**
   * Render the initial state of UI elements.
   */
  renderInitialState() {
    this.updatePlayButton(this.state.get('isPlaying'));
    this.updateBPMInput(this.state.get('bpm'));
    this.updateTrackCount(this.state.get('tracks'));
    this.updateStatus('Ready to build a beat!');
  }

  // --- Handlers ---

  handlePlay() {
    if (this.state.get('isPlaying')) {
      this.audio.stop();
      this.state.set('isPlaying', false);
    } else {
      this.audio.start(this.state.get('bpm'));
      this.state.set('isPlaying', true);
    }
  }

  handleStop() {
    this.audio.stop();
    this.state.set('isPlaying', false);
    this.state.set('currentBeat', 0); // Reset playhead
  }

  handleBPMChange(newBPM) {
    const bpm = parseInt(newBPM, 10);
    if (!isNaN(bpm) && bpm >= 60 && bpm <= 200) {
      this.state.set('bpm', bpm);
      // The audio engine needs an update method for BPM while playing
      // For now, we assume it's handled by main.js/audioengine
    } else {
      // Revert input to current state value if invalid
      this.updateBPMInput(this.state.get('bpm'));
    }
  }

  handleLibraryToggle() {
    const panel = this.elementCache.libraryPanel;
    if (panel) {
      // The 'open' class will be defined in style.css in Part 3
      panel.classList.toggle('open'); 
      this.elementCache.libraryToggleBtn.classList.toggle('active');
    }
  }

  handleExport(type) {
    const tracks = this.state.get('tracks');
    
    if (type === 'json') {
      // The state object itself has the toJSON method for export
      const data = this.state.toJSON(); 
      this.export.exportJSON(data, 'beatbuilder_session.json');
      this.updateStatus('Session exported to JSON.');
    } else if (type === 'midi') {
      // Assuming exportManager has a method that takes tracks and converts to MIDI
      this.export.exportMIDI(tracks, 'beatbuilder_pattern.mid');
      this.updateStatus('Tracks exported to MIDI.');
    }
  }

  // --- State Updaters (UI Rendering) ---

  updatePlayButton(isPlaying) {
    const btn = this.elementCache.playBtn;
    if (btn) {
      btn.textContent = isPlaying ? '❚❚ Pause' : '▶ Play';
      btn.classList.toggle('btn-success', isPlaying);
      btn.classList.toggle('btn-primary', !isPlaying);
    }
  }

  updateBPMInput(bpm) {
    const input = this.elementCache.bpmInput;
    if (input && document.activeElement !== input) {
      input.value = bpm;
    }
  }

  updateTrackCount(tracks) {
    const countSpan = this.elementCache.trackCount;
    if (countSpan) {
      countSpan.textContent = `${tracks.length} tracks`;
    }
  }

  updateStatus(message) {
    const statusSpan = this.elementCache.statusBar;
    if (statusSpan) {
      statusSpan.textContent = message;
    }
  }
}
