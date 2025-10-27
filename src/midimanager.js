// midiManager.js
// lightweight wrapper for WebMIDI that forwards note-on events to the audioEngine when recording
export class MidiManager {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.inputs = [];
    this.enabled = false;
  }

  async init() {
    if (!navigator.requestMIDIAccess) {
      console.warn("WebMIDI not available in this browser");
      return;
    }
    const access = await navigator.requestMIDIAccess();
    access.onstatechange = (e) => console.log("MIDI state change", e.port.name, e.port.state);
    for (const input of access.inputs.values()) {
      input.onmidimessage = (msg) => this._onMidiMessage(msg);
      this.inputs.push(input);
    }
    this.enabled = true;
    console.log("MIDI initialized, inputs:", this.inputs.map(i=>i.name));
  }

  _onMidiMessage(msg) {
    const [status, note, velocity] = msg.data;
    const command = status & 0xf0;
    if (command === 0x90 && velocity > 0) { // note on
      if (this.audioEngine && this.audioEngine.recording) {
        this.audioEngine.recordMidiNote(note, velocity);
      }
    }
  }
}