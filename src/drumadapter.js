// drumAdapter.js
export default class DrumAdapter {
  static parseKit(kit, bpm = 120) {
    const pattern = [];

    // iterate each instrument line
    Object.entries(kit.patterns).forEach(([instrument, steps]) => {
      steps.split("").forEach((step, i) => {
        if (step === "1") {
          pattern.push({
            time: i * (4 / steps.length), // quantized step position
            note: instrument,             // symbolic label (Kick, Snare, etc.)
            velocity: 1.0,
            active: true
          });
        }
      });
    });

    return {
      id: kit.id,
      title: kit.name || "Unnamed Kit",
      bpm,
      pattern,
      meta: {
        genre: kit.genre || "Generic",
        description: kit.description || "",
        sampleSet: kit.samples || []
      }
    };
  }

  static loadFromJSON(drumData, bpm = 120) {
    return drumData.kits.map((kit) => this.parseKit(kit, bpm));
  }
}