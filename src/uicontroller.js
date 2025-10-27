// src/uicontroller.js - Handles all UI interactions

export class UIController {
  constructor(appState, audioEngine, libraryManager) {
    this.state = appState;
    this.audio = audioEngine;
    this.library = libraryManager;
    
    this.elements = this.cacheElements();
    this.setupEventListeners();
  }

  cacheElements() {
    return {
      playButton: document.getElementById('play-button'),
      stopButton: document.getElementById('stop-button'),
      bpmInput: document.getElementById('bpm-input'),
      
      libraryToggle: document.getElementById('library-toggle'),
      libraryPanel: document.getElementById('library-panel'),
      
      recordButton: document.getElementById('record-button'),
      recordStopButton: document.getElementById('record-stop-button'),
      quantizeSelect: document.getElementById('quantize-select'),
      
      exportJsonButton: document.getElementById('export-json'),
      exportMidiButton: document.getElementById('export-midi'),
      
      statusBar: document.getElementById('status-bar'),
      sequencerContainer: document.getElementById('sequencer-container')
    };
  }

  setupEventListeners() {
    // Playback controls
    this.elements.playButton.addEventListener('click', () => this.handlePlay());
    this.elements.stopButton.addEventListener('click', () => this.handleStop());
    this.elements.bpmInput.addEventListener('change', (e) => this.handleBPMChange(e));

    // Library controls
    this.elements.libraryToggle.addEventListener('click', () => this.toggleLibrary());

    // MIDI controls
    this.elements.recordButton.addEventListener('click', () => this.handleRecord());
    this.elements.recordStopButton.addEventListener('click', () => this.handleRecordStop());
    this.elements.quantizeSelect.addEventListener('change', (e) => {
      this.state.set('quantizeValue', e.target.value);
    });

    // Export controls
    this.elements.exportJsonButton.addEventListener('click', () => this.handleExportJSON());
    this.elements.exportMidiButton.addEventListener('click', () => this.handleExportMIDI());

    // State listeners
    this.state.subscribe('isPlaying', (playing) => this.updatePlayButton(playing));
    this.state.subscribe('bpm', (bpm) => this.updateBPMDisplay(bpm));
    this.state.subscribe('currentBeat', (beat) => this.updateStatusBar(beat));
  }

  handlePlay() {
    if (!this.state.get('isPlaying')) {
      this.audio.startPlayback();
      this.state.set('isPlaying', true);
    }
  }

  handleStop() {
    if (this.state.get('isPlaying')) {
      this.audio.stopPlayback();
      this.state.set('isPlaying', false);
      this.state.set('currentBeat', 0);
    }
  }

  handleBPMChange(event) {
    const bpm = parseInt(event.target.value, 10);
    if (bpm >= 60 && bpm <= 200) {
      this.state.set('bpm', bpm);
      this.audio.setBPM(bpm);
    }
  }

  toggleLibrary() {
    const visible = !this.state.get('libraryVisible');
    this.state.set('libraryVisible', visible);
    this.elements.libraryPanel.classList.toggle('visible', visible);
  }

  handleRecord() {
    this.audio.startRecording();
    this.state.set('isRecording', true);
    this.elements.recordButton.classList.add('recording');
  }

  handleRecordStop() {
    const recordedNotes = this.audio.stopRecording();
    this.state.set('isRecording', false);
    this.elements.recordButton.classList.remove('recording');
    
    // Add recorded notes to current track
    // (Implementation depends on track selection logic)
  }

  handleExportJSON() {
    const data = this.state.toJSON();
    this.downloadFile(
      JSON.stringify(data, null, 2),
      `beatbuilder-${Date.now()}.json`,
      'application/json'
    );
  }

  handleExportMIDI() {
    // Use ExportManager to generate MIDI
    // (Existing implementation)
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  updatePlayButton(playing) {
    this.elements.playButton.textContent = playing ? '⏸ Pause' : '▶ Play';
  }

  updateBPMDisplay(bpm) {
    this.elements.bpmInput.value = bpm;
  }

  updateStatusBar(beat) {
    const bar = Math.floor(beat / 4) + 1;
    const beatInBar = (beat % 4) + 1;
    this.elements.statusBar.textContent = `Bar ${bar}, Beat ${beatInBar}`;
  }
}