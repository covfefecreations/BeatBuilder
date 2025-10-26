// exportManager.js
// Uses MidiWriterJS (loaded from CDN in index.html) to export simple MIDI
export default class ExportManager {
  exportJSON(obj, filename = "session.json") {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
  }

  exportMIDI(tracks, bpm = 120, filename = "export.mid") {
    // tracks: [{title, pattern:[{time (beats), note (midi or name), velocity}]}]
    // build MidiWriter tracks
    const MidiWriter = window.MidiWriter; // global from CDN
    if (!MidiWriter) {
      alert("MidiWriterJS not loaded");
      return;
    }

    const writerTracks = [];

    tracks.forEach((t, idx) => {
      const track = new MidiWriter.Track();
      track.setTempo(bpm);
      // channel assignment
      const channel = idx % 16;
      t.pattern.forEach(ev => {
        // convert beats -> ticks (MidiWriter uses duration strings)
        // We'll use simple approach: map quantized durations as 'T' tick values is complex.
        // Instead create 'note on' events with numeric duration 'T' is not straightforward.
        // MidiWriterJS accepts note events like new MidiWriter.NoteEvent({pitch: ['C4'], duration: '4'}) etc.
        // We'll map note time to measure by filling rests: easier way is to create events with wait param.
        const midiNote = typeof ev.note === "number" ? MidiWriter.Utils.midiNumberToNoteName(ev.note) : ev.note;
        const waitBeats = ev.time; // beats since start
        // push a NoteEvent with 'wait' and a 16th duration placeholder
        const event = new MidiWriter.NoteEvent({
          pitch: [midiNote],
          duration: '16',
          velocity: Math.round((ev.velocity||1)*100),
          channel,
          wait: Math.max(0, `${Math.round(waitBeats*4)}`) // use ticks expressed in 16ths
        });
        track.addEvent(event);
      });
      writerTracks.push(track);
    });

    const write = new MidiWriter.Writer(writerTracks);
    const bytes = write.buildFile();
    const blob = new Blob([bytes], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
  }
}