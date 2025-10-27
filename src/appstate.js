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
  toJSON() {
    // We only want to save the data, not the methods or subscribers
    const stateToSave = {
      isPlaying: this.state.isPlaying,
      bpm: this.state.bpm,
      tracks: this.state.tracks,
      // Exclude currentBeat as it's transient
    };
    return JSON.stringify(stateToSave);
  }

  /**
   * Create state object from a JSON string.
   * @param {string} jsonString - JSON string.
   * @returns {object} State object.
   */
  fromJSON(jsonString) {
    try {
      const loadedState = JSON.parse(jsonString);
      // Ensure all keys are present, using defaults for missing ones
      return {
        isPlaying: loadedState.isPlaying || false,
        currentBeat: 0, // Always reset current beat on load
        bpm: loadedState.bpm || 120,
        tracks: loadedState.tracks || [],
      };
    } catch (e) {
      console.error('Error parsing JSON state:', e);
      return null;
    }
  }
}
