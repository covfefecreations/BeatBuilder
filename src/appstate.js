// src/appstate.js - Centralized state management for BeatBuilder

export class AppState {
  constructor(initialState = {}) {
    this.state = this.loadFromLocalStorage() || {
      isPlaying: false,
      currentBeat: 0,
      bpm: 120,
      tracks: [], // Array of loaded track objects
      // Add other initial state properties as needed
      ...initialState
    };
    this.subscribers = new Map();
  }

  /**
   * Get a value from the state.
   * @param {string} key - The key of the state property.
   * @returns {*} The value of the state property.
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Set a value in the state and notify subscribers.
   * @param {string} key - The key of the state property.
   * @param {*} value - The new value.
   */
	  set(key, value) {
	    if (this.state[key] !== value) {
	      this.state[key] = value;
	      this.notify(key, value);
	    }
	  }
	  
	  // --- Track Control Methods ---
	  
	  // Helper to get a track by ID
	  getTrack(trackId) {
	    return this.state.tracks.find(t => t.id === trackId);
	  }
	  
	  // Update a single track property and notify
	  updateTrackProperty(trackId, property, value) {
	    const track = this.getTrack(trackId);
	    if (track && track[property] !== value) {
	      track[property] = value;
	      this.notify('tracks', this.state.tracks); // Notify tracks changed
	      this.notify(`track:${trackId}:${property}`, value); // Specific notification
	    }
	  }
	  
	  setTrackVolume(trackId, volume) {
	    this.updateTrackProperty(trackId, 'volume', volume);
	  }
	  
	  toggleTrackMute(trackId) {
	    const track = this.getTrack(trackId);
	    if (track) {
	      const newValue = !track.mute;
	      this.updateTrackProperty(trackId, 'mute', newValue);
	      
	      // Mute/Solo logic: Mute overrides Solo
	      if (newValue && track.solo) {
	        this.updateTrackProperty(trackId, 'solo', false);
	      }
	    }
	  }
	  
	  toggleTrackSolo(trackId) {
	    const track = this.getTrack(trackId);
	    if (track) {
	      const newValue = !track.solo;
	      this.updateTrackProperty(trackId, 'solo', newValue);
	      
	      // Mute/Solo logic: Soloing a track unmutes it
	      if (newValue && track.mute) {
	        this.updateTrackProperty(trackId, 'mute', false);
	      }
	      
	      // Solo logic: If a track is soloed, all other tracks should be muted
	      const isAnyTrackSoloed = this.state.tracks.some(t => t.solo);
	      if (isAnyTrackSoloed) {
	        this.state.tracks.forEach(t => {
	          if (t.id !== trackId) {
	            // Force mute other tracks if they are not soloed
	            this.updateTrackProperty(t.id, 'forcedMute', t.solo ? false : true);
	          } else {
	            this.updateTrackProperty(t.id, 'forcedMute', false);
	          }
	        });
	      } else {
	        // If no tracks are soloed, remove forced mute from all
	        this.state.tracks.forEach(t => {
	          this.updateTrackProperty(t.id, 'forcedMute', false);
	        });
	      }
	    }
	  }
	  
	  // Used to determine if a track is actually audible (mute || forcedMute)
	  isTrackAudible(trackId) {
	    const track = this.getTrack(trackId);
	    if (!track) return false;
	    return !track.mute && !track.forcedMute;
	  }
	  
	  // Remove a track
	  removeTrack(trackId) {
	    const originalLength = this.state.tracks.length;
	    this.state.tracks = this.state.tracks.filter(t => t.id !== trackId);
	    if (this.state.tracks.length !== originalLength) {
	      this.notify('tracks', this.state.tracks);
	    }
	  }
	  
	  // Add initial track properties on load
	  fromJSON(jsonString) {
	    try {
	      const loadedState = JSON.parse(jsonString);
	      // Ensure all keys are present, using defaults for missing ones
	      const tracksWithDefaults = (loadedState.tracks || []).map(t => ({
	        ...t,
	        volume: t.volume === undefined ? 1 : t.volume,
	        mute: t.mute === undefined ? false : t.mute,
	        solo: t.solo === undefined ? false : t.solo,
	        forcedMute: t.forcedMute === undefined ? false : t.forcedMute,
	      }));
	      
	      return {
	        isPlaying: loadedState.isPlaying || false,
	        currentBeat: 0, // Always reset current beat on load
	        bpm: loadedState.bpm || 120,
	        tracks: tracksWithDefaults,
	      };
	    } catch (e) {
	      console.error('Error parsing JSON state:', e);
	      return null;
	    }
	  }
	  
	  // Update toJSON to include new properties
	  toJSON() {
	    const stateToSave = {
	      isPlaying: this.state.isPlaying,
	      bpm: this.state.bpm,
	      tracks: this.state.tracks.map(t => ({
	        ...t,
	        // Only save user-set properties, not transient ones like forcedMute
	        volume: t.volume,
	        mute: t.mute,
	        solo: t.solo,
	      })),
	    };
	    return JSON.stringify(stateToSave);
	  }
	}

  /**
   * Subscribe a callback function to state changes.
   * @param {string} key - The state property key to subscribe to. Use 'all' for all changes.
   * @param {function} callback - The function to call when the state changes.
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
  }

  /**
   * Unsubscribe a callback function.
   * @param {string} key - The state property key.
   * @param {function} callback - The function to remove.
   */
  unsubscribe(key, callback) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).delete(callback);
    }
  }

  /**
   * Notify all subscribers for a given key.
   * @param {string} key - The state property key that changed.
   * @param {*} value - The new value.
   */
  notify(key, value) {
    // Notify specific subscribers
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(callback => callback(value, key));
    }
    // Notify 'all' subscribers
    if (this.subscribers.has('all')) {
      this.subscribers.get('all').forEach(callback => callback(value, key));
    }
  }

  /**
   * Save the current state to localStorage.
   */
  saveToLocalStorage() {
    try {
      const jsonState = this.toJSON();
      localStorage.setItem('beatBuilderState', jsonState);
      console.log('State auto-saved to localStorage.');
      return true;
    } catch (e) {
      console.error('Error saving state to localStorage', e);
      return false;
    }
  }

  /**
   * Load the state from localStorage.
   * @returns {object|null} The loaded state object or null if none found/error.
   */
  loadFromLocalStorage() {
    try {
      const jsonState = localStorage.getItem('beatBuilderState');
      if (jsonState) {
        console.log('State loaded from localStorage.');
        return this.fromJSON(jsonState);
      }
      return null;
    } catch (e) {
      console.warn('No state found in localStorage or error loading state', e);
      return null;
    }
  }

  /**
   * Convert the state to a JSON string (for future Sanity.io prep).
   * @returns {string} JSON string representation of the state.
   */
	  // toJSON is now defined in the previous edit block. Removing the original.

  /**
   * Create state object from a JSON string.
   * @param {string} jsonString - JSON string.
   * @returns {object} State object.
   */
	  // fromJSON is now defined in the previous edit block. Removing the original.
}
