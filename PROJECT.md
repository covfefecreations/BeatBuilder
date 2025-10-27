# BeatBuilder - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Capabilities & Features](#capabilities--features)
3. [Project Ambitions](#project-ambitions)
4. [Architecture](#architecture)
5. [File-by-File Documentation](#file-by-file-documentation)
6. [Development Status](#development-status)
7. [Technical Stack](#technical-stack)

---

## Project Overview

**BeatBuilder** is a browser-based music production pre-design tool that serves as a compositional sandbox for creating beats, basslines, chord progressions, and melodic hooks before importing them into professional DAWs like BandLab.

### What Problem Does It Solve?

Musicians and producers often face two challenges:
1. **Analysis Paralysis** - Staring at a blank DAW with infinite possibilities
2. **Pattern Reference** - Needing quick access to proven musical patterns and progressions

BeatBuilder solves this by providing:
- A curated library of 47 professionally-crafted patterns
- A visual sequencer to see and hear patterns immediately
- The ability to mix and match drums, bass, chords, and leads
- Export capabilities to transfer ideas into your DAW

### Core Philosophy

BeatBuilder is not a full DAW replacement. It's a **pre-design module** - a creative sketchpad where you:
1. Browse and audition musical patterns
2. Combine them into arrangements
3. Record MIDI ideas with quantization
4. Export structured data (JSON/MIDI) for use in your actual production environment

Think of it as "LEGO blocks for music" - modular, visual, and designed to accelerate the creative process.

---

## Capabilities & Features

### Current Capabilities (v0.3.0)

#### 1. **Pattern Library System** 📚
- **47 curated patterns** across 4 categories:
  - 14 drum patterns (160-176 BPM, multiple genres)
  - 18 bass progressions (major/minor keys, various moods)
  - 5 chord progressions (pop, jazz, emotional varieties)
  - 10 lead motifs (pentatonic, modal scales)
- **Smart organization** by genre, energy level, mood, and BPM
- **JSON-based storage** for easy extensibility
- **Search and filter** functionality
- **Pattern preview cards** with musical metadata

#### 2. **Visual SVG Sequencer** 🎹
- **Multi-track grid interface** with piano roll-style visualization
- **Click-to-toggle** note activation
- **Drag-to-move** quantized note editing
- **Real-time playback** with visual cursor
- **Per-track controls** (volume, solo, mute - *in progress*)
- **Responsive zoom** and timeline navigation
- **Step numbers** and bar markers for musical orientation

#### 3. **Audio Engine** 🔊
- **Tone.js-powered synthesis** for high-quality playback
- **Sample-based drum sounds** (kick, snare, hi-hat)
- **Synthesizer instruments** for bass and chords:
  - MonoSynth for bass (sawtooth oscillator, lowpass filter)
  - PolySynth for chords (6-voice polyphony)
- **Transport-based scheduling** for tight timing
- **Per-track audio routing** with individual gain control
- **Loop mode** for continuous pattern repetition

#### 4. **MIDI Recording & Quantization** 🎹
- **Live MIDI input** via WebMIDI API
- **Real-time quantization** to grid (16th notes, 8th notes, etc.)
- **Velocity capture** for expressive performance
- **Timestamped recording** with beat-accurate conversion
- **Support for external MIDI controllers**

#### 5. **Data Import/Export** 💾
- **JSON export** - Complete session state preservation
- **MIDI file export** via MidiWriterJS
- **JSON import** - Load pre-made patterns and arrangements
- **Data adapters** for flexible format conversion:
  - Drum notation adapter (X/- grid format)
  - Bass progression adapter
  - Chord sequence adapter

#### 6. **Pattern Browsing UI** 🖼️
- **Interactive pattern selector** component
- **Filter by category** (drums, bass, chords, leads)
- **Text search** across pattern names and descriptions
- **Visual pattern cards** with:
  - Name and description
  - Genre and energy level
  - BPM and mood indicators
  - Tips and usage notes
  - Load button for instant sequencer integration

---

## Project Ambitions

### Short-Term Goals (Next 3-6 Months)

1. **Enhanced Pattern Library**
   - Expand to 100+ patterns
   - Add genre-specific collections (rock, metal, Latin, techno)
   - User-contributed pattern submission system
   - Pattern rating and favorites system

2. **BandLab Integration**
   - Direct export to BandLab projects
   - One-click "Send to BandLab" button
   - Automatic track and instrument mapping
   - Tempo and key signature transfer

3. **Audio Preview System**
   - Per-pattern audio preview (play before loading)
   - Waveform visualization for each pattern
   - Sample playback without loading into sequencer
   - Pattern combination preview (hear drum+bass+chord together)

4. **Advanced Sequencer Features**
   - Per-step velocity editing
   - Note duration control (not just on/off)
   - Track effects (reverb, delay, EQ)
   - Automation lanes for volume and parameters
   - Swing/humanization controls

### Mid-Term Goals (6-12 Months)

1. **Arrangement View**
   - Timeline-based song structure editor
   - Section markers (intro, verse, chorus, bridge, outro)
   - Pattern blocks that can be arranged and repeated
   - Drag-and-drop arrangement building
   - Full song export with transitions

2. **Collaboration Features**
   - Cloud save/load for projects
   - Share patterns and arrangements via URL
   - Community pattern library
   - Remix and derive from other users' patterns
   - Comments and feedback system

3. **Mobile Responsive Design**
   - Touch-optimized sequencer grid
   - Mobile-friendly pattern browser
   - Responsive layout for tablets and phones
   - Native app wrappers (Electron/PWA)

4. **Enhanced Musical Intelligence**
   - Key detection and transposition
   - Chord progression suggestions
   - Automatic drum variation generation
   - Scale-aware melody creation
   - Harmonic analysis of patterns

### Long-Term Vision (1-2 Years)

1. **AI-Assisted Composition**
   - Machine learning pattern generation
   - Style transfer (apply style of one pattern to another)
   - Intelligent arrangement suggestions
   - Automatic mixing and mastering presets
   - Generative melody creation

2. **Full DAW Integration**
   - VST/AU plugin support
   - ReWire compatibility
   - Ableton Link synchronization
   - MIDI CC mapping for hardware controllers
   - Multi-DAW export (Logic, FL Studio, Ableton)

3. **Educational Platform**
   - Interactive music theory lessons
   - Pattern analysis and explanation
   - Tutorial mode with guided creation
   - Video lessons integrated with patterns
   - Genre-specific production courses

4. **Marketplace & Ecosystem**
   - Premium pattern packs from producers
   - Sample pack integration
   - VST instrument presets library
   - Template arrangements for sale
   - Producer collaboration network

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BeatBuilder Application                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     User Interface Layer                  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   index.html │  │  style.css   │  │ library_demo │   │  │
│  │  │  (Main UI)   │  │  (Styling)   │  │    .html     │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▲                                       │
│                          │                                       │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │                 Core Application Layer                     │  │
│  ├────────────────────────────────────────────────────────────┤│
│  │                                                             ││
│  │  ┌─────────────┐      ┌──────────────┐      ┌──────────┐ ││
│  │  │   main.js   │◄────►│VisualSeq.js  │◄────►│ Audio    │ ││
│  │  │ (Orchestr.) │      │(Sequencer UI)│      │Engine.js │ ││
│  │  └─────────────┘      └──────────────┘      └──────────┘ ││
│  │         ▲                                         ▲        ││
│  │         │                                         │        ││
│  │         ▼                                         ▼        ││
│  │  ┌──────────────────┐                   ┌──────────────┐ ││
│  │  │  PatternSelector │                   │   MIDI       │ ││
│  │  │      .js         │                   │  Manager.js  │ ││
│  │  │  (Library UI)    │                   │  (Input)     │ ││
│  │  └──────────────────┘                   └──────────────┘ ││
│  │         ▲                                                 ││
│  │         │                                                 ││
│  └─────────┼─────────────────────────────────────────────────┘│
│            │                                                   │
│  ┌─────────┴─────────────────────────────────────────────────┐│
│  │              Data Management Layer                         ││
│  ├────────────────────────────────────────────────────────────┤│
│  │                                                             ││
│  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐   ││
│  │  │  Library     │  │  Data         │  │  Export      │   ││
│  │  │  Manager.js  │  │  Manager.js   │  │  Manager.js  │   ││
│  │  │  (Patterns)  │  │  (JSON Load)  │  │  (JSON/MIDI) │   ││
│  │  └──────────────┘  └───────────────┘  └──────────────┘   ││
│  │         ▲                   ▲                  ▲           ││
│  │         │                   │                  │           ││
│  └─────────┼───────────────────┼──────────────────┼───────────┘│
│            │                   │                  │            │
│  ┌─────────┴───────────────────┴──────────────────┴─────────┐ │
│  │                    Data Adapters Layer                    │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │   Drum       │  │    Bass      │  │    Chord     │   │ │
│  │  │  Adapter.js  │  │  Adapter.js  │  │  Adapter.js  │   │ │
│  │  │  (Convert)   │  │  (Convert)   │  │  (Convert)   │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  │         ▲                   ▲                  ▲          │ │
│  │         │                   │                  │          │ │
│  └─────────┼───────────────────┼──────────────────┼──────────┘ │
│            │                   │                  │            │
│  ┌─────────┴───────────────────┴──────────────────┴──────────┐ │
│  │                    Data Storage Layer                      │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                             │ │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐ │ │
│  │  │  /library  │  │  /data     │  │  /instruments        │ │ │
│  │  │   (47      │  │  (Legacy   │  │  (Working            │ │ │
│  │  │  patterns) │  │  patterns) │  │   patterns)          │ │ │
│  │  └────────────┘  └────────────┘  └──────────────────────┘ │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │              /assets/samples                          │ │ │
│  │  │              (Audio files: Kick, Snare, Hi-hat)      │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  External Dependencies                       │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  • Tone.js 14.8.49 (Audio synthesis via CDN)               │ │
│  │  • MidiWriterJS 2.1.4 (MIDI export via CDN)                │ │
│  │  • Web Audio API (Browser native)                          │ │
│  │  • WebMIDI API (Browser native)                            │ │
│  │  • SVG (Browser native)                                    │ │
│  │                                                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌──────────────┐
│     User     │
│  Interaction │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│          UI Event (click, MIDI, etc.)           │
└──────┬──────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│   main.js (Event Router & Orchestrator)         │
└──────┬──────────────┬───────────────────────────┘
       │              │
       ▼              ▼
┌──────────────┐  ┌────────────────────┐
│ Library      │  │ VisualSequencer    │
│ Pattern Load │  │ UI Update          │
└──────┬───────┘  └────────┬───────────┘
       │                   │
       ▼                   ▼
┌──────────────────────────────────────┐
│        Data Adapter Layer            │
│  (Convert JSON → Track Objects)      │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│      Unified Track Format            │
│  { id, title, bpm, pattern: [...] } │
└──────┬───────────────────────────────┘
       │
       ├───────────────┬────────────────┐
       ▼               ▼                ▼
┌────────────┐  ┌──────────────┐  ┌──────────┐
│ Visual     │  │ AudioEngine  │  │ Export   │
│ Sequencer  │  │ (Tone.js)    │  │ Manager  │
│ (Render)   │  │ (Schedule)   │  │ (Output) │
└────────────┘  └──────┬───────┘  └──────────┘
                       │
                       ▼
                ┌──────────────┐
                │ Audio Output │
                │  (Speakers)  │
                └──────────────┘
```

### Module Dependency Graph

```
main.js
  ├─► AudioEngine.js
  │     └─► Tone.js (external)
  ├─► MidiManager.js
  │     ├─► AudioEngine.js
  │     └─► WebMIDI API (browser)
  ├─► ExportManager.js
  │     └─► MidiWriterJS (external)
  ├─► DataManager.js
  ├─► DrumAdapter.js
  ├─► BassAdapter.js
  ├─► ChordAdapter.js
  ├─► VisualSequencer.js
  │     └─► SVG API (browser)
  └─► (implicitly references library files)

library_demo.html
  ├─► LibraryManager.js
  └─► PatternSelector.js
        └─► LibraryManager.js

LibraryManager.js
  └─► /library/*.json files
```

---

## File-by-File Documentation

### Root Directory Files

#### `index.html`
**Purpose:** Main application entry point and UI structure
**Function:**
- Defines the HTML structure for the sequencer interface
- Loads external dependencies (Tone.js, MidiWriterJS) via CDN
- Contains transport controls (play, stop, BPM input)
- Includes advanced controls (load data, MIDI record, quantize selector, export buttons)
- Defines containers for:
  - Track controls panel
  - Step numbers display
  - SVG sequencer grid
  - Status bar (playback position, track count, BPM)
- Imports `main.js` as ES6 module

**Status:** ✅ **Functionally complete** for current scope
**Potential Improvements:**
- Add pattern library browser integration
- Include arrangement view section
- Add track effects panel
- Enhance status bar with more metrics

---

#### `library_demo.html`
**Purpose:** Standalone demonstration page for the pattern library system
**Function:**
- Showcases PatternSelector UI component
- Demonstrates library browsing and filtering
- Serves as integration example for developers
- Provides isolated testing environment for library features
- Loads LibraryManager and PatternSelector modules

**Status:** ✅ **Functionally complete** as demo
**Potential Improvements:**
- Add "Load into Sequencer" button that opens index.html with pattern
- Include audio preview playback
- Add more interactive examples
- Integrate with main app instead of separate page

---

#### `main.js`
**Purpose:** Application orchestrator and event coordinator
**Function:**
- Initializes all core systems on DOMContentLoaded
- Creates instances of:
  - AudioEngine (synthesis and playback)
  - MidiManager (MIDI I/O)
  - ExportManager (JSON/MIDI export)
  - DataManager (file loading)
- Manages global application state (playing status, BPM, tracks)
- Loads drum instrument samples
- Parses and adapts JSON data via adapters
- Renders visual sequencer
- Sets up event listeners for all UI controls:
  - Play/Stop buttons
  - BPM input
  - Load data button
  - MIDI record/stop buttons
  - Export buttons (JSON, MIDI)
  - Quantize selector
- Handles window resize events
- Manages playback loop and status updates

**Status:** ⚠️ **Needs refactoring and expansion**
**Current Issues:**
- Monolithic structure (600+ lines)
- Mixing concerns (UI, state, coordination)
- Hard-coded sample paths
- No library integration yet

**Needed Changes:**
1. Extract state management into separate module
2. Create dedicated UI controller class
3. Integrate LibraryManager for pattern loading
4. Add event bus for decoupled communication
5. Implement proper error handling
6. Add loading states and user feedback
7. Create configuration file for settings

---

#### `style.css`
**Purpose:** Visual styling for the entire application
**Function:**
- Defines dark theme color palette
- Styles sequencer grid and controls
- Responsive layout rules
- Button and input styling
- Track control panel appearance
- Status bar formatting
- Animation effects (playhead, hover states)
- Mobile breakpoints (partial)

**Status:** ⚠️ **Functional but needs expansion**
**Needed Changes:**
1. Add pattern selector UI styles
2. Implement comprehensive responsive design
3. Add animation transitions
4. Create CSS variables for theming
5. Organize into logical sections
6. Add print styles for documentation
7. Optimize for mobile touch targets

---

#### `README.md`
**Purpose:** Project quickstart and developer onboarding
**Function:**
- Provides high-level project description
- Lists key features
- Explains how to run locally
- Describes file structure
- Links to Tone.js and WebMIDI resources

**Status:** ⚠️ **Outdated - needs major update**
**Needed Changes:**
1. Update feature list with library system
2. Add screenshots/GIFs of UI
3. Include architecture overview
4. Expand installation instructions
5. Add contribution guidelines
6. Link to PROJECT.md and CHANGELOG.md
7. Include badge shields (version, license, status)

---

#### `LIBRARY_README.md`
**Purpose:** Comprehensive documentation for the pattern library system
**Function:**
- Documents all 47 patterns with descriptions
- Explains library structure and organization
- Provides code examples for library usage
- Details pattern file format specifications
- Includes musical concepts and production tips
- Shows integration examples for developers

**Status:** ✅ **Functionally complete and comprehensive**
**Potential Improvements:**
- Add pattern audio preview links (when implemented)
- Include more complex usage examples
- Add troubleshooting section
- Create pattern contribution guide

---

#### `CHANGELOG.md`
**Purpose:** Version history and release notes
**Function:**
- Documents all project changes chronologically
- Tracks feature additions, bug fixes, and improvements
- Provides context for each version
- Lists all patterns added in v0.3.0
- Follows Keep a Changelog format

**Status:** ✅ **Functionally complete and up-to-date**
**Maintenance:** Update with each release

---

#### `LICENSE`
**Purpose:** Legal licensing information
**Function:** Defines terms of use and redistribution
**Status:** ✅ **Complete**

---

### `/src` Directory - Core Application Modules

#### `src/audioengine.js`
**Purpose:** Audio synthesis, playback, and scheduling engine
**Function:**
- Initializes Tone.js audio context
- Loads drum samples (kick, snare, hi-hat) into Tone.Player objects
- Creates synthesizers:
  - MonoSynth for bass (sawtooth, lowpass filter)
  - PolySynth for chords (6-voice, triangle oscillator)
- Manages Transport-based scheduling via Tone.Part
- Handles track loading and pattern scheduling
- Triggers note playback (drums, bass, chords)
- Controls playback state (start, stop, BPM)
- Implements MIDI recording buffer with timestamps
- Provides quantization for recorded MIDI notes
- Calculates loop duration based on pattern length

**Status:** ✅ **Functionally complete** for basic features
**Potential Improvements:**
1. Add per-track volume/pan controls
2. Implement solo/mute functionality
3. Add effects chain (reverb, delay, EQ)
4. Support custom sample loading
5. Implement swing/groove controls
6. Add velocity curve editing
7. Support time signature changes
8. Improve quantization algorithms (groove templates)

---

#### `src/midimanager.js`
**Purpose:** WebMIDI API integration for live input
**Function:**
- Requests MIDI access from browser
- Enumerates connected MIDI devices
- Sets up note on/off message listeners
- Captures note velocity and timestamp
- Forwards MIDI events to AudioEngine for recording
- Handles MIDI device connect/disconnect events
- Provides device selection UI (potential)

**Status:** ✅ **Functionally complete** for basic MIDI input
**Potential Improvements:**
1. Add MIDI device selector UI
2. Implement MIDI output (send to external devices)
3. Support MIDI CC mapping for parameters
4. Add MIDI learn functionality
5. Implement MIDI clock sync
6. Support MPE (MIDI Polyphonic Expression)
7. Add MIDI channel filtering

---

#### `src/exportmanager.js`
**Purpose:** Data export to JSON and MIDI formats
**Function:**
- Exports session state to JSON:
  - All tracks with patterns
  - BPM and time signature
  - Track metadata (name, color, type)
- Generates MIDI files via MidiWriterJS:
  - Converts tracks to MIDI tracks
  - Sets tempo and time signature
  - Writes note events with timing and velocity
- Triggers browser download for exported files
- Handles file naming (timestamp-based)

**Status:** ⚠️ **Functional but limited**
**Needed Changes:**
1. Improve MIDI export accuracy (timing issues)
2. Support multi-bar patterns in MIDI
3. Add drum mapping options (GM, custom)
4. Include track metadata in MIDI meta events
5. Support exporting arrangement (multi-pattern sequences)
6. Add WAV/MP3 audio export (via Tone.Recorder)
7. Implement clipboard export (copy pattern data)

---

#### `src/datamanager.js`
**Purpose:** Simple JSON file loader utility
**Function:**
- Provides async `loadData(name)` method
- Fetches JSON files from `/data` directory
- Returns parsed JSON objects
- Basic error handling for failed loads

**Status:** ✅ **Functionally complete** for simple loading
**Potential Improvements:**
1. Add caching layer to avoid redundant fetches
2. Implement batch loading with progress
3. Add validation for loaded JSON structure
4. Support loading from URLs or user uploads
5. Implement save functionality (local storage, cloud)

---

#### `src/drumadapter.js`
**Purpose:** Convert drum JSON notation to sequencer-compatible track format
**Function:**
- Parses `drums.json` or `instruments/drums.json` structure:
  - Reads groove sections (intro, chorus, verse, outro)
  - Extracts bar-by-bar notation for each instrument
  - Converts grid notation ("X" = hit, "-" = rest, "x" = ghost note)
- Creates unified track objects:
  - id, title, bpm fields
  - pattern array with {time (beats), note (instrument name), velocity, active}
  - meta.type = "drums"
  - color coding
- Handles ghost notes (lowercase "x") with reduced velocity
- Supports multi-bar patterns

**Status:** ✅ **Functionally complete**
**Potential Improvements:**
1. Add support for velocity notation in grid (e.g., "X1", "X2", "X3")
2. Support triplet notation
3. Handle variable bar lengths
4. Add drum kit mapping configuration

---

#### `src/bassadapter.js`
**Purpose:** Convert bass progression JSON to sequencer-compatible track format
**Function:**
- Parses bass JSON structure:
  - Reads chord progressions or note patterns
  - Extracts rhythm information (whole notes, quarter notes, etc.)
- Creates unified track objects with:
  - pattern array containing {time, note (pitch), velocity, active}
  - progression metadata
  - BPM and key information
- Handles different rhythm styles (whole notes, 8ths, walking bass)
- Converts chord symbols to bass note pitches

**Status:** ✅ **Functionally complete** for basic patterns
**Potential Improvements:**
1. Add automatic root-fifth-octave pattern generation
2. Support slash chords (e.g., C/E for first inversion)
3. Implement walking bass line generation
4. Add groove templates (disco, funk, reggae)
5. Support multiple bass synthesis types (sub, picked, slap)

---

#### `src/chordadapter.js`
**Purpose:** Convert chord progression JSON to sequencer-compatible track format
**Function:**
- Parses chord JSON structure:
  - Reads chord sequences (C, G, Am, F, etc.)
  - Extracts voicing information (notes in each chord)
  - Gets rhythm patterns (strumming, arpeggios, sustained)
- Creates unified track objects with:
  - pattern array containing {time, note (can be array for chords), velocity, active}
  - chord progression metadata
  - Emotional character and key info
- Handles different chord types (major, minor, 7ths, extended)
- Converts chord symbols to specific voicings (note arrays)

**Status:** ⚠️ **Functional but needs expansion**
**Needed Changes:**
1. Add more voicing options (jazz, open, closed)
2. Support chord inversions
3. Implement strum patterns and arpeggios
4. Add voice leading logic (smooth transitions)
5. Support extended chords (9th, 11th, 13th, add, sus)
6. Implement automatic chord suggestions based on key

---

#### `src/visualsequencer.js`
**Purpose:** SVG-based visual sequencer grid renderer and editor
**Function:**
- Creates multi-track SVG grid visualization:
  - Renders horizontal grid lines (tracks)
  - Renders vertical grid lines (beats/steps)
  - Colors tracks for visual distinction
- Displays note events as rectangles:
  - Position based on time (beats)
  - Color based on velocity/active state
  - Width based on note duration
- Implements interactive editing:
  - Click to toggle note on/off
  - Drag to move notes (quantized to grid)
  - Hover effects for visual feedback
- Renders playhead cursor during playback
- Handles zoom and timeline scrolling
- Updates display in response to pattern changes

**Status:** ⚠️ **Functional but needs significant enhancement**
**Needed Changes:**
1. Implement velocity editing (visual indicators, drag to adjust)
2. Add note duration editing (resize notes)
3. Support selection (multi-note operations)
4. Implement copy/paste functionality
5. Add undo/redo stack
6. Improve touch support for mobile
7. Add snap-to-scale/key constraints
8. Implement rubber-band selection
9. Add minimap for navigation in long patterns
10. Support vertical zoom (track height adjustment)

---

#### `src/librarymanager.js`
**Purpose:** Pattern library loader and API
**Function:**
- Loads all pattern JSON files from `/library` directory:
  - Drums from `/library/drums/*.json`
  - Bass from `/library/bass/*.json`
  - Chords from `/library/chords/*.json`
  - Leads from `/library/leads/*.json` (NEW)
- Provides getter methods:
  - `getPatternsByType(type)` - filter by category
  - `getPatternById(id)` - retrieve specific pattern
  - `searchPatterns(query)` - text search
  - `getPatternsByEnergy(level)` - filter by energy
  - `getPatternsByGenre(genre)` - filter by style
  - `getRandomPattern(type)` - get random from category
- Maintains in-memory cache of loaded patterns
- Returns pattern metadata and notation

**Status:** ⚠️ **Needs update for new patterns**
**Needed Changes:**
1. **CRITICAL:** Update hardcoded pattern list to include all 30 new patterns
2. Add lead motifs to loading system
3. Implement automatic pattern discovery (scan directory)
4. Add pattern validation (check required fields)
5. Support pattern favorites/bookmarks
6. Implement pattern tags for better organization
7. Add pattern versioning support
8. Cache optimization for large libraries

---

#### `src/patternselector.js`
**Purpose:** Visual UI component for browsing and selecting library patterns
**Function:**
- Renders pattern browser interface:
  - Header with pattern count statistics
  - Filter buttons (All, Drums, Bass, Chords, Leads)
  - Search input field
  - Grid of pattern cards
- Creates pattern cards with:
  - Pattern name and description
  - Genre, energy, BPM badges
  - Mood/emotional character
  - Tips and usage notes
  - "Load" button
- Implements filtering by category
- Implements text search across pattern metadata
- Handles pattern selection callback
- Updates UI based on filter/search state

**Status:** ⚠️ **Needs update and enhancement**
**Needed Changes:**
1. Add lead motifs category to filters
2. Implement multi-tag filtering (genre + energy)
3. Add sort options (BPM, name, energy, date added)
4. Include audio preview button
5. Add favorite/star functionality
6. Implement lazy loading for large libraries
7. Add pattern comparison view
8. Include pattern usage statistics (most popular)

---

#### `src/app.js`
**Purpose:** Unknown/unclear - possibly legacy file
**Function:**
- File exists but not currently referenced by main.js
- May be from old project architecture
- Requires investigation

**Status:** ❓ **Needs investigation**
**Action Required:**
1. Determine if file is used anywhere
2. If unused, consider removal
3. If legacy, document purpose and archive

---

#### `src/main.js`
**Purpose:** Unknown/duplicate? (same name as root main.js)
**Function:**
- Duplicate filename in different location
- Requires investigation

**Status:** ❓ **Needs investigation**
**Action Required:**
1. Compare with root `/main.js`
2. Determine which is active
3. Remove or rename duplicate
4. Update imports if necessary

---

### `/library` Directory - Pattern Data

#### `/library/drums/` (14 files)
**Purpose:** Drum pattern definitions in JSON format
**Files:**
- `intro_build.json` - Building pattern from minimal to full
- `chorus_syncopated.json` - Hip-hop/pop syncopated kicks
- `verse_steady.json` - Steady groove with hat variations
- `outro_minimal.json` - Minimal ending pattern
- `rising_steam.json` - Four-on-the-floor cinematic (172 BPM)
- `trap_stutter.json` - Trap stuttering syncopation (165 BPM)
- `solar_pulse.json` - House propulsive rhythm (168 BPM)
- `broken_clock.json` - Experimental off-kilter (170 BPM)
- `neon_rush.json` - DnB high-energy (174 BPM)
- `underflow.json` - Minimal techno sparse (162 BPM)
- `metro_snap.json` - Tech house metronomic (170 BPM)
- `glass_hat.json` - Ambient hi-hat only (168 BPM)
- `pulse_engine.json` - Industrial hypnotic (176 BPM)
- `lazy_groove.json` - Lo-fi laid-back (160 BPM)

**Status:** ✅ **Complete and well-documented**

---

#### `/library/bass/` (18 files)
**Purpose:** Bass progression and pattern definitions
**Files:**
- Original 8: foundation, heartbeat, bounce, funk_foundation, walking_line, disco_drive, reggae_one_drop, anticipation
- New 10: warm_circuit, iron_root, glass_pulse, low_beacon, sunny_motion, syncopated_anchor, submarine, walking_groove, prismatic, hollow_root

**Status:** ✅ **Complete and well-documented**

---

#### `/library/chords/` (5 files)
**Purpose:** Chord progression definitions
**Files:**
- `pop_standard.json` - C-G-Am-F (hopeful)
- `minor_climb.json` - Am-G-F-G (urgent)
- `jazzy_resolve.json` - Fmaj7-G7-Em7-Am (sophisticated)
- `tension_builder.json` - Am-F-C-G (melancholic to triumphant)
- `emotional_rollercoaster.json` - C-Em-Am-F (nostalgic)

**Status:** ✅ **Complete** but could be expanded
**Potential Additions:**
- More genre-specific progressions (jazz, metal, EDM)
- Modal progressions (Dorian, Mixolydian, etc.)
- Unusual/creative progressions

---

#### `/library/leads/` (10 files) **NEW!**
**Purpose:** Lead melody motif definitions
**Files:**
- `neon_veins.json` - E Minor Pentatonic (heroic)
- `sigh_motif.json` - A Minor (melancholic)
- `bolt.json` - B Phrygian (aggressive)
- `halo.json` - C Lydian (dreamy)
- `glass_lead.json` - D Major (anthemic)
- `wisp.json` - F Minor Pentatonic (ethereal)
- `driver.json` - G Minor (punchy)
- `orbit.json` - C Minor (mysterious)
- `shard.json` - E Major (tense)
- `quiet_cry.json` - Bb Minor (longing)

**Status:** ✅ **Complete and well-documented**
**Note:** This is a new category not yet integrated into LibraryManager

---

### `/data` Directory - Legacy Pattern Data

#### `data/drums.json`
**Purpose:** Original tutorial-style drum pattern data
**Function:**
- Contains structured groove sections (intro, chorus, verse, outro)
- Bar-by-bar notation for each section
- Grid format: "X" = hit, "-" = rest, "x" = ghost note
- Includes metadata: BPM, key, sound palette

**Status:** ⚠️ **Legacy format - consider migrating**
**Recommendation:** Keep for backward compatibility but prefer `/library` patterns

---

#### `data/bass.json` and `data/chords.json`
**Purpose:** Original bass and chord pattern data
**Status:** ⚠️ **Legacy format - consider migrating**

---

#### `data/Test.test` and `data/web archive.webarchive`
**Purpose:** Unknown test/archive files
**Status:** 🗑️ **Can likely be removed**

---

### `/instruments` Directory - Working Pattern Data

#### `instruments/drums.json`, `instruments/bass.json`, `instruments/chords.json`
**Purpose:** Active pattern data used by adapters
**Function:**
- Similar to `/data` files but potentially more up-to-date
- Used by DrumAdapter, BassAdapter, ChordAdapter
- Contains tutorial-style and working patterns

**Status:** ⚠️ **Needs consolidation**
**Recommendation:**
1. Clarify difference between `/data` and `/instruments`
2. Consider merging into `/library` structure
3. Or maintain as "active working patterns" vs library

---

### `/assets` Directory

#### `/assets/samples/`
**Purpose:** Audio sample files for drum sounds
**Files:**
- `Kick.wav` - Kick drum sample
- `Snare.wav` - Snare drum sample
- `Hihat.wav` - Hi-hat sample
- `5.test` - Unknown test file (remove?)

**Status:** ✅ **Functional** but limited
**Potential Improvements:**
1. Add more drum samples (toms, crashes, rides)
2. Include multiple kick/snare variations
3. Add bass and synth samples
4. Organize into kits (acoustic, electronic, 808, etc.)
5. Support user sample upload

---

### `/OldProjectMergeFiles` Directory

**Purpose:** Archive of previous project version
**Contents:** Original BeatGrid app files used as source for pattern integration
**Status:** 📦 **Archive - can be removed after verification**
**Recommendation:** Keep temporarily, then remove once integration is verified

---

## Development Status

### Overall Project Maturity: **Alpha/Beta (v0.3.0)**

The project is functional and usable but requires significant polish and feature completion before 1.0 release.

---

### Functionally Complete Components ✅

1. **Pattern Library Data Structure**
   - All 47 patterns properly formatted
   - Comprehensive metadata
   - Well-documented

2. **Basic Audio Playback**
   - Tone.js integration working
   - Drum samples loading and playing
   - Bass and chord synthesis functional

3. **Simple MIDI Recording**
   - WebMIDI input capture works
   - Basic quantization functional

4. **JSON/MIDI Export**
   - Basic export to both formats works
   - File download triggers properly

5. **Library Documentation**
   - LIBRARY_README.md comprehensive
   - CHANGELOG.md up-to-date
   - Pattern metadata complete

---

### Needs Immediate Attention ⚠️

1. **LibraryManager Pattern List** 🔴 CRITICAL
   - Hardcoded pattern array outdated
   - Missing 30 new patterns
   - Needs update to include all drums, bass, and NEW leads
   - **Priority: HIGH**

2. **Main.js Refactoring** 🔴 CRITICAL
   - Monolithic structure (600+ lines)
   - No library integration
   - Mixing concerns
   - Hard to maintain/extend
   - **Priority: HIGH**

3. **Pattern Selector UI** 🟡 IMPORTANT
   - Missing lead motifs category
   - No audio preview
   - Limited filtering options
   - **Priority: MEDIUM**

4. **Visual Sequencer Enhancements** 🟡 IMPORTANT
   - No velocity editing
   - No note duration control
   - Poor mobile support
   - No undo/redo
   - **Priority: MEDIUM**

5. **File Organization** 🟢 LOW
   - Duplicate/unclear files (src/app.js, src/main.js)
   - Three pattern locations (/library, /data, /instruments)
   - Test files not cleaned up
   - **Priority: LOW**

---

### Missing Critical Features 🚧

1. **Library Integration into Main App**
   - Pattern browser not in index.html
   - Can't load library patterns into sequencer
   - Separate demo page instead of unified experience

2. **Audio Preview**
   - Can't audition patterns before loading
   - No waveform visualization

3. **Arrangement System**
   - No multi-pattern sequencing
   - No song structure (verse/chorus/etc.)
   - Can't build complete tracks

4. **Track Controls**
   - Volume sliders non-functional
   - No solo/mute
   - No effects

5. **Responsive Design**
   - Poor mobile/tablet experience
   - No touch optimization
   - Limited responsive CSS

---

### Quality of Life Improvements Needed 🎨

1. Better error handling and user feedback
2. Loading states and progress indicators
3. Keyboard shortcuts
4. Tooltips and help system
5. Settings/preferences panel
6. Recent patterns history
7. Undo/redo for all actions
8. Auto-save functionality
9. Dark/light theme toggle
10. Accessibility improvements (ARIA labels, keyboard nav)

---

## Technical Stack

### Core Technologies
- **JavaScript ES6+** - Modern module-based architecture
- **HTML5** - Semantic markup
- **CSS3** - Styling with flexbox/grid
- **SVG** - Vector graphics for sequencer

### External Libraries (CDN)
- **Tone.js 14.8.49** - Audio synthesis, scheduling, effects
- **MidiWriterJS 2.1.4** - MIDI file generation

### Browser APIs
- **Web Audio API** - Low-level audio (via Tone.js)
- **WebMIDI API** - MIDI device communication
- **Fetch API** - JSON file loading
- **FileReader/Blob** - File export

### Data Formats
- **JSON** - Pattern storage, session data
- **MIDI** - Export format
- **WAV** - Audio samples

### Development Tools
- **VS Code Live Server** - Local development server
- **Git/GitHub** - Version control
- **ES6 Modules** - No build step required (browser-native)

---

## Getting Started (For New Developers)

### Prerequisites
- Modern web browser (Chrome recommended for WebMIDI)
- Local web server (VS Code Live Server, Python SimpleHTTPServer, or Node http-server)
- MIDI controller (optional, for recording)

### Installation
1. Clone the repository
2. Start local server in project root
3. Open `index.html` in browser
4. Click "Load All Data" to load patterns
5. Click Play to hear the demo pattern

### Key Entry Points
- **For UI work:** Start with `index.html` and `style.css`
- **For audio work:** Start with `src/audioengine.js`
- **For pattern library:** Start with `src/librarymanager.js` and `src/patternselector.js`
- **For sequencer editing:** Start with `src/visualsequencer.js`
- **For data formats:** Check `/library` JSON files

### Testing Changes
1. Make changes to source files
2. Refresh browser (no build step needed)
3. Check browser console for errors
4. Test with different patterns and BPMs

---

## Conclusion

BeatBuilder is a **promising music production tool** with a solid foundation but requiring significant development to reach its full potential. The pattern library system (v0.3.0) is well-executed, but integration into the main app is incomplete.

### Immediate Next Steps (Recommended Priority)
1. **Update LibraryManager** to include all 47 patterns including new leads
2. **Refactor main.js** into modular architecture
3. **Integrate pattern browser** into main index.html
4. **Add audio preview** for patterns
5. **Implement proper track controls** (volume, solo, mute)
6. **Enhance mobile responsiveness**

Once these are complete, BeatBuilder will be a powerful, user-friendly tool for music ideation and pre-production work that bridges the gap between inspiration and DAW production.

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Project Version:** 0.3.0
