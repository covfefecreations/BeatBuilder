// src/leadadapter.js - Converts lead pattern JSON data to sequencer track format

export class LeadAdapter {
  /**
   * Converts a lead pattern object from the library into a track object
   * suitable for the sequencer and audio engine.
   * @param {object} pattern - The lead pattern object from the library.
   * @returns {object} The converted track object.
   */
  convert(pattern) {
    // Lead pattern JSON structure is already event-based (time, note, duration, velocity)
    // We assume the track structure is similar to others but with a 'lead' type
    return {
      id: pattern.id,
      title: pattern.name,
      type: 'lead', // Note: using 'lead' not 'leads' for track type
      pattern: pattern.pattern, // Directly use the event array
      bpm: pattern.bpm || 120, // Use pattern BPM or default 120
      instrument: 'LeadSynth' // Assuming the AudioEngine knows this instrument
    };
  }
}
