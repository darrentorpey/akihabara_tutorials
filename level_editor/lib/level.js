var Level = Klass.extend({
  init: function() {
    this.n_map_rows = NUM_LEVEL_ROWS;
    this.n_map_cols = NUM_LEVEL_COLS;
    this.map = new Array(this.n_map_rows);
    this.initMap();
  },

  generateMapFromString: function(levelDataString) {
    if (levelDataString.length == (this.n_map_cols * this.n_map_rows)) {
      for (var c = 0; c < (this.n_map_cols * this.n_map_rows); c += this.n_map_cols) {
        this.map[c/this.n_map_cols] = levelDataString.substr(c, this.n_map_cols);
      }
    }
  },

  initMap: function() {
    for (var i = 0; i < this.n_map_rows; i++) {
      this.map[i] = '0000000000000000000000000000000000000000';
    }
  }
});