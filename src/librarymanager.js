// librarymanager.js - Resource Library Manager
// Loads and manages drum patterns, basslines, and chord progressions from the library

export default class LibraryManager {
  constructor() {
    this.drums = [];
    this.bass = [];
    this.chords = [];
    this.melodies = [];
    this.loaded = false;
  }

  /**
   * Load all library resources
   */
  async loadAll() {
    try {
      await Promise.all([
        this.loadDrums(),
        this.loadBass(),
        this.loadChords()
      ]);
      this.loaded = true;
      console.log("Library loaded:", {
        drums: this.drums.length,
        bass: this.bass.length,
        chords: this.chords.length
      });
      return {
        drums: this.drums,
        bass: this.bass,
        chords: this.chords
      };
    } catch (error) {
      console.error("Error loading library:", error);
      throw error;
    }
  }

  /**
   * Load drum patterns from library
   */
  async loadDrums() {
    const drumPatterns = [
      'intro_build',
      'chorus_syncopated',
      'verse_steady',
      'outro_minimal'
    ];

    this.drums = await Promise.all(
      drumPatterns.map(async (pattern) => {
        try {
          const response = await fetch(`library/drums/${pattern}.json`);
          if (!response.ok) throw new Error(`Failed to load ${pattern}`);
          return await response.json();
        } catch (error) {
          console.warn(`Could not load drum pattern ${pattern}:`, error);
          return null;
        }
      })
    );

    this.drums = this.drums.filter(Boolean);
    return this.drums;
  }

  /**
   * Load bass patterns from library
   */
  async loadBass() {
    const bassPatterns = [
      'foundation',
      'heartbeat',
      'bounce',
      'funk_foundation',
      'walking_line',
      'disco_drive',
      'reggae_one_drop',
      'anticipation'
    ];

    this.bass = await Promise.all(
      bassPatterns.map(async (pattern) => {
        try {
          const response = await fetch(`library/bass/${pattern}.json`);
          if (!response.ok) throw new Error(`Failed to load ${pattern}`);
          return await response.json();
        } catch (error) {
          console.warn(`Could not load bass pattern ${pattern}:`, error);
          return null;
        }
      })
    );

    this.bass = this.bass.filter(Boolean);
    return this.bass;
  }

  /**
   * Load chord progressions from library
   */
  async loadChords() {
    const chordProgressions = [
      'pop_standard',
      'minor_climb',
      'jazzy_resolve',
      'tension_builder',
      'emotional_rollercoaster'
    ];

    this.chords = await Promise.all(
      chordProgressions.map(async (pattern) => {
        try {
          const response = await fetch(`library/chords/${pattern}.json`);
          if (!response.ok) throw new Error(`Failed to load ${pattern}`);
          return await response.json();
        } catch (error) {
          console.warn(`Could not load chord progression ${pattern}:`, error);
          return null;
        }
      })
    );

    this.chords = this.chords.filter(Boolean);
    return this.chords;
  }

  /**
   * Get pattern by ID
   */
  getPatternById(id) {
    const allPatterns = [...this.drums, ...this.bass, ...this.chords, ...this.melodies];
    return allPatterns.find(p => p.id === id);
  }

  /**
   * Get patterns by type
   */
  getPatternsByType(type) {
    switch(type.toLowerCase()) {
      case 'drums':
      case 'drum':
        return this.drums;
      case 'bass':
        return this.bass;
      case 'chords':
      case 'chord':
        return this.chords;
      case 'melodies':
      case 'melody':
        return this.melodies;
      default:
        return [];
    }
  }

  /**
   * Get patterns by energy level
   */
  getPatternsByEnergy(energy) {
    const allPatterns = [...this.drums, ...this.bass, ...this.chords];
    return allPatterns.filter(p =>
      p.energy && p.energy.toLowerCase().includes(energy.toLowerCase())
    );
  }

  /**
   * Get patterns by genre
   */
  getPatternsByGenre(genre) {
    const allPatterns = [...this.drums, ...this.bass, ...this.chords];
    return allPatterns.filter(p =>
      p.genre && p.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  /**
   * Search patterns by keyword
   */
  searchPatterns(keyword) {
    const allPatterns = [...this.drums, ...this.bass, ...this.chords, ...this.melodies];
    const search = keyword.toLowerCase();

    return allPatterns.filter(p =>
      (p.name && p.name.toLowerCase().includes(search)) ||
      (p.description && p.description.toLowerCase().includes(search)) ||
      (p.genre && p.genre.toLowerCase().includes(search)) ||
      (p.emotional_character && p.emotional_character.toLowerCase().includes(search))
    );
  }

  /**
   * Get random pattern by type
   */
  getRandomPattern(type) {
    const patterns = this.getPatternsByType(type);
    if (patterns.length === 0) return null;
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  /**
   * Get library stats
   */
  getStats() {
    return {
      totalPatterns: this.drums.length + this.bass.length + this.chords.length + this.melodies.length,
      drums: this.drums.length,
      bass: this.bass.length,
      chords: this.chords.length,
      melodies: this.melodies.length,
      loaded: this.loaded
    };
  }
}
