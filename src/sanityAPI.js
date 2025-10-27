import { sanityClient } from './sanityClient.js';

// --- Fetch all projects ---
export async function fetchProjects() {
  const query = `*[_type == "project"] | order(createdAt desc){
    _id,
    title,
    bpm,
    tracks[]->{
      _id,
      _type,
      title,
      steps,
      pads
    }
  }`;
  return await sanityClient.fetch(query);
}

// --- Fetch a single project ---
export async function fetchProjectById(id) {
  const query = `*[_type == "project" && _id == $id][0]{
    _id,
    title,
    bpm,
    tracks[]->{
      _id,
      _type,
      title,
      steps,
      pads
    }
  }`;
  return await sanityClient.fetch(query, { id });
}

// --- Create / Update a project ---
export async function saveProject(project) {
  if (!project._id) {
    // Create new
    return await sanityClient.create({
      _type: 'project',
      ...project,
      createdAt: new Date().toISOString()
    });
  } else {
    // Update existing
    return await sanityClient.patch(project._id)
      .set(project)
      .commit();
  }
}