// main.js - BeatBuilder Application Orchestrator (Refactored for v0.3.0)

import { AudioEngine } from './src/audioengine.js';
import { MidiManager } from './src/midimanager.js';
import { ExportManager } from './src/exportmanager.js';
import { LibraryManager } from './src/librarymanager.js';
import { AppState } from './src/appstate.js'; // NEW
import { UIController } from './src/uicontroller.js'; // NEW
import PatternSelector from './src/patternselector.js';
import { VisualSequencer } from './src/visualsequencer.js';

// Import Adapters (assuming they exist and are needed for pattern conversion)
import { DrumAdapter } from './src/drumadapter.js';
import { BassAdapter } from './src/bassadapter.js';
import { ChordAdapter } from './src/chordadapter.js';
// Assuming a LeadAdapter is needed or will be created
import { LeadAdapter } from './src/leadadapter.js'; 

class BeatBuilderApp {
  constructor() {
    // 1. Initialize Core Modules
    this.state = new AppState();
    this.audioEngine = new AudioEngine();
    this.midiManager = new MidiManager(this.audioEngine);
    this.exportManager = new ExportManager();
    this.libraryManager = new LibraryManager();
    
    // 2. Initialize Adapters
    this.drumAdapter = new DrumAdapter();
    this.bassAdapter = new BassAdapter();
    this.chordAdapter = new ChordAdapter();
    this.leadAdapter = new LeadAdapter();

    // 3. Initialize UI/Coordination Modules
    this.uiController = new UIController(
      this.state,
      this.audioEngine,
      this.exportManager,
      this.libraryManager // Pass all necessary dependencies
    );
    this.visualSequencer = new VisualSequencer(
      document.getElementById('sequencer-container'),
      this.state
    );
    this.patternSelector = new PatternSelector(
      'library-panel', // Container ID
      this.libraryManager,
      { // Adapters object for preview
        drumAdapter: this.drumAdapter,
        bassAdapter: this.bassAdapter,
        chordAdapter: this.chordAdapter,
        leadAdapter: this.leadAdapter
      },
      this.audioEngine
    );
    this.patternSelector.onSelect((pattern) => this.loadPattern(pattern));
  }

  async init() {
    try {
      console.log('🚀 Initializing BeatBuilder v0.3.0 (Refactored)...');

      // Load library patterns (Part 1 complete)
      await this.libraryManager.loadAllPatterns();
      console.log('✅ Library loaded:', this.libraryManager.getStats());

      // Render UI components
      this.patternSelector.render();
      
      // 4. Load Session and Initial State
      if (this.state.loadFromLocalStorage()) {
        console.log('✅ Restored previous session');
        this.syncTracksToEngine(this.state.get('tracks'));
      } else {
        // Load a default pattern for demo if no session is found
        const defaultPattern = this.libraryManager.getPatternById('drum_chorus_syncopated');
        if (defaultPattern) {
          this.loadPattern(defaultPattern);
        }
      }
      
      // 5. Start Auto-Save (Part 2 Acceptance Criteria)
      this.startAutoSave();

      // 6. Final setup
      this.visualSequencer.loadTracks(this.state.get('tracks')); // FIX: Use loadTracks
      this.audioEngine.setBPM(this.state.get('bpm'));
      this.audioEngine.loadTracks(this.state.get('tracks')); // Load tracks into engine on init
      
      console.log('✅ BeatBuilder ready!');

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.uiController.updateStatus('Initialization failed. Check console.');
      alert('Failed to initialize BeatBuilder. Check console for details.');
    }
  }

  startAutoSave() {
    // Auto-save session every 30 seconds
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    this.autoSaveInterval = setInterval(() => {
      this.state.saveToLocalStorage();
    }, 30000);
  }

  loadPattern(pattern) {
    console.log('Loading pattern:', pattern.name);
    
    // Convert pattern to track format based on type
    let track;
    switch (pattern.type) {
      case 'drums':
        track = this.drumAdapter.convert(pattern);
        break;
      case 'bass':
        track = this.bassAdapter.convert(pattern);
        break;
      case 'chords':
        track = this.chordAdapter.convert(pattern);
        break;
      case 'leads':
        track = this.leadAdapter.convert(pattern); 
        break;
      default:
        console.warn('Unknown pattern type:', pattern.type);
        return;
    }

    // Add track to state
    const tracks = this.state.get('tracks');
    tracks.push(track);
    this.state.set('tracks', tracks); // State change triggers UIController/Sequencer updates

    this.syncTracksToEngine(tracks);
  }

  syncTracksToEngine(tracks) {
    // Update visual sequencer
    this.visualSequencer.loadTracks(tracks); // FIX: Use loadTracks

    // Load into audio engine
    this.audioEngine.loadTracks(tracks);
  }


}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.beatBuilder = new BeatBuilderApp();
  window.beatBuilder.init();
});
