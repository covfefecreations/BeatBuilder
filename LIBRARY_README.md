# BeatBuilder Pattern Library 🎵

A comprehensive resource library of drum patterns, basslines, and chord progressions for your music production.

## 📚 What's Included

### Drum Patterns (14 patterns)

**Original Patterns:**
- **Intro Build** - Building drum pattern from minimal to full kit (Universal, Low-Medium energy)
- **Chorus Syncopated** - Syncopated kick pattern with tight hi-hats (Hip-Hop/Pop, Medium-High energy)
- **Verse Steady** - Steady groove with hat variations (Hip-Hop/R&B, Medium energy)
- **Outro Minimal** - Minimal ending pattern (Universal, Low energy)

**Extended Collection:**
- **Rising Steam** - Four-on-the-floor cinematic pattern (Cinematic/Electronic, 172 BPM)
- **Trap Stutter** - Stuttering trap-style syncopation (Trap/Hip-Hop, 165 BPM)
- **Solar Pulse** - Propulsive house pattern with off-beat kicks (House/Electronic, 168 BPM)
- **Broken Clock** - Off-kilter experimental pattern (Experimental/IDM, 170 BPM)
- **Neon Rush** - High-energy rapid fire kicks (DnB/Breakbeat, 174 BPM)
- **Underflow** - Minimal deep techno space (Minimal/Techno, 162 BPM)
- **Metro Snap** - Tight metronomic techno drive (Tech House/Techno, 170 BPM)
- **Glass Hat** - Shimmery hi-hat only pattern (Ambient/Downtempo, 168 BPM)
- **Pulse Engine** - Relentless hypnotic techno (Techno/Industrial, 176 BPM)
- **Lazy Groove** - Laid-back lo-fi spacing (Lo-Fi/Chill, 160 BPM)

### Bass Patterns (18 patterns)

**Original Patterns:**
- **The Foundation** - Minimal whole note bass (Minimal energy)
- **The Heartbeat** - Steady quarter note pulse (Low-Medium energy)
- **The Bounce** - Root-fifth bounce pattern (Medium energy)
- **The Funk Foundation** - Syncopated 16th notes with ghost notes (High energy)
- **The Walking Line** - Classic jazz walking bass (Medium energy)
- **The Disco Drive** - Four-on-the-floor with octave jumps (Medium-High energy)
- **The Reggae One-Drop** - Classic reggae offbeat bass (Medium energy)
- **The Anticipation** - Bass anticipates chord changes (Medium-High energy)

**Extended Collection:**
- **Warm Circuit** (C-Am-F-G) - Hopeful, nostalgic progression in C Major
- **Iron Root** (Am-F-C-G) - Dark, resolute progression in A Minor
- **Glass Pulse** (Em-C-G-D) - Airy, driving progression in E Minor
- **Low Beacon** (Dm-Bb-F-C) - Brooding, wide progression in D Minor
- **Sunny Motion** (G-Em-C-D) - Bright, open progression in G Major
- **Syncopated Anchor** (Fm-Db-Ab-Eb) - Funky, punchy syncopated in F Minor
- **Submarine** (Cm-Ab-Eb-Bb) - Deep, distant progression in C Minor
- **Walking Groove** (Bb-Gm-Eb-F) - Groovy, warm walking bass in Bb Major
- **Prismatic** (A-F#m-D-E) - Urgent, clean progression in A Major
- **Hollow Root** (Ebm-Bbm-Ab-Gb) - Mournful, lush whole notes in Eb Minor

### Chord Progressions (5 progressions)
- **The Pop Standard** (C-G-Am-F) - Hopeful, anthemic, bittersweet optimism
- **The Minor Climb** (Am-G-F-G) - Urgent, determined, intense
- **The Jazzy Resolve** (Fmaj7-G7-Em7-Am) - Introspective, sophisticated, dreamy
- **The Tension Builder** (Am-F-C-G) - Melancholic → hopeful → triumphant
- **The Emotional Roller Coaster** (C-Em-Am-F) - Sweet sadness, wistful, nostalgic

### Lead Motifs (10 patterns) **NEW!**
- **Neon Veins** - Heroic pentatonic ascent (E Minor Pentatonic, Bright/Heroic)
- **Sigh Motif** - Melancholic descending phrase (A Minor, Soft/Sad)
- **Bolt** - Aggressive Phrygian stab (B Phrygian, Sharp/Intense)
- **Halo** - Dreamy Lydian rise (C Lydian, Ethereal/Uplifting)
- **Glass Lead** - Clear anthemic arc (D Major, Triumphant/Clean)
- **Wisp** - Ethereal sparse pentatonic (F Minor Pentatonic, Ghostly/Ambient)
- **Driver** - Punchy hooky phrase (G Minor, Catchy/Energetic)
- **Orbit** - Mysterious expansive motif (C Minor, Dark/Spacious)
- **Shard** - Iridescent tense climb (E Major, Dramatic/Tense)
- **Quiet Cry** - Longing soft descent (Bb Minor, Emotional/Intimate)

## 🚀 Quick Start

### 1. Load the Library

```javascript
import LibraryManager from './src/librarymanager.js';

const library = new LibraryManager();
await library.loadAll();
```

### 2. Browse Patterns with UI

```javascript
import PatternSelector from './src/patternselector.js';

const selector = new PatternSelector('containerId', library);
selector.render();

// Handle pattern selection
selector.onSelect((pattern) => {
  console.log('Selected:', pattern);
  // Load pattern into your sequencer
});
```

### 3. Access Patterns Programmatically

```javascript
// Get all drums
const drums = library.getPatternsByType('drums');

// Get a specific pattern by ID
const pattern = library.getPatternById('bass_funk');

// Search patterns
const funkPatterns = library.searchPatterns('funk');

// Get random pattern
const randomBass = library.getRandomPattern('bass');

// Filter by energy
const highEnergy = library.getPatternsByEnergy('high');

// Filter by genre
const jazzPatterns = library.getPatternsByGenre('jazz');
```

## 📁 Library Structure

```
/library
  /drums (14 patterns)
    - intro_build.json
    - chorus_syncopated.json
    - verse_steady.json
    - outro_minimal.json
    - rising_steam.json
    - trap_stutter.json
    - solar_pulse.json
    - broken_clock.json
    - neon_rush.json
    - underflow.json
    - metro_snap.json
    - glass_hat.json
    - pulse_engine.json
    - lazy_groove.json
  /bass (18 patterns)
    - foundation.json
    - heartbeat.json
    - bounce.json
    - funk_foundation.json
    - walking_line.json
    - disco_drive.json
    - reggae_one_drop.json
    - anticipation.json
    - warm_circuit.json
    - iron_root.json
    - glass_pulse.json
    - low_beacon.json
    - sunny_motion.json
    - syncopated_anchor.json
    - submarine.json
    - walking_groove.json
    - prismatic.json
    - hollow_root.json
  /chords (5 progressions)
    - pop_standard.json
    - minor_climb.json
    - jazzy_resolve.json
    - tension_builder.json
    - emotional_rollercoaster.json
  /leads (10 motifs) **NEW!**
    - neon_veins.json
    - sigh_motif.json
    - bolt.json
    - halo.json
    - glass_lead.json
    - wisp.json
    - driver.json
    - orbit.json
    - shard.json
    - quiet_cry.json
```

## 🎯 Pattern File Format

Each pattern file contains:

### Drum Patterns
```json
{
  "id": "drum_intro_build",
  "name": "Intro Build",
  "description": "Building drum pattern from minimal to full kit",
  "genre": "Universal",
  "energy": "Low to Medium",
  "bpm": 110,
  "bars": 4,
  "instruments": ["Kick", "Snare", "Closed Hat"],
  "notation": {
    "bar1": {
      "Kick": "X - - - - - - - X - - - - - - -",
      "Closed Hat": "X - - - X - - - X - - - X - - -"
    }
  },
  "tips": ["Ghost notes at 30-50% velocity"]
}
```

### Bass Patterns
```json
{
  "id": "bass_foundation",
  "name": "The Foundation",
  "description": "Minimal whole note bass",
  "progression": "C - G - Am - F",
  "energy": "Minimal",
  "rhythm": "Whole Notes",
  "pattern": [
    {"time": 0, "note": "C3", "duration": 4, "velocity": 0.8}
  ],
  "tips": ["Let notes ring", "Great for sparse arrangements"]
}
```

### Chord Progressions
```json
{
  "id": "chord_pop_standard",
  "name": "The Pop Standard",
  "chord_sequence": ["C", "G", "Am", "F"],
  "emotional_character": "Hopeful, anthemic",
  "key": "C Major",
  "genre": "Pop/Rock",
  "pattern": [
    {"time": 0, "chord": "C", "notes": ["C3", "E3", "G3"], "duration": 4}
  ]
}
```

### Lead Motifs
```json
{
  "id": "lead_neon_veins",
  "name": "Neon Veins",
  "description": "Heroic, bright lead motif in E minor pentatonic",
  "key": "E Minor Pentatonic",
  "scale": "E - G - A - B - D",
  "motif": "1-3-5-7-5-3",
  "mood": "Heroic, Bright",
  "energy": "High",
  "pattern": [
    {"time": 0, "note": "E4", "duration": 0.5, "velocity": 0.85},
    {"time": 0.5, "note": "A4", "duration": 0.5, "velocity": 0.8}
  ],
  "tips": ["Pentatonic scale always sounds musical", "Great for uplifting choruses"]
}
```

## 🎨 Using the Pattern Selector UI

The Pattern Selector provides a visual interface for browsing patterns:

### Features
- **Filter by type**: Drums, Bass, Chords, or All
- **Search**: Find patterns by name, description, genre, or emotion
- **Preview**: See pattern details before loading
- **Load**: Instantly load patterns into your sequencer

### Demo
Open `library_demo.html` in your browser to see the Pattern Selector in action!

## 🔧 Integration with Your Sequencer

To integrate patterns into your existing sequencer:

```javascript
// 1. Load the library
const library = new LibraryManager();
await library.loadAll();

// 2. Get a pattern
const drumPattern = library.getPatternById('drum_chorus_syncopated');

// 3. Convert to your sequencer format
// (You'll need to adapt based on your sequencer's data structure)
function loadDrumPattern(pattern) {
  // Parse pattern.notation into sequencer steps
  // Update your sequencer data
  // Redraw sequencer UI
}

// 4. Load bass/chord patterns similarly
```

## 💡 Tips for Using the Library

1. **Mix and Match**: Combine different drum, bass, and chord patterns
2. **Energy Levels**: Match pattern energies for cohesive sections
3. **Genre Compatibility**: Mix genres for unique sounds
4. **Build Arrangements**: Use Intro → Verse → Chorus → Outro patterns
5. **Customize**: Edit loaded patterns to make them your own

## 🎼 Musical Concepts

### Drum Patterns
- **Ghost Notes**: Soft hits (lowercase 'x') add groove depth
- **Syncopation**: Off-beat kicks create movement
- **Layering**: Combine multiple kick types for thickness

### Bass Patterns
- **Energy Levels**: Match pattern activity to song section
- **Rhythmic Styles**: Quarter notes, 8ths, 16ths, syncopated
- **Melodic Movement**: Walking, bouncing, pedal tones

### Chord Progressions
- **Emotional Character**: Each progression has a distinct feel
- **Key Flexibility**: Transpose to any key
- **Voicings**: Experiment with different note arrangements

## 📈 Library Stats

- **Total Patterns**: 47 🎉
  - Drums: 14 ✨ (+10 new!)
  - Bass: 18 ✨ (+10 new!)
  - Chords: 5
  - Leads: 10 ✨ (NEW category!)

## 🚧 Future Additions

- More lead/melody variations
- Additional drum patterns (rock, metal, Latin)
- Extended bass patterns (slap, fingerstyle, funk)
- Advanced chord progressions (modal interchange, jazz extensions)
- Audio previews for all patterns
- MIDI export for each pattern
- User-contributed patterns
- Pattern combination presets

## 📝 Adding Your Own Patterns

To add new patterns to the library:

1. Create a JSON file following the format above
2. Place it in the appropriate `/library` subfolder
3. Add the filename to the corresponding array in `librarymanager.js`
4. Reload the library

## 🎯 Example Workflows

### Create a Complete Beat
```javascript
// Load library
await library.loadAll();

// Get patterns
const drums = library.getPatternById('drum_chorus_syncopated');
const bass = library.getPatternById('bass_bounce');
const chords = library.getPatternById('chord_pop_standard');

// Combine into your sequencer
// All patterns are at 110 BPM and work together!
```

### Build a Song Structure
```javascript
// Intro
const introDrums = library.getPatternById('drum_intro_build');

// Verse
const verseDrums = library.getPatternById('drum_verse_steady');
const verseBass = library.getPatternById('bass_heartbeat');

// Chorus
const chorusDrums = library.getPatternById('drum_chorus_syncopated');
const chorusBass = library.getPatternById('bass_disco_drive');

// Outro
const outroDrums = library.getPatternById('drum_outro_minimal');
```

## 🤝 Contributing

Have a great pattern to share? Create a JSON file and submit it to the library!

---

**Happy beat building! 🎵🔥**
