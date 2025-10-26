// main.js
// Lightweight entry that wires the redesigned index.html to the modular src/ app
// It imports src/app.js (the heavier bootstrap) so we don't duplicate logic.
// Make sure src/app.js either exports an `init` function or runs on import (we accounted for both).

async function bootstrap() {
  // try to import the modular app bootstrap
  let appModule = null;
  try {
    appModule = await import('./src/app.js');
  } catch (err) {
    console.error("Failed to import src/app.js — make sure it exists and is valid ESM.", err);
    showErrorBanner("Internal error: failed to load application module (src/app.js). Check console.");
    return;
  }

  // if module exports init, call it and capture returned objects (optional)
  if (appModule && typeof appModule.init === 'function') {
    try {
      const api = await appModule.init();
      // expose API hooks to window for dev convenience
      window.AppAPI = api || {};
      wireUI(api);
    } catch (e) {
      console.error("app.init() failed", e);
      showErrorBanner("Application bootstrap failed. See console.");
    }
  } else {
    // module likely executed on import (old style), so try to find global App API or simply wire basic UI.
    console.info("src/app.js did not export init(). Assuming it autostarts on import.");
    // give a small delay to allow it to create expected globals (audioEngine/sequencer)
    setTimeout(() => {
      const possible = window.AppAPI || window.__App || null;
      wireUI(possible);
    }, 350);
  }
}

/* Minimal UI attachment to keep page interactive even if internals vary */
function wireUI(api = null) {
  // expose quick helpers
  const playBtn = document.getElementById('play');
  const stopBtn = document.getElementById('stop');
  const loadJsonBtn = document.getElementById('load-json');
  const exportJsonBtn = document.getElementById('export-json');
  const exportMidiBtn = document.getElementById('export-midi');
  const bpmInput = document.getElementById('bpm');
  const transportPos = document.getElementById('transport-position');

  // basic actions — if app provides functions, use them; otherwise show friendly console hint
  playBtn.onclick = async () => {
    if (api && typeof api.start === 'function') {
      const bpm = Number(bpmInput.value || 110);
      await api.start(bpm);
    } else {
      console.warn("Play pressed — app.start() not found. If you migrated src/app.js, export an init() that returns { start, stop, load, ... }");
      alert("Play pressed — but app backend not found. Check console.");
    }
  };

  stopBtn.onclick = () => {
    if (api && typeof api.stop === 'function') {
      api.stop();
    } else {
      console.warn("Stop pressed — app.stop() not found.");
    }
  };

  loadJsonBtn.onclick = () => {
    if (api && typeof api.loadJson === 'function') {
      api.loadJson();
    } else {
      // fallback: emit a click for the app bootstrap to listen to (src/app.js listens for "load-json" by id in earlier code)
      const evt = new CustomEvent('requestLoadJson');
      window.dispatchEvent(evt);
      console.info("Requested load JSON (no direct API). If src/app.js listens for #load-json it will respond.");
    }
  };

  exportJsonBtn.onclick = () => {
    if (api && typeof api.exportJSON === 'function') {
      api.exportJSON();
    } else {
      console.warn("Export JSON not available on app API.");
      alert("No export API found. Check console for details.");
    }
  };

  exportMidiBtn.onclick = () => {
    if (api && typeof api.exportMIDI === 'function') {
      api.exportMIDI();
    } else {
      console.warn("Export MIDI not available on app API.");
      alert("No export API found. Check console for details.");
    }
  };

  // keep transport display updated if api provides bus with position data
  if (api && api.transport && typeof api.transport.getPosition === 'function') {
    setInterval(() => {
      transportPos.textContent = api.transport.getPosition();
    }, 120);
  } else {
    // fallback: show the Tone.Transport position if Tone is loaded globally
    if (window.Tone) {
      setInterval(() => {
        try { transportPos.textContent = Tone.Transport.position; } catch (e) {}
      }, 120);
    }
  }

  // small convenience: update loop bars into app if present
  const loopBarsEl = document.getElementById('loop-bars');
  loopBarsEl.onchange = () => {
    if (api && typeof api.setLoopBars === 'function') api.setLoopBars(Number(loopBarsEl.value));
  };

  // track list population: if app exposes a track list getter, populate UI
  const trackListEl = document.getElementById('track-list');
  async function refreshTracks() {
    trackListEl.innerHTML = '';
    if (api && typeof api.getTracks === 'function') {
      const tracks = await api.getTracks();
      if (!tracks || tracks.length === 0) {
        trackListEl.innerHTML = `<div class="track-empty">No tracks loaded — click “Load JSON”</div>`;
        return;
      }
      tracks.forEach(t => {
        const row = document.createElement('div');
        row.className = 'track-row';
        row.innerHTML = `<div class="color" style="background:${t.color||'#4c87c7'}"></div>
                         <div class="meta">${t.title || t.id}</div>
                         <div class="meta-mini" style="font-size:0.78rem;color:#9fb3d0">${t.meta?.type||''}</div>`;
        row.onclick = () => {
          // emit custom event selecting this track (app may listen)
          const evt = new CustomEvent('selectTrack', { detail: t });
          window.dispatchEvent(evt);
        };
        trackListEl.appendChild(row);
      });
    } else {
      trackListEl.innerHTML = `<div class="track-empty">No track API — waiting for app to load</div>`;
    }
  }

  // refresh periodically if API available
  refreshTracks();
  setInterval(refreshTracks, 1500);
}

function showErrorBanner(msg) {
  const el = document.createElement('div');
  el.style.position = 'fixed';
  el.style.left = '12px';
  el.style.right = '12px';
  el.style.top = '12px';
  el.style.padding = '12px';
  el.style.background = '#ff4d4f';
  el.style.color = '#fff';
  el.style.borderRadius = '10px';
  el.style.zIndex = 9999;
  el.innerText = msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 6000);
}

bootstrap();