// sanity.js - Frontend module for iPhone-friendly sequencer
// Handles all data interactions with Sanity.io

import sanityClient from 'https://cdn.jsdelivr.net/npm/@sanity/client@3.10.0/dist/sanity-client.min.js';

// --- Initialize Sanity Client ---
export const client = sanityClient({
  projectId: 'cih1o2ao', // your Sanity project ID
  dataset: 'production',
  useCdn: true, // Fast cache for reads
  apiVersion: '2025-10-26',
});

// --- DATA FETCH FUNCTIONS ---

export async function loadDrumKits() {
  const query = `*[_type == "drumKit"]{_id, title, pads}`;
  return await client.fetch(query);
}

export async function loadBassTracks() {
  const query = `*[_type == "bass"]{_id, title, steps}`;
  return await client.fetch(query);
}

export async function loadChordTracks() {
  const query = `*[_type == "chord"]{_id, title, steps}`;
  return await client.fetch(query);
}

export async function loadBpmPresets() {
  const query = `*[_type == "bpmPreset"]{_id, title, bpm}`;
  return await client.fetch(query);
}

export async function loadPatterns() {
  const query = `*[_type == "pattern"]{_id, title, steps, bpm}`;
  return await client.fetch(query);
}

// --- DATA WRITE FUNCTIONS ---

export async function saveProject(project, token) {
  if (!token) throw new Error("Sanity write token required for saving projects.");
  
  const writeClient = sanityClient({
    projectId: 'cih1o2ao',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2025-10-26',
    token: token
  });

  return await writeClient.create({
    _type: 'project',
    ...project
  });
}

// --- HELPER FUNCTIONS ---

export function parseDrumKitJSON(data) {
  return data.map(kit => {
    return {
      id: kit._id,
      sound: kit.title,
      steps: kit.pads.map(pad => ({
        active: pad.active || false,
        velocity: pad.velocity || 1
      }))
    };
  });
}

export function parsePatterns(data) {
  return data.map(pattern => ({
    id: pattern._id,
    sound: pattern.title,
    steps: pattern.steps,
    bpm: pattern.bpm
  }));
}
