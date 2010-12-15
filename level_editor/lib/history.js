var HistoryManager = Klass.extend({
  init: function(dom_base, options) {
    this.options   = options || {};
    this.dom_base  = dom_base;
    this.list = this.dom_base.find('ul');
    this.levelStates = [];
    this.loadLevelStatesFromLS();

    this.refreshList();
  },

  refreshList: function() {
    $.tmpl('history_row', this.levelStates).appendTo(this.list);
  },

  loadLevelStatesFromLS: function() {
    self = this;
    if($.jStorage.storageAvailable()) {
      console.log('local storage!');
      // console.log(this.levelStates.length);

      var states = $.jStorage.get('level_history');
      if (states) {
        $(states.rows).each(function() {
          self.levelStates.push(this);
        });
      }

      console.log(this.levelStates.length);
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
    this.levelStates.push(level_state);
    this.saveLevelStates();
  },

  saveLevelStates: function() {
    $.jStorage.set('level_history', { rows: this.levelStates })
  }
});

$.template('history_row', '<li>${date} - ${name}</li>');