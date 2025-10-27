import { createClient } from 'https://cdn.jsdelivr.net/npm/@sanity/client@4.18.0/dist/sanityClient.min.js';

// Replace projectId with your actual project ID: cih1o2ao
export const sanityClient = createClient({
  projectId: 'cih1o2ao',
  dataset: 'production',
  apiVersion: '2025-10-26', // YYYY-MM-DD
  useCdn: false, // set false for real-time updates
  token: '', // Optional: only if you need write access
});