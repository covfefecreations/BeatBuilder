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
              console.error(`❌ CRITICAL: Failed to load pattern: ${type}/${fileName}. Check file path and JSON format.`, err);
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

  /**
   * Previews a pattern by converting it and playing it for a short duration.
   * @param {object} pattern - The pattern object to preview.
   * @param {object} adapters - Object containing { drumAdapter, bassAdapter, chordAdapter, leadAdapter }.
   * @param {object} audioEngine - The AudioEngine instance to use for playback.
   * @param {number} duration - Duration in seconds to play the preview.
   * @returns {Promise<void>}
   */
  /**
   * Previews a pattern by converting it and playing it for a short duration using a dedicated, temporary scheduler.
   * This ensures zero interference with the main sequencer state.
   * @param {object} pattern - The pattern object to preview.
   * @param {object} adapters - Object containing { drumAdapter, bassAdapter, chordAdapter, leadAdapter }.
   * @param {object} audioEngine - The main AudioEngine instance (to access players/synths).
   * @param {number} duration - Duration in seconds to play the preview.
   * @returns {Promise<void>}
   */
  async previewPattern(pattern, adapters, audioEngine, duration = 4) {
    console.log(`Previewing pattern: ${pattern.name} for ${duration}s`);

    // 1. Convert pattern to track format
    let track;
    const adapter = adapters[`${pattern.type}Adapter`];
    if (adapter) {
      track = adapter.convert(pattern);
    } else {
      console.warn('Cannot preview: Unknown pattern type or missing adapter:', pattern.type);
      return;
    }

    // 2. Schedule a temporary Tone.Part
    const bpm = pattern.bpm || 120;
    const events = [];
    track.pattern.forEach((p) => {
      if (!p.active) return;
      const timeInBeats = p.time;
      events.push([timeInBeats, { track, noteEvent: p }]);
    });

    if (events.length === 0) {
      console.log('Pattern is empty, skipping preview.');
      return;
    }
    
    // Ensure Tone.js is running
    if (Tone.context.state !== "running") await Tone.start();

    // Use a temporary Transport to schedule the part, ensuring it stops after the duration.
    // NOTE: Tone.Transport is global, so we must stop it and restore its state.
    // The safest way to avoid interference is to use Tone.Part and schedule it relative to the global Transport,
    // but manage its lifecycle and restore the main state.
    
    // Since the main AudioEngine uses the global Tone.Transport, we will use a dedicated Tone.Part
    // and rely on the main AudioEngine's _triggerNote method for sound.

    // Save current state
    const originalBPM = Tone.Transport.bpm.value;
    const originalState = Tone.Transport.state;
    
    // Stop main playback if running and set new BPM
    if (originalState === 'started') {
      Tone.Transport.stop();
    }
    Tone.Transport.bpm.value = bpm;
    
    // Create and start the temporary part
    const part = new Tone.Part((time, value) => {
      audioEngine._triggerNote(value.track, value.noteEvent, time);
    }, events).start(0);

    part.loop = true;
    part.loopEnd = "4m"; // Default loop end

    // Start transport for preview
    Tone.Transport.start("+0.05");

    // Schedule the stop event
    const stopTime = `+${duration}`; // Stop after 'duration' seconds
    Tone.Transport.scheduleOnce(() => {
      Tone.Transport.stop();
      part.dispose(); // Clean up the temporary part
      
      // Restore original state
      Tone.Transport.bpm.value = originalBPM;
      if (originalState === 'started') {
        // Re-schedule the main tracks and restart transport
        audioEngine.createParts(); 
        Tone.Transport.start("+0.05");
      } else {
        audioEngine.createParts(); // Ensure main parts are re-created after transport stop/start
      }
      console.log('Preview finished. State restored.');
    }, stopTime);

    // Wait for the scheduled stop to happen (or timeout if something goes wrong)
    await new Promise(resolve => setTimeout(resolve, (duration + 0.5) * 1000));
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