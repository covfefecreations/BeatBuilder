// drumAdapter.js
// Parses drums.json format with grooves, bars, and notation strings
export class DrumAdapter {
  /**
   * Convert a drum pattern from the library into a track object
   * @param {object} pattern - The drum pattern from the library
   * @returns {object} The converted track object
   */
  convert(pattern) {
    const bpm = pattern.bpm || 120;
    const allNotes = [];

    // Parse the notation object (bar1, bar2, bar3, bar4)
    const notation = pattern.notation || {};
    const barKeys = Object.keys(notation).sort(); // bar1, bar2, bar3, bar4

    barKeys.forEach((barKey, barIndex) => {
      const bar = notation[barKey];

      Object.entries(bar).forEach(([instrument, notationString]) => {
        // Parse notation string: "X - - - X - - -" etc.
        const chars = notationString.replace(/\s+/g, '').split('');
        chars.forEach((char, step) => {
          if (char.toUpperCase() === 'X' || char === 'x') {
            const velocity = char === 'x' ? 0.5 : 1.0; // lowercase x = ghost note
            const timeInBeats = barIndex * 4 + (step / 4); // 16 steps per bar = 4 beats
            allNotes.push({
              time: timeInBeats,
              note: instrument,
              duration: 0.25,
              velocity,
              active: true
            });
          }
        });
      });
    });

    // Sort notes by time
    allNotes.sort((a, b) => a.time - b.time);

    return {
      id: pattern.id || `drum_${Date.now()}`,
      title: pattern.name || 'Drum Pattern',
      type: 'drums',
      pattern: allNotes,
      bpm,
      meta: {
        type: 'drums',
        description: pattern.description,
        genre: pattern.genre,
        energy: pattern.energy
      }
    };
  }

  static parseGroove(groove, bpm = 120) {
    const tracks = {};

    // Collect all notation from all bars in this groove
    groove.bars.forEach((bar, barIndex) => {
      Object.entries(bar.notation).forEach(([instrument, notation]) => {
        if (!tracks[instrument]) {
          tracks[instrument] = { instrument, pattern: [] };
        }

        // Parse notation string: "X - - - X - - -" etc.
        const chars = notation.replace(/\s+/g, '').split('');
        chars.forEach((char, step) => {
          if (char.toUpperCase() === 'X' || char === 'x') {
            const velocity = char === 'x' ? 0.5 : 1.0; // lowercase x = ghost note
            const timeInBeats = barIndex * 16 + step; // 16 steps per bar
            tracks[instrument].pattern.push({
              time: timeInBeats / 4, // convert to quarter note beats
              note: instrument,
              velocity,
              active: true
            });
          }
        });
      });
    });

    // Convert to array of track objects
    return Object.values(tracks).map(track => ({
      id: `${groove.name.toLowerCase().replace(/\s+/g, '_')}_${track.instrument.toLowerCase().replace(/\s+/g, '_')}`,
      title: `${track.instrument} (${groove.name})`,
      bpm,
      pattern: track.pattern.sort((a, b) => a.time - b.time),
      meta: {
        groove: groove.name,
        instrument: track.instrument,
        type: "drum"
      }
    }));
  }

  static loadFromJSON(drumData, bpm = 120) {
    // Use the specified BPM from data if available
    const dataBpm = drumData.tempoBPM || bpm;

    // Return all grooves as separate track sets
    if (!drumData.grooves || drumData.grooves.length === 0) return [];

    // For now, just load the first groove (Intro)
    // You can modify this to load all grooves or let user select
    const firstGroove = drumData.grooves[0];
    return this.parseGroove(firstGroove, dataBpm);
  }

  static loadAllGrooves(drumData, bpm = 120) {
    const dataBpm = drumData.tempoBPM || bpm;
    const allTracks = [];

    drumData.grooves.forEach(groove => {
      const tracks = this.parseGroove(groove, dataBpm);
      allTracks.push(...tracks);
    });

    return allTracks;
  }
}