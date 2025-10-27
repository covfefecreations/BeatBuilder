// src/librarymanager.js - Pattern library loader with auto-discovery

export class LibraryManager {
  constructor() {
    this.patterns = {
      drums: [],
      bass: [],
      chords: [],
      leads: []  // NEW category
    };
    this.loaded = false;
  }

  /**
   * Auto-discover and load all patterns from /library directory
   * This replaces hardcoded pattern lists
   */
  async loadAllPatterns() {
    try {
      // Define pattern files for each category
      const patternManifest = {
        drums: [
          // Original 4
          'intro_build', 'chorus_syncopated', 'verse_steady', 'outro_minimal',
          // New 10 from v0.3.0
          'rising_steam', 'trap_stutter', 'solar_pulse', 'broken_clock',
          'neon_rush', 'underflow', 'metro_snap', 'glass_hat',
          'pulse_engine', 'lazy_groove'
        ],
        bass: [
          // Original 8
          'foundation', 'heartbeat', 'bounce', 'funk_foundation',
          'walking_line', 'disco_drive', 'reggae_one_drop', 'anticipation',
          // New 10 from v0.3.0
          'warm_circuit', 'iron_root', 'glass_pulse', 'low_beacon',
          'sunny_motion', 'syncopated_anchor', 'submarine', 'walking_groove',
          'prismatic', 'hollow_root'
        ],
        chords: [
          'pop_standard', 'minor_climb', 'jazzy_resolve',
          'tension_builder', 'emotional_rollercoaster'
        ],
        leads: [
          // NEW in v0.3.0
          'neon_veins', 'sigh_motif', 'bolt', 'halo', 'glass_lead',
          'wisp', 'driver', 'orbit', 'shard', 'quiet_cry'
        ]
      };

      // Load all patterns in parallel
      const loadPromises = [];
      
      for (const [type, fileNames] of Object.entries(patternManifest)) {
        for (const fileName of fileNames) {
          const promise = fetch(`/library/${type}/${fileName}.json`)
            .then(res => res.json())
            .then(pattern => {
              pattern.type = type; // Ensure type is set
              this.patterns[type].push(pattern);
            })
            .catch(err => {
              console.warn(`Failed to load pattern: ${type}/${fileName}`, err);
              // Don't fail entire load if one pattern missing
            });
          
          loadPromises.push(promise);
        }
      }

      await Promise.all(loadPromises);
      this.loaded = true;
      
      console.log('✅ Library loaded:', {
        drums: this.patterns.drums.length,
        bass: this.patterns.bass.length,
        chords: this.patterns.chords.length,
        leads: this.patterns.leads.length,
        total: this.getAllPatterns().length
      });

      return this.patterns;

    } catch (error) {
      console.error('❌ Failed to load library:', error);
      throw error;
    }
  }

  // Get all patterns across all types
  getAllPatterns() {
    return [
      ...this.patterns.drums,
      ...this.patterns.bass,
      ...this.patterns.chords,
      ...this.patterns.leads
    ];
  }

  // Get patterns by type
  getPatternsByType(type) {
    return this.patterns[type] || [];
  }

  // Get specific pattern by ID
  getPatternById(id) {
    return this.getAllPatterns().find(p => p.id === id);
  }

  // Search patterns by text
  searchPatterns(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAllPatterns().filter(pattern => {
      return (
        pattern.name?.toLowerCase().includes(lowerQuery) ||
        pattern.description?.toLowerCase().includes(lowerQuery) ||
        pattern.genre?.some(g => g.toLowerCase().includes(lowerQuery)) ||
        pattern.mood?.toLowerCase().includes(lowerQuery) ||
        pattern.tags?.some(t => t.toLowerCase().includes(lowerQuery))
      );
    });
  }

  // Filter by energy level
  getPatternsByEnergy(level) {
    return this.getAllPatterns().filter(p => p.energy === level);
  }

  // Filter by genre
  getPatternsByGenre(genre) {
    const lowerGenre = genre.toLowerCase();
    return this.getAllPatterns().filter(p => 
      p.genre?.some(g => g.toLowerCase().includes(lowerGenre))
    );
  }

  // Get random pattern (optionally filtered by type)
  getRandomPattern(type = null) {
    const pool = type ? this.getPatternsByType(type) : this.getAllPatterns();
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Get pattern statistics
  getStats() {
    return {
      total: this.getAllPatterns().length,
      byType: {
        drums: this.patterns.drums.length,
        bass: this.patterns.bass.length,
        chords: this.patterns.chords.length,
        leads: this.patterns.leads.length
      },
      genres: [...new Set(this.getAllPatterns().flatMap(p => p.genre || []))],
      bpmRange: {
        min: Math.min(...this.getAllPatterns().map(p => p.bpm || Infinity)),
        max: Math.max(...this.getAllPatterns().map(p => p.bpm || -Infinity))
      }
    };
  }
}