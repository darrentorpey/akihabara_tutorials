level_id = 0;
var Level = Klass.extend({
  init: function(options) {
    this.settings = {
      map_rows: 30,
      map_cols: 40
    }

    this.id = level_id++;

    if (options) {
      $.extend(this.settings, options);
    }

    this.n_map_rows = this.settings.map_rows;
    this.n_map_cols = this.settings.map_cols;
    this.map = new Array(this.n_map_rows);
    this.initMap();
    this.name = $('#level_name input').val() || 'Unnamed ALES Map';
    this.hookToUI();
  },

  generateMapFromString: function(levelDataString) {
    if (levelDataString.length == (this.n_map_cols * this.n_map_rows)) {
      for (var c = 0; c < (this.n_map_cols * this.n_map_rows); c += this.n_map_cols) {
        this.map[c/this.n_map_cols] = levelDataString.substr(c, this.n_map_cols);
      }
    }
  },

  getLevelParams: function() {
    var levelParam = '';
    for (var i = 0; i < 30; i++) {
      levelParam += this.map[i];
    }
    return levelParam;
  },

  initMap: function() {
    for (var i = 0; i < this.n_map_rows; i++) {
      this.map[i] = '0000000000000000000000000000000000000000';
    }
    this.map[7] = '4400000000000000000000000000000000000000';
  },

  getName: function() {
    return this.name;
  },

  setName: function(val) {
    this.name = val;
    $('#level_name input').val(val);
  },

  hookToUI: function() {
    $('#level_name input').change({ level: this }, function(event) {
      event.data.level.name = $('#level_name input').val();
    });
  },

  getFilenameForSave: function() {
    return this.getName().toLowerCase().replace(/ /g, '_') + '_' + getCurrentTimestampForFile() + '.json';
  }
});