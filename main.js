
// main.js - BeatBuilder Application Orchestrator
// Version: 2.0 (Refined Architecture)
// Purpose: Initialize and coordinate all application modules

import { AudioEngine } from './src/audioengine.js';
import { MidiManager } from './src/midimanager.js';
import { ExportManager } from './src/exportmanager.js';
import { LibraryManager } from './src/librarymanager.js';
import { AppState } from './src/appstate.js';
import { UIController } from './src/uicontroller.js';
import PatternSelector from './src/patternselector.js';
import VisualSequencer from './src/visualsequencer.js';

// Pattern Adapters - Convert library patterns to track format
import { DrumAdapter } from './src/drumadapter.js';
import { BassAdapter } from './src/bassadapter.js';
import { ChordAdapter } from './src/chordadapter.js';
import { LeadAdapter } from './src/leadadapter.js';

/**
 * BeatBuilderApp - Main Application Class
 * Orchestrates all modules and maintains application lifecycle
 */
class BeatBuilderApp {
  constructor() {
    // Core system modules
    this.state = new AppState();
    this.audioEngine = new AudioEngine(this.state);
    this.midiManager = new MidiManager(this.audioEngine);
    this.exportManager = new ExportManager();
    this.libraryManager = new LibraryManager();

    // Pattern conversion adapters
    this.adapters = {
      drums: new DrumAdapter(),
      bass: new BassAdapter(),
      chords: new ChordAdapter(),
      leads: new LeadAdapter()
    };

    // UI and visualization modules (initialized after DOM elements are confirmed)
    this.uiController = null;
    this.visualSequencer = null;
    this.patternSelector = null;

    // Session management
    this.autoSaveInterval = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   * This is the main entry point after DOM is ready
   */
  async init() {
    try {
      console.log('🚀 Initializing BeatBuilder v2.0...');
      this.showStatus('Initializing...');

      // Step 1: Verify DOM elements exist
      this.verifyDOMElements();

      // Step 2: Initialize Audio Engine
      await this.initializeAudioEngine();

      // Step 3: Initialize UI Controller
      this.initializeUIController();

      // Step 4: Initialize Visual Sequencer
      this.initializeVisualSequencer();

      // Step 5: Load pattern library
      await this.loadLibrary();

      // Step 6: Initialize Pattern Selector
      this.initializePatternSelector();

      // Step 7: Restore or initialize session
      await this.initializeSession();

      // Step 8: Set up auto-save
      this.startAutoSave();

      // Step 9: Set up library toggle
      this.setupLibraryToggle();

      // Mark as initialized
      this.isInitialized = true;
      console.log('✅ BeatBuilder initialized successfully');
      this.showStatus('Ready - Tap ▤ to browse patterns');

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Verify all required DOM elements exist
   */
  verifyDOMElements() {
    const requiredElements = [
      'sequencer-container',
      'library-panel',
      'track-controls-container',
      'play-button',
      'stop-button',
      'bpm-input',
      'export-json',
      'export-midi',
      'status-bar',
      'track-count'
    ];

    const missing = requiredElements.filter(id => !document.getElementById(id));
    
    if (missing.length > 0) {
      throw new Error(`Missing required DOM elements: ${missing.join(', ')}`);
    }

    console.log('✅ DOM elements verified');
  }

  /**
   * Initialize the Audio Engine with synthesizers
   */
  async initializeAudioEngine() {
    this.showStatus('Loading audio engine...');
    try {
      // Initialize with empty samples object - synths will be created
      // Drum samples can be added later if needed
      await this.audioEngine.init({});
      console.log('✅ Audio Engine initialized');
    } catch (error) {
      console.error('❌ Audio Engine initialization failed:', error);
      this.showStatus('Audio engine failed - check console');
      throw error;
    }
  }

  /**
   * Show status message (works even before UI Controller is ready)
   */
  showStatus(message) {
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
      statusBar.textContent = message;
    }
    if (this.uiController) {
      this.uiController.updateStatus(message);
    }
  }

  /**
   * Initialize the UI Controller
   */
  initializeUIController() {
    this.uiController = new UIController(
      this.state,
      this.audioEngine,
      this.exportManager,
      this.libraryManager
    );

    console.log('✅ UI Controller initialized');
  }

  /**
   * Initialize the Visual Sequencer
   */
  initializeVisualSequencer() {
    const container = document.getElementById('sequencer-container');
    
    if (!container) {
      throw new Error('Sequencer container not found');
    }

    this.visualSequencer = new VisualSequencer(container, this.state);

    // Subscribe to note highlight events from the audio engine
    this.state.subscribe('highlightNote', (data) => {
      this.visualSequencer.highlightNote(
        data.trackId,
        data.noteTime,
        data.duration,
        data.highlight
      );
    });

    // Subscribe to sequencer updates to keep state in sync
    container.addEventListener('sequencerUpdate', (event) => {
      const updatedTracks = event.detail;
      this.state.set('tracks', updatedTracks);
      this.audioEngine.loadTracks(updatedTracks);
    });

    console.log('✅ Visual Sequencer initialized');
  }

  /**
   * Load the pattern library
   */
  async loadLibrary() {
    this.uiController.updateStatus('Loading library...');
    
    await this.libraryManager.loadAllPatterns();
    
    const stats = this.libraryManager.getStats();
    console.log('✅ Library loaded:', stats);
    
    return stats;
  }

  /**
   * Initialize the Pattern Selector
   */
  initializePatternSelector() {
    this.patternSelector = new PatternSelector(
      'library-panel',
      this.libraryManager,
      this.adapters,
      this.audioEngine
    );

    // Set up pattern selection callback
    this.patternSelector.onSelect((pattern) => {
      this.loadPattern(pattern);
    });

    // Render the pattern selector UI
    this.patternSelector.render();

    console.log('✅ Pattern Selector initialized');
  }

  /**
   * Initialize session - restore previous or load default
   */
  async initializeSession() {
    this.uiController.updateStatus('Initializing session...');

    // Attempt to restore previous session
    const restored = this.state.loadFromLocalStorage();

    if (restored) {
      console.log('✅ Restored previous session');
      const tracks = this.state.get('tracks');
      const bpm = this.state.get('bpm');

      // Sync restored data to audio engine and visualizer
      this.syncTracksToEngine(tracks);
      this.audioEngine.setBPM(bpm);
      
      // Update UI to reflect restored state
      this.uiController.updateBPMDisplay(bpm);
    } else {
      console.log('📋 Starting new session');
      // Load a default pattern for demonstration
      await this.loadDefaultPattern();
    }
  }

  /**
   * Load a default pattern for first-time users
   */
  async loadDefaultPattern() {
    const defaultPatternId = 'drum_chorus_syncopated';
    const defaultPattern = this.libraryManager.getPatternById(defaultPatternId);

    if (defaultPattern) {
      console.log('Loading default pattern:', defaultPattern.name);
      this.loadPattern(defaultPattern);
    } else {
      console.warn('Default pattern not found, starting with empty session');
    }
  }

  /**
   * Load a pattern from the library
   * Converts pattern to track format and adds to session
   */
  loadPattern(pattern) {
    console.log('📥 Loading pattern:', pattern.name, `(${pattern.type})`);

    try {
      // Convert pattern using appropriate adapter
      const track = this.convertPatternToTrack(pattern);

      if (!track) {
        throw new Error(`Failed to convert pattern: ${pattern.name}`);
      }

      // Add track to state
      const tracks = this.state.get('tracks');
      
      // Assign a unique ID if not present
      if (!track.id) {
        track.id = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      // Check for duplicate IDs and rename if necessary
      const existingIds = tracks.map(t => t.id);
      if (existingIds.includes(track.id)) {
        track.id = `${track.id}_${Date.now()}`;
      }

      tracks.push(track);
      this.state.set('tracks', tracks);

      // Sync to engine and visualizer
      this.syncTracksToEngine(tracks);

      console.log('✅ Pattern loaded successfully:', track.title);
      this.uiController.updateStatus(`Loaded: ${track.title}`);

    } catch (error) {
      console.error('❌ Failed to load pattern:', error);
      this.uiController.updateStatus(`Error loading pattern: ${pattern.name}`);
      alert(`Failed to load pattern: ${pattern.name}\n${error.message}`);
    }
  }

  /**
   * Convert a library pattern to a track using the appropriate adapter
   */
  convertPatternToTrack(pattern) {
    const adapterType = pattern.type;
    const adapter = this.adapters[adapterType];

    if (!adapter) {
      console.error(`No adapter found for pattern type: ${adapterType}`);
      return null;
    }

    try {
      const track = adapter.convert(pattern);
      
      // Validate track structure
      if (!track || !track.pattern || !Array.isArray(track.pattern)) {
        throw new Error('Invalid track structure from adapter');
      }

      return track;
    } catch (error) {
      console.error(`Adapter conversion failed for ${pattern.name}:`, error);
      return null;
    }
  }

  /**
   * Synchronize tracks to both the audio engine and visual sequencer
   */
  syncTracksToEngine(tracks) {
    if (!tracks || !Array.isArray(tracks)) {
      console.warn('Invalid tracks array provided to syncTracksToEngine');
      return;
    }

    // Update visual sequencer
    if (this.visualSequencer) {
      this.visualSequencer.loadTracks(tracks);
    }

    // Update audio engine
    if (this.audioEngine) {
      this.audioEngine.loadTracks(tracks);
    }

    console.log(`🔄 Synced ${tracks.length} track(s) to engine`);
  }

  /**
   * Start auto-save timer
   */
  startAutoSave() {
    // Clear any existing interval
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    // Auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      if (this.isInitialized) {
        this.state.saveToLocalStorage();
        console.log('💾 Auto-saved session');
      }
    }, 30000);

    console.log('✅ Auto-save enabled (30s interval)');
  }

  /**
   * Set up library panel toggle functionality
   */
  setupLibraryToggle() {
    const libraryToggle = document.querySelector('.library-toggle');
    const libraryPanel = document.getElementById('library-panel');

    if (!libraryToggle || !libraryPanel) {
      console.warn('Library toggle elements not found');
      return;
    }

    // Initialize as closed
    libraryPanel.classList.remove('open');
    libraryToggle.innerHTML = '▤';
    libraryToggle.setAttribute('title', 'Open Library');

    libraryToggle.addEventListener('click', () => {
      const isOpen = libraryPanel.classList.toggle('open');
      libraryToggle.innerHTML = isOpen ? '✕' : '▤';
      libraryToggle.setAttribute('title', isOpen ? 'Close Library' : 'Open Library');
    });

    console.log('✅ Library toggle configured');
  }

  /**
   * Handle initialization errors gracefully
   */
  handleInitializationError(error) {
    const errorMessage = `Failed to initialize BeatBuilder: ${error.message}`;
    
    // Update UI if possible
    if (this.uiController) {
      this.uiController.updateStatus('Initialization failed');
    }

    // Show user-friendly error
    const userMessage = [
      'BeatBuilder failed to start.',
      '',
      'Common issues:',
      '• Check browser console for details',
      '• Ensure all required files are loaded',
      '• Try refreshing the page',
      '',
      `Technical error: ${error.message}`
    ].join('\n');

    alert(userMessage);

    // Log full error for debugging
    console.error('Full initialization error:', error);
  }

  /**
   * Clean up resources before unload
   */
  destroy() {
    console.log('🧹 Cleaning up BeatBuilder...');

    // Stop auto-save
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    // Save final state
    if (this.isInitialized) {
      this.state.saveToLocalStorage();
      console.log('💾 Final save completed');
    }

    // Stop audio engine
    if (this.audioEngine) {
      this.audioEngine.stop();
    }

    // Clean up visualizer
    if (this.visualSequencer) {
      this.visualSequencer.destroy();
    }

    console.log('✅ Cleanup complete');
  }

  /**
   * Public API methods for debugging and external control
   */

  // Get current application state
  getState() {
    return this.state.getAll();
  }

  // Get current tracks
  getTracks() {
    return this.state.get('tracks');
  }

  // Get library statistics
  getLibraryStats() {
    return this.libraryManager.getStats();
  }

  // Export current session as JSON
  exportSession() {
    const session = this.state.getAll();
    return JSON.stringify(session, null, 2);
  }

  // Import session from JSON
  importSession(jsonString) {
    try {
      const session = JSON.parse(jsonString);
      
      // Validate basic structure
      if (!session.tracks || !Array.isArray(session.tracks)) {
        throw new Error('Invalid session format');
      }

      // Load into state
      Object.keys(session).forEach(key => {
        this.state.set(key, session[key]);
      });

      // Sync to engine
      this.syncTracksToEngine(session.tracks);
      this.audioEngine.setBPM(session.bpm || 120);

      console.log('✅ Session imported successfully');
      this.uiController.updateStatus('Session imported');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to import session:', error);
      alert(`Failed to import session: ${error.message}`);
      return false;
    }
  }
}

// =====================================================
// Application Initialization
// =====================================================

/**
 * Initialize BeatBuilder when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM ready, initializing BeatBuilder...');

  // Create global app instance
  window.beatBuilder = new BeatBuilderApp();

  // Initialize the application
  window.beatBuilder.init().catch(error => {
    console.error('Fatal initialization error:', error);
  });

  // Set up cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (window.beatBuilder) {
      window.beatBuilder.destroy();
    }
  });

  // Expose useful debugging commands to console
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛠️  Debug mode active. Available commands:');
    console.log('   beatBuilder.getState() - View current state');
    console.log('   beatBuilder.getTracks() - View loaded tracks');
    console.log('   beatBuilder.getLibraryStats() - View library stats');
    console.log('   beatBuilder.exportSession() - Export current session');
    console.log('   beatBuilder.importSession(json) - Import session');
  }
});

// =====================================================
// Error Handling
// =====================================================

/**
 * Global error handler for uncaught errors
 */
window.addEventListener('error', (event) => {
  console.error('🚨 Uncaught error:', event.error);
  
  if (window.beatBuilder && window.beatBuilder.uiController) {
    window.beatBuilder.uiController.updateStatus('Error occurred');
  }
});

/**
 * Global handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
  
  if (window.beatBuilder && window.beatBuilder.uiController) {
    window.beatBuilder.uiController.updateStatus('Error occurred');
  }
});

// =====================================================
// Export for module systems (if needed)
// =====================================================
export default BeatBuilderApp;
