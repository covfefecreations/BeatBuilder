// chordAdapter.js
export default class ChordAdapter {
  static parseProgression(progression, bpm = 120) {
    const pattern = [];
    const barLength = 4;
    const chordSymbols = progression.split("-");

    chordSymbols.forEach((chord, i) => {
      pattern.push({
        time: i * barLength,
        note: chord.trim(), // symbolic — expanded later by playback engine
        velocity: 0.8,
        active: true
      });
    });

    return pattern;
  }

  static parseExample(example, bpm = 120) {
    return {
      id: example.id,
      title: example.title,
      pattern: this.parseProgression(example.progression, bpm),
      bpm,
      key: example.key || "C",
      mood: example.mood || "neutral",
      analysis: example.analysis || ""
    };
  }

  static loadFromJSON(chordData, bpm = 120) {
    return chordData.examples.map((ex) => this.parseExample(ex, bpm));
  }
}