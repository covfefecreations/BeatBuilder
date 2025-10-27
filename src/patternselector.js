// patternselector.js - Pattern Browser UI Component
// Visual interface for browsing and selecting patterns from the library

export default class PatternSelector {
  constructor(containerId, libraryManager) {
    this.container = document.getElementById(containerId);
    this.library = libraryManager;
    this.onPatternSelected = null; // callback when pattern is selected
    this.currentFilter = 'all';
  }

  /**
   * Render the pattern selector UI
   */
  render() {
    if (!this.container) return;

    const html = `
      <div class="pattern-selector">
        <div class="pattern-selector-header">
          <h3>Pattern Library</h3>
          <div class="pattern-stats">
            <span class="stat-item">🥁 ${this.library.drums.length} Drums</span>
            <span class="stat-item">🎸 ${this.library.bass.length} Bass</span>
            <span class="stat-item">🎹 ${this.library.chords.length} Chords</span>
          </div>
        </div>

        <div class="pattern-filters">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="drums">Drums</button>
          <button class="filter-btn" data-filter="bass">Bass</button>
          <button class="filter-btn" data-filter="chords">Chords</button>
        </div>

        <div class="pattern-search">
          <input type="text" id="patternSearch" placeholder="Search patterns..." />
        </div>

        <div class="pattern-grid" id="patternGrid">
          ${this.renderPatterns()}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Render pattern cards
   */
  renderPatterns(filter = 'all', searchTerm = '') {
    let patterns = [];

    if (filter === 'all') {
      patterns = [
        ...this.library.drums.map(p => ({...p, type: 'drums'})),
        ...this.library.bass.map(p => ({...p, type: 'bass'})),
        ...this.library.chords.map(p => ({...p, type: 'chords'}))
      ];
    } else {
      patterns = this.library.getPatternsByType(filter).map(p => ({...p, type: filter}));
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      patterns = patterns.filter(p =>
        (p.name && p.name.toLowerCase().includes(search)) ||
        (p.description && p.description.toLowerCase().includes(search)) ||
        (p.genre && p.genre.toLowerCase().includes(search))
      );
    }

    if (patterns.length === 0) {
      return '<div class="no-patterns">No patterns found</div>';
    }

    return patterns.map(pattern => this.renderPatternCard(pattern)).join('');
  }

  /**
   * Render individual pattern card
   */
  renderPatternCard(pattern) {
    const typeColors = {
      drums: '#ff4466',
      bass: '#4488ff',
      chords: '#aa44ff'
    };

    const typeEmojis = {
      drums: '🥁',
      bass: '🎸',
      chords: '🎹'
    };

    const color = typeColors[pattern.type] || '#00ffee';
    const emoji = typeEmojis[pattern.type] || '🎵';

    return `
      <div class="pattern-card" data-pattern-id="${pattern.id}" data-type="${pattern.type}">
        <div class="pattern-card-header" style="border-left: 4px solid ${color};">
          <span class="pattern-type">${emoji} ${pattern.type}</span>
          <h4 class="pattern-name">${pattern.name}</h4>
        </div>
        <div class="pattern-card-body">
          <p class="pattern-description">${pattern.description || ''}</p>
          ${pattern.genre ? `<div class="pattern-genre">Genre: ${pattern.genre}</div>` : ''}
          ${pattern.energy ? `<div class="pattern-energy">Energy: ${pattern.energy}</div>` : ''}
          ${pattern.emotional_character ? `<div class="pattern-emotion">${pattern.emotional_character}</div>` : ''}
          ${pattern.bpm ? `<div class="pattern-bpm">BPM: ${pattern.bpm}</div>` : ''}
          ${pattern.progression ? `<div class="pattern-progression">${pattern.progression}</div>` : ''}
        </div>
        <div class="pattern-card-footer">
          <button class="pattern-load-btn" data-pattern-id="${pattern.id}">Load Pattern</button>
          <button class="pattern-preview-btn" data-pattern-id="${pattern.id}">Preview</button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Filter buttons
    const filterBtns = this.container.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.updatePatternGrid();
      });
    });

    // Search input
    const searchInput = this.container.querySelector('#patternSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.updatePatternGrid(e.target.value);
      });
    }

    // Pattern load buttons
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('pattern-load-btn')) {
        const patternId = e.target.dataset.patternId;
        this.loadPattern(patternId);
      }

      if (e.target.classList.contains('pattern-preview-btn')) {
        const patternId = e.target.dataset.patternId;
        this.previewPattern(patternId);
      }
    });
  }

  /**
   * Update pattern grid
   */
  updatePatternGrid(searchTerm = '') {
    const grid = this.container.querySelector('#patternGrid');
    if (grid) {
      grid.innerHTML = this.renderPatterns(this.currentFilter, searchTerm);
    }
  }

  /**
   * Load selected pattern
   */
  loadPattern(patternId) {
    const pattern = this.library.getPatternById(patternId);
    if (pattern) {
      console.log('Loading pattern:', pattern);
      if (this.onPatternSelected) {
        this.onPatternSelected(pattern);
      }
    }
  }

  /**
   * Preview pattern
   */
  previewPattern(patternId) {
    const pattern = this.library.getPatternById(patternId);
    if (pattern) {
      console.log('Previewing pattern:', pattern);
      // TODO: Implement preview functionality
      alert(`Preview: ${pattern.name}\n\n${pattern.description}\n\nFull preview coming soon!`);
    }
  }

  /**
   * Set callback for pattern selection
   */
  onSelect(callback) {
    this.onPatternSelected = callback;
  }
}
