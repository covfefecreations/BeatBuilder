// src/previewengine.js
// Dedicated, temporary AudioEngine instance for pattern preview.
// This ensures that preview playback does not interfere with the main Tone.js Transport or scheduled parts.

import AudioEngine from './audioengine.js'; // Assuming AudioEngine is exported as default

export class PreviewEngine {
  constructor() {
    // Create a new, isolated Tone.Context for the preview engine
    // This is the most reliable way to ensure non-interference.
    // However, for simplicity and to avoid complex context switching, 
    // we will create a new AudioEngine instance that uses the main Tone.js context, 
    // but manages its own parts and transport state.
    // NOTE: Tone.js Transport is global, so we must be careful.
    
    // The safest approach is to use the main AudioEngine's synths/players
    // but manage the scheduling outside of the main Tone.Transport.
    // Since the main AudioEngine uses Tone.Transport for scheduling, 
    // we will stick to the original plan: pass the main engine's synths/players 
    // to a temporary scheduling logic.
    
    // Let's simplify: we will use the main AudioEngine's resources (synths/players)
    // but schedule a single, short-lived part on the main Tone.Transport 
    // *only* when the main transport is stopped.
    
    // Given the difficulty of isolating Tone.Transport, the original implementation 
    // in LibraryManager (which stops and restores the main transport) is the common 
    // and simplest pattern.
    
    // Instead of a new class, let's refactor the preview logic to be safer and cleaner.
    // The goal is to make the main AudioEngine more robust for this pattern.
    
    // Let's stick to the original plan of creating a separate AudioEngine 
    // and see if we can isolate the scheduling.
    
    this.previewAudioEngine = null;
  }
  
  // This class is no longer needed if we refactor the preview logic 
  // into the main AudioEngine or LibraryManager as a cleaner function.
  // The original LibraryManager.previewPattern is the correct place for this logic, 
  // but it needs to be made more robust.
  
  // I will skip creating this file and instead focus on refactoring the existing code 
  // in LibraryManager and AudioEngine to support the feature cleanly.
}
