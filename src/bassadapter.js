// bassAdapter.js
export default class BassAdapter {
  static parseExample(example, bpm = 120) {
    const pattern = [];
    const bars = example.notation.split("|");

    bars.forEach((bar, barIndex) => {
      const tokens = bar.trim().split(/\s+/);
      tokens.forEach((token, i) => {
        if (token && /[A-Ga-g]/.test(token[0])) {
          // crude note-to-frequency mapping placeholder
          const noteName = token[0].toUpperCase() + "2"; 
          pattern.push({
            time: barIndex * 4 + i * (4 / tokens.length),
            note: noteName,
            velocity: 1.0,
            active: true
          });
        }
      });
    });

    return {
      id: example.id,
      title: example.title,
      progression: example.progression,
      pattern,
      bpm,
      genre: example.genre,
      analysis: example.analysis
    };
  }

  static loadFromJSON(bassData, bpm = 120) {
    return bassData.examples.map((example) =>
      this.parseExample(example, bpm)
    );
  }
}