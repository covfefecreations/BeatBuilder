// bassAdapter.js
// Parses bass.json format with examples and notation
export default class BassAdapter {
  static parseExample(example, bpm = 120) {
    const pattern = [];

    // Handle different notation formats
    if (example.notation.includes("|")) {
      // Bar-based notation like "C g C g | G d G d | A e A e | F c F c"
      const bars = example.notation.split("|");
      bars.forEach((bar, barIndex) => {
        const tokens = bar.trim().split(/\s+/);
        tokens.forEach((token, i) => {
          if (token && token !== '·' && /[A-Ga-g]/.test(token[0])) {
            // Parse note name (first char) and determine octave
            const noteName = token[0].toUpperCase();
            // lowercase = higher octave, uppercase = lower
            const octave = token[0] === token[0].toLowerCase() ? '3' : '2';
            const fullNote = noteName + octave;

            const velocity = token[0] === token[0].toLowerCase() ? 0.7 : 1.0;
            pattern.push({
              time: barIndex * 4 + i * (4 / tokens.length),
              note: fullNote,
              velocity,
              active: true
            });
          }
        });
      });
    } else {
      // Text-based notation - create placeholder pattern based on progression
      const chords = example.progression.split(" - ");
      chords.forEach((chord, i) => {
        // Extract root note
        const root = chord.match(/[A-G][#b]?/);
        if (root) {
          pattern.push({
            time: i * 4,
            note: root[0] + "2",
            velocity: 1.0,
            active: true
          });
        }
      });
    }

    return {
      id: example.id,
      title: example.title,
      progression: example.progression,
      pattern,
      bpm,
      energy: example.energy,
      meta: {
        type: "bass",
        progression: example.progression,
        energy: example.energy
      }
    };
  }

  static loadFromJSON(bassData, bpm = 120) {
    if (!bassData.examples) return [];
    return bassData.examples.map((example) =>
      this.parseExample(example, bpm)
    );
  }
}