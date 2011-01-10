var HistoryManager = Klass.extend({
  init: function(dom_base, options) {
    this.options   = options || {};
    this.dom_base  = dom_base;
    this.list = this.dom_base.find('ul');
    this.levelStates = [];
    this.loadLevelStatesFromLS();

    this.baseID = 0;
    self = this;
    $(this.levelStates).each(function() {
      if (this.id > self.baseID) {
        self.baseID = this.id;
      }
    })

    this.refreshList();
  },

  refreshList: function() {
    this.list.html('');
    var history_rows = $(this.levelStates).get().reverse();
    $.each(history_rows, function() {
      if (parseInt(this.date).toString().length < 5) {
        // Old format... keep as is
      } else {
        this.date = dateFormat(this.date, "mmm dd yyyy HH:MM")
      }
    });
    $.tmpl('history_row', history_rows).appendTo(this.list);
  },

  loadLevelStatesFromLS: function() {
    self = this;
    if($.jStorage.storageAvailable()) {
      // console.log('local storage!');
      // console.log(this.levelStates.length);

      var states = $.jStorage.get('level_history');
      if (states) {
        $(states.rows).each(function() {
          self.levelStates.push(this);
        });
      }

      // console.log(this.levelStates.length.toString() + ' level states loaded');
    } else {
      console.log('NO LOCAL STORAGE CAPABILITY');
      this.levelStates = [
        {
          date: 'long ago',
          name: 'furst'
        },
        {
          date: 'a while ago',
          name: 'secund'
        }
      ]
    }
  },

  addLevelState: function(level_state) {
    level_state.id = this.makeNewID();
    this.levelStates.push(level_state);
    this.refreshAll();
  },

  makeNewID: function() {
    return ++this.baseID;
  },

  getLevelState: function(state_id) {
    var item;

    $(this.levelStates).each(function() {
      if (this.id == state_id) {
        item = this;
      }
    });

    return item;
  },

  removeLevelState: function(level_state) {
    this.levelStates = jQuery.grep(this.levelStates, function(state) {
      return (state.name != level_state.name || state.date != level_state.date);
    });
    this.refreshAll();
  },

  saveLevelStates: function() {
    $.jStorage.set('level_history', { rows: this.levelStates })
  },

  clearStorage: function() {
    this.levelStates = [];
    this.refreshAll();
  },

  refreshAll: function() {
    this.refreshList();
    this.saveLevelStates();
  }
});

$.template('history_row', '<li class="level_history_row" id="history_row_${id}">${date} - ${name} (${id})</li>');