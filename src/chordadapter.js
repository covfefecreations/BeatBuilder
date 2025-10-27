// chordAdapter.js
// Parses chords.json format with progressions
export class ChordAdapter {
  /**
   * Convert a chord pattern from the library into a track object
   * @param {object} pattern - The chord pattern from the library
   * @returns {object} The converted track object
   */
  convert(pattern) {
    // Chord patterns need to convert from notes array to note string
    const convertedPattern = (pattern.pattern || []).map(item => ({
      time: item.time,
      note: item.chord || item.note || 'C', // Use chord symbol if available
      duration: item.duration || 4,
      velocity: item.velocity || 0.7,
      active: item.active !== undefined ? item.active : true
    }));

    return {
      id: pattern.id || `chord_${Date.now()}`,
      title: pattern.name || 'Chord Pattern',
      type: 'chords',
      pattern: convertedPattern,
      bpm: pattern.bpm || 120,
      meta: {
        type: 'chords',
        description: pattern.description,
        emotional_character: pattern.emotional_character,
        key: pattern.key,
        genre: pattern.genre
      }
    };
  }

  static parseProgression(chordSequence, bpm = 120) {
    const pattern = [];
    const barLength = 4; // Each chord lasts 4 beats (1 bar)

    chordSequence.forEach((chord, i) => {
      pattern.push({
        time: i * barLength,
        note: chord.trim(), // symbolic — expanded later by playback engine
        velocity: 0.8,
        active: true
      });
    });

    return pattern;
  }

  static parseProgressionObject(progression, bpm = 120) {
    return {
      id: progression.id,
      title: progression.name,
      pattern: this.parseProgression(progression.chord_sequence, bpm),
      bpm,
      description: progression.description || "",
      emotionalCharacter: progression.emotional_character || "",
      meta: {
        type: "chord",
        description: progression.description,
        emotionalCharacter: progression.emotional_character
      }
    };
  }

  static loadFromJSON(chordData, bpm = 120) {
    if (!chordData.progressions) return [];
    return chordData.progressions.map((prog) =>
      this.parseProgressionObject(prog, bpm)
    );
  }
}