// dataManager.js - file loader
export default class DataManager {
  async loadData(name) {
    const res = await fetch(`data/${name}.json`);
    if (!res.ok) throw new Error(`Failed to load data/${name}.json`);
    return res.json();
  }
}