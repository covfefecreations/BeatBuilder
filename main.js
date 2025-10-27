// main.js - Application initialization and orchestration (SIMPLIFIED)

import { AudioEngine } from './src/audioengine.js';
import { MidiManager } from './src/midimanager.js';
import { ExportManager } from './src/exportmanager.js';
import { LibraryManager } from './src/librarymanager.js';
import { AppState } from './src/appstate.js';
import { UIController } from './src/uicontroller.js';
import { PatternSelector } from './src/patternselector.js';
import { VisualSequencer } from './src/visualsequencer.js';

class BeatBuilderApp {
  constructor() {
    this.state = new AppState();
    this.audioEngine = new AudioEngine();
    this.midiManager = new MidiManager(this.audioEngine);
    this.exportManager = new ExportManager();
    this.libraryManager = new LibraryManager();
    
    this.uiController = null;
    this.patternSelector = null;
    this.visualSequencer = null;
  }

  async init() {
    try {
      console.log('🚀 Initializing BeatBuilder v0.4.0...');

      // Load library patterns
      await this.libraryManager.loadAllPatterns();
      console.log('✅ Library loaded:', this.libraryManager.getStats());

      // Initialize UI controller
      this.uiController = new UIController(
        this.state,
        this.audioEngine,
        this.libraryManager
      );

      // Initialize pattern selector
      this.patternSelector = new PatternSelector(
        this.libraryManager,
        (pattern) => this.loadPattern(pattern)
      );
      this.patternSelector.render(document.getElementById('library-panel'));

      // Initialize visual sequencer
      this.visualSequencer = new VisualSequencer(
        document.getElementById('sequencer-container'),
        this.state
      );

      // Try to load last session from localStorage
      if (this.state.loadFromLocalStorage()) {
        console.log('✅ Restored previous session');
        this.visualSequencer.render(this.state.get('tracks'));
      } else {
        // Load a default pattern for demo
        const defaultPattern = this.libraryManager.getPatternById('chorus_syncopated');
        if (defaultPattern) {
          this.loadPattern(defaultPattern);
        }
      }

      // Auto-save session every 30 seconds
      setInterval(() => {
        this.state.saveToLocalStorage();
      }, 30000);

      console.log('✅ BeatBuilder ready!');

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      alert('Failed to initialize BeatBuilder. Check console for details.');
    }
  }

  loadPattern(pattern) {
    console.log('Loading pattern:', pattern.name);
    
    // Convert pattern to track format based on type
    let track;
    switch (pattern.type) {
      case 'drums':
        track = this.convertDrumPattern(pattern);
        break;
      case 'bass':
        track = this.convertBassPattern(pattern);
        break;
      case 'chords':
        track = this.convertChordPattern(pattern);
        break;
      case 'leads':
        track = this.convertLeadPattern(pattern);
        break;
      default:
        console.warn('Unknown pattern type:', pattern.type);
        return;
    }

    // Add track to state
    const tracks = this.state.get('tracks');
    tracks.push(track);
    this.state.set('tracks', tracks);

    // Update visual sequencer
    this.visualSequencer.render(tracks);

    // Load into audio engine
    this.audioEngine.loadTracks(tracks);
  }

  convertDrumPattern(pattern) {
    // Use existing DrumAdapter logic
    // (Simplified - implement based on your adapter)
    return {
      id: pattern.id,
      title: pattern.name,
      type: 'drums',
      pattern: [], // Convert pattern.notation to event array
      bpm: pattern.bpm
    };
  }

  convertBassPattern(pattern) {
    // Use existing BassAdapter logic
    return {
      id: pattern.id,
      title: pattern.name,
      type: 'bass',
      pattern: [],
      bpm: pattern.bpm
    };
  }

  convertChordPattern(pattern) {
    // Use existing ChordAdapter logic
    return {
      id: pattern.id,
      title: pattern.name,
      type: 'chords',
      pattern: [],
      bpm: pattern.bpm
    };
  }

  convertLeadPattern(pattern) {
    // NEW: Convert lead notation to sequencer format
    return {
      id: pattern.id,
      title: pattern.name,
      type: 'lead',
      pattern: [],
      bpm: pattern.bpm
    };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.beatBuilder = new BeatBuilderApp();
  window.beatBuilder.init();
});