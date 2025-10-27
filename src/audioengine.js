// audioEngine.js
// Responsibilities:
// - load samples/samplers for drums, bass, chords
// - schedule patterns (array of {time (beats), note, velocity, active})
// - start/stop Transport
// - record incoming MIDI note events (timestamped) and quantize into patterns
// Note: Expects Tone.js to be loaded globally from CDN

export class AudioEngine {
	  constructor(appState) {
	    this.appState = appState;
    this.tracks = []; // sequencer-ready tracks
    this.players = {}; // named samplers/players for drum hits
    this.synths = {}; // synths for chords / bass
    this.quantize = "16n"; // default quantization grid for recording
    this.recording = false;
    this.recordBuffer = []; // {timeMs, noteNumber, velocity}
    this.onPatternRecorded = null; // callback after record->pattern conversion
  }

  setQuantize(q) {
    this.quantize = q;
  }

  async init(samples = {}) {
    try {
      // Ensure Tone.js context is created
      if (!window.Tone) {
        throw new Error('Tone.js not loaded');
      }

      // samples: { Kick: 'url', Snare: 'url', ... }
      // create players for drums
      for (const [name, url] of Object.entries(samples)) {
        const p = new Tone.Player(url).toDestination();
        this.players[name] = p;
        // ensure loaded
        try { await p.load(); } catch (e) { console.warn("Sample load failed", name, e); }
      }

      // create simple synths for bass+chords (replaceable)
      this.synths["bass"] = new Tone.MonoSynth({
        oscillator: { type: "sawtooth" },
        filter: { Q: 2, type: "lowpass", rolloff: -24 },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.6, release: 0.8 }
      }).toDestination();

      this.synths["chord"] = new Tone.PolySynth(Tone.Synth, {
        maxPolyphony: 6,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.7, release: 1.2 }
      }).toDestination();

      console.log('✅ Audio Engine synths created');
    } catch (error) {
      console.error('❌ Audio Engine init failed:', error);
      throw error;
    }
  }

  // load unified tracks (from adapters). Tracks array items:
  // { id, title, bpm, pattern: [ {time, note, velocity, active} ], color, meta.type }
  loadTracks(tracks) {
    this.tracks = tracks;
    // clear existing scheduled parts
    Tone.Transport.cancel(0);
    // create parts for each track
    this.createParts();
  }

  createParts = () => {
    Tone.Transport.cancel(0);
    this.parts = [];

	    this.tracks.forEach((track) => {
	      // Add track-specific volume/mute/solo controls here (Phase 4)
	      // For now, ensure track has a volume property
	      if (typeof track.volume === 'undefined') track.volume = 1;
	      if (typeof track.mute === 'undefined') track.mute = false;
	      if (typeof track.solo === 'undefined') track.solo = false;
	      
	      // build an array of events: [ [timeString, eventObj], ... ]
      // build an array of events: [ [timeString, eventObj], ... ]
      const events = [];
      track.pattern.forEach((p) => {
        if (!p.active) return;
        // time in beats -> convert to Tone.Time string (e.g., "1:0:0" or in beats "0.0")
        const timeInBeats = p.time; // float beats
        events.push([timeInBeats, { track, noteEvent: p }]);
      });

      if (events.length === 0) return;

      // Use Tone.Part to schedule events relative to Transport start.
	      const part = new Tone.Part((time, value) => {
	        // value: { track, noteEvent }
	        this._triggerNote(value.track, value.noteEvent, time);
	        
	        // Visual Feedback: Highlight the note when it plays
	        this.appState.notify('highlightNote', {
	          trackId: value.track.id,
	          noteTime: value.noteEvent.time,
	          duration: value.noteEvent.duration || 0.25, // Default duration
	          highlight: true
	        });
	        
	        // Schedule the un-highlight event
	        Tone.Transport.scheduleOnce(() => {
	          this.appState.notify('highlightNote', {
	            trackId: value.track.id,
	            noteTime: value.noteEvent.time,
	            duration: value.noteEvent.duration || 0.25,
	            highlight: false
	          });
	        }, time + (value.noteEvent.duration || 0.25) * Tone.Transport.PPQ / Tone.Transport.PPQ); // Schedule un-highlight after note duration
	        
	      }, events).start(0);

      part.loop = true;
      part.loopEnd = "4m"; // default 4 bars loop - can be overridden with track.length
      this.parts.push(part);
    });
  }

  _triggerNote = (track, noteEvent, time) => {
    // Decide how to sound this: drums vs bass vs chord
    const t = (track.meta && track.meta.type) || (track.title || "").toLowerCase();
    if (/kick|snare|hat|clap|tom|wood/i.test(track.title) || (track.meta && track.meta.sampleSet && track.meta.sampleSet.length)) {
      // attempt to use players by label -> fallback to first player
      const playerName = noteEvent.note || track.title;
	      // prefer exact match
	      const player = this.players[playerName] || this.players["Kick"] || Object.values(this.players)[0];
	      if (player && this.appState.isTrackAudible(track.id)) {
	        // Tone.js player volume control is complex. For now, we only handle mute/solo.
	        // Full volume control would require routing the player through a Tone.Gain node.
	        player.start(time);
	      }
	      return;
    }

    if (t.includes("bass") || track.title.toLowerCase().includes("bass")) {
	      // expect noteEvent.note to be e.g. "A2" or midi number. Accept both.
	      const note = typeof noteEvent.note === "number" ? Tone.Frequency(noteEvent.note, "midi").toNote() : noteEvent.note;
	      if (this.appState.isTrackAudible(track.id)) {
	        // Volume control for synths can be done via velocity (last argument)
	        const finalVelocity = (noteEvent.velocity || 1) * track.volume;
	        this.synths["bass"].triggerAttackRelease(note, "8n", time, finalVelocity);
	      }
	      return;
    }

    // chords/harmony
    if (track.title.toLowerCase().includes("chord") || track.meta && track.meta.type === "chord") {
      // noteEvent.note may be symbol like "C" or "Cmaj7" — expand to triad if necessary
      const chord = noteEvent.note;
	      const notes = this._expandChordSymbol(chord);
	      if (this.appState.isTrackAudible(track.id)) {
	        const finalVelocity = (noteEvent.velocity || 0.8) * track.volume;
	        this.synths["chord"].triggerAttackRelease(notes, "1n", time, finalVelocity);
	      }
	      return;
    }

	    // fallback: simple synth note
	    const fallbackNote = typeof noteEvent.note === "number" ? Tone.Frequency(noteEvent.note, "midi").toNote() : (noteEvent.note || "C3");
	    if (this.appState.isTrackAudible(track.id)) {
	      const finalVelocity = (noteEvent.velocity || 0.8) * track.volume;
	      this.synths["chord"].triggerAttackRelease(fallbackNote, "8n", time, finalVelocity);
	    }
	  }

  _expandChordSymbol(sym) {
    // very small utility - expand C -> [C3,E3,G3], Am -> [A2,C3,E3], etc.
    // naive but useful for playback; supports "maj7","m","7"
    try {
      const root = sym.match(/[A-G][#b]?/i);
      if (!root) return [sym];
      const r = root[0].toUpperCase();
      const isMinor = /m(?!aj)/i.test(sym);
      const isMaj7 = /maj7|M7/i.test(sym);
      const is7 = /7\b/.test(sym) && !isMaj7;
      const chordNotes = [];
      // map root to midi base octave
      const base = Tone.Frequency(r + "3").toMidi();
      // triad
      chordNotes.push(Tone.Frequency(base, "midi").toNote());
      chordNotes.push(Tone.Frequency(base + (isMinor ? 3 : 4), "midi").toNote());
      chordNotes.push(Tone.Frequency(base + 7, "midi").toNote());
      if (isMaj7) chordNotes.push(Tone.Frequency(base + 11, "midi").toNote());
      else if (is7) chordNotes.push(Tone.Frequency(base + 10, "midi").toNote());
      return chordNotes;
    } catch (e) { return [sym]; }
  }

	  async start(bpm = 120) {
	    Tone.Transport.bpm.value = bpm;
	    if (Tone.context.state !== "running") await Tone.start();
	    
	    // Start the beat update loop
	    if (!this.beatLoop) {
	      this.beatLoop = Tone.Transport.scheduleRepeat((time) => {
	        Tone.Draw.schedule(() => {
	          const currentBeat = Tone.Transport.seconds * (Tone.Transport.bpm.value / 60);
	          this.appState.set('currentBeat', currentBeat);
	        }, time);
	      }, "16n"); // Update every 16th note
	    }
	    
	    Tone.Transport.start("+0.05");
	    this.appState.set('isPlaying', true);
	  }

	  stop() {
	    Tone.Transport.stop();
	    this.appState.set('isPlaying', false);
	  }

  // --- Getters for LibraryManager Preview ---
  getTracks() {
    return this.tracks;
  }

  isPlaying() {
    return Tone.Transport.state === 'started';
  }

  getBPM() {
    return Tone.Transport.bpm.value;
  }

  setBPM(bpm) {
    Tone.Transport.bpm.value = bpm;
  }

  // ---------- MIDI recording API ----------
  startRecording() {
    this.recording = true;
    this.recordBuffer = [];
    this.recordStartMs = performance.now();
    console.log("AudioEngine: recording started");
  }

  recordMidiNote(noteNumber, velocity) {
    if (!this.recording) return;
    const t = performance.now() - this.recordStartMs;
    this.recordBuffer.push({ timeMs: t, noteNumber, velocity });
  }

  stopRecordingAndQuantize({quantize = "16n", bpm = 120, targetTrackId = null} = {}) {
    this.recording = false;
    // convert ms -> beats, quantize to grid, then output pattern entries
    const beatsPerMs = bpm / 60000; // beats = ms * bpm / 60000
    const raw = this.recordBuffer.map(r => ({
      beat: r.timeMs * beatsPerMs,
      midi: r.noteNumber,
      velocity: r.velocity
    }));

    // Tone.Time(quantize).toSeconds() -> seconds per step
    const stepBeats = Tone.Time(quantize).toSeconds() * (bpm/60); // careful: Time->seconds; convert seconds->beats
    // simpler: compute quantize in beats directly by mapping common values
    const quantMap = { "4n": 4, "2n": 2, "8n": 0.5, "16n": 0.25, "32n": 0.125 };
    const qBeats = quantMap[quantize] || 0.25;

    // quantize to nearest grid
    const quantized = raw.map(r => {
      const q = Math.round(r.beat / qBeats) * qBeats;
      return { time: Math.max(0, q), note: r.midi, velocity: r.velocity };
    });

    // merge duplicates within same quantized time (keep highest velocity)
    const merged = {};
    quantized.forEach(item => {
      const key = item.time.toFixed(4);
      if (!merged[key] || item.velocity > merged[key].velocity) merged[key] = item;
    });

    const pattern = Object.values(merged).map(it => ({
      time: it.time,
      note: it.note,
      velocity: Math.min(1, it.velocity / 127),
      active: true
    })).sort((a,b) => a.time - b.time);

    // place into a track (targetTrackId) or return pattern
    if (targetTrackId) {
      const track = this.tracks.find(t => t.id === targetTrackId) || this.tracks[0];
      track.pattern = track.pattern.concat(pattern);
      // re-create parts to pick up changes
      this.createParts();
    }

    // callback with pattern
    if (this.onPatternRecorded) this.onPatternRecorded(pattern);
    return pattern;
  }

  // Utility to export currently loaded tracks to a pure JSON snapshot
  exportSession() {
    return { tracks: this.tracks, bpm: Tone.Transport.bpm.value };
  }
}