// chordAdapter.js
// Parses chords.json format with progressions
export default class ChordAdapter {
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