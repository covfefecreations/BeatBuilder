# Changelog

All notable changes to the BeatBuilder project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned Features
- Audio preview playback for all library patterns
- Pattern combination presets (save favorite drum+bass+chord combos)
- User-contributed pattern upload system
- Advanced chord progressions (modal interchange, jazz extensions)
- Additional genre-specific drum patterns (rock, metal, Latin)
- Export to MIDI with full arrangement support
- BandLab integration for direct project import

---

## [0.3.0] - 2025-10-27

### Added - Library Integration & Expansion
- **Integrated 30 patterns from old project into library system**
  - 10 new drum patterns spanning 160-176 BPM across multiple genres
  - 10 new bass progressions covering major/minor keys with emotional characteristics
  - 10 brand new lead motifs featuring pentatonic, Phrygian, Lydian, and modal scales
- **New library category: `/library/leads/`**
  - First implementation of melodic lead patterns
  - Includes scale degree notation and mood descriptors
- **Library expansion: 17 → 47 total patterns (+176% growth)**
  - Drums: 4 → 14 patterns
  - Bass: 8 → 18 patterns
  - Chords: 5 patterns (unchanged)
  - Leads: 0 → 10 patterns (NEW!)

### Changed
- Updated `LIBRARY_README.md` with comprehensive documentation for all 47 patterns
- Organized patterns into "Original" and "Extended Collection" categories
- Enhanced pattern metadata with BPM, genre, energy level, and mood descriptors

### Pattern Details

#### New Drum Patterns
1. **Rising Steam** (172 BPM) - Cinematic/Electronic four-on-the-floor
2. **Trap Stutter** (165 BPM) - Trap/Hip-Hop stuttering syncopation
3. **Solar Pulse** (168 BPM) - House/Electronic propulsive rhythm
4. **Broken Clock** (170 BPM) - Experimental/IDM off-kilter pattern
5. **Neon Rush** (174 BPM) - DnB/Breakbeat high-energy rapid fire
6. **Underflow** (162 BPM) - Minimal/Techno deep sparse space
7. **Metro Snap** (170 BPM) - Tech House/Techno metronomic drive
8. **Glass Hat** (168 BPM) - Ambient/Downtempo shimmery hi-hat only
9. **Pulse Engine** (176 BPM) - Techno/Industrial relentless hypnotic
10. **Lazy Groove** (160 BPM) - Lo-Fi/Chill laid-back spacing

#### New Bass Progressions
1. **Warm Circuit** (C-Am-F-G) - Hopeful/nostalgic in C Major
2. **Iron Root** (Am-F-C-G) - Dark/resolute in A Minor
3. **Glass Pulse** (Em-C-G-D) - Airy/driving in E Minor
4. **Low Beacon** (Dm-Bb-F-C) - Brooding/wide in D Minor
5. **Sunny Motion** (G-Em-C-D) - Bright/open in G Major
6. **Syncopated Anchor** (Fm-Db-Ab-Eb) - Funky/punchy in F Minor
7. **Submarine** (Cm-Ab-Eb-Bb) - Deep/distant in C Minor
8. **Walking Groove** (Bb-Gm-Eb-F) - Groovy/warm in Bb Major
9. **Prismatic** (A-F#m-D-E) - Urgent/clean in A Major
10. **Hollow Root** (Ebm-Bbm-Ab-Gb) - Mournful/lush in Eb Minor

#### New Lead Motifs
1. **Neon Veins** - E Minor Pentatonic, heroic/bright ascent
2. **Sigh Motif** - A Minor, melancholic/soft descent
3. **Bolt** - B Phrygian, aggressive/sharp stab
4. **Halo** - C Lydian, dreamy/upward rise
5. **Glass Lead** - D Major, clear/anthemic arc
6. **Wisp** - F Minor Pentatonic, ethereal/sparse
7. **Driver** - G Minor, punchy/hooky phrase
8. **Orbit** - C Minor, mysterious/expansive
9. **Shard** - E Major, iridescent/tense climb
10. **Quiet Cry** - Bb Minor, longing/soft descent

---

## [0.2.0] - 2025-10-27

### Added - Pattern Library System
- **Comprehensive pattern library architecture** (`/library` folder structure)
  - Organized categories: drums, bass, chords
  - JSON-based pattern format with standardized metadata
- **LibraryManager class** (`src/librarymanager.js`)
  - Asynchronous pattern loading system
  - Search, filter, and retrieval APIs
  - Pattern categorization by type, genre, energy, and emotion
- **PatternSelector UI component** (`src/patternselector.js`)
  - Visual browser for library patterns
  - Filter by type (drums, bass, chords)
  - Search functionality
  - Pattern preview cards with metadata display
- **Initial pattern collection (17 patterns)**
  - 4 drum patterns (intro, chorus, verse, outro)
  - 8 bass patterns (various rhythmic styles and progressions)
  - 5 chord progressions (pop, jazz, emotional varieties)
- **Library demo page** (`library_demo.html`)
  - Interactive demonstration of library system
  - Pattern browsing and selection interface
- **LIBRARY_README.md** - Comprehensive documentation
  - Usage examples and API documentation
  - Pattern file format specifications
  - Integration guides for developers

### Enhanced
- Pattern metadata standardization
  - ID, name, description fields
  - Genre, energy level, BPM markers
  - Musical notation formats (text-based grid notation)
  - Performance tips and usage notes

---

## [0.1.0] - Initial Release

### Added - Core Sequencer Functionality
- **SVG-based visual sequencer** (`main.js`, `src/visualsequencer.js`)
  - Multi-track grid interface
  - Click-to-toggle note activation
  - Drag-to-move quantized note editing
  - Visual playhead indicator
  - Responsive grid rendering
- **Audio engine** (`src/audioengine.js`)
  - Tone.js integration for synthesis and playback
  - Sample-based drum playback
  - Synthesizer-based bass and chord instruments
  - Transport-based scheduling system
  - Per-track audio routing
- **MIDI capabilities** (`src/midimanager.js`)
  - Live MIDI input recording via WebMIDI API
  - Quantize-to-grid functionality
  - Real-time note capture and velocity tracking
- **JSON data system**
  - Data adapters for drums, bass, and chords
  - `DrumAdapter` (`src/drumadapter.js`) - Converts drum notation to sequencer format
  - `BassAdapter` (`src/bassadapter.js`) - Handles bass progression patterns
  - `ChordAdapter` (`src/chordadapter.js`) - Manages chord sequence data
  - `DataManager` (`src/datamanager.js`) - File loading utilities
- **Export functionality** (`src/exportmanager.js`)
  - Export to JSON format
  - MIDI file generation via MidiWriterJS
  - Session state preservation
- **Sample library** (`/assets/samples`)
  - Kick, Snare, Hi-hat WAV samples
  - Extensible sample loading system
- **Core UI** (`index.html`, `style.css`)
  - Transport controls (play, stop, BPM)
  - Track controls panel
  - Status bar with playback position
  - Export buttons
  - Responsive layout

### Pattern Data
- **Drum patterns** (`data/drums.json`, `instruments/drums.json`)
  - Tutorial-style rhythm building guide
  - Section-based organization (intro, chorus, verse, outro)
  - Grid notation format ("X" for hits, "-" for rests)
  - Ghost note support (lowercase "x")
- **Bass patterns** (`data/bass.json`, `instruments/bass.json`)
  - Chord progression data
  - Rhythmic variation templates
- **Chord progressions** (`data/chords.json`, `instruments/chords.json`)
  - Common progressions with emotional character descriptions
  - Voicing information

### Architecture
- **Modular ES6 structure**
  - Clean separation of concerns
  - Reusable components
  - Import/export module system
- **External dependencies**
  - Tone.js 14.8.49 (audio synthesis and scheduling)
  - MidiWriterJS 2.1.4 (MIDI file export)
  - CDN-based loading (no build step required)

### Documentation
- **README.md** - Basic project overview and quickstart
- **LICENSE** - Project licensing information

---

## Project Metadata

### Technologies Used
- **JavaScript (ES6 Modules)** - Core application logic
- **SVG** - Visual sequencer rendering
- **Web Audio API** (via Tone.js) - Sound synthesis and playback
- **WebMIDI API** - MIDI input/output
- **HTML5/CSS3** - User interface and styling
- **JSON** - Data storage and pattern definitions

### Browser Compatibility
- Modern browsers with ES6 module support
- Chrome/Edge (recommended for WebMIDI support)
- Firefox, Safari (limited MIDI support)
- Requires local server for ES6 module loading

### Purpose
BeatBuilder is a pre-design module for creating musical beats intended for import into BandLab or other DAWs. It provides:
1. A visual sequencer for rhythm programming
2. A comprehensive library of musical patterns
3. MIDI recording and quantization
4. Export capabilities for integration with external tools

---

## Development Notes

### Version Numbering
- **Major version** (X.0.0) - Significant architectural changes or major feature additions
- **Minor version** (0.X.0) - New features, library expansions, component additions
- **Patch version** (0.0.X) - Bug fixes, documentation updates, minor tweaks

### Contributors
- Development assisted by Claude (Anthropic AI)
- Pattern library curation and integration
- Architecture design and implementation

---

## Links & Resources

- **GitHub Repository**: [covfefecreations/BeatBuilder](https://github.com/covfefecreations/BeatBuilder)
- **Tone.js Documentation**: https://tonejs.github.io/
- **WebMIDI API**: https://www.w3.org/TR/webmidi/
- **BandLab**: https://www.bandlab.com/

---

*Last Updated: October 27, 2025*
