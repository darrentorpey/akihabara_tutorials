var AkiPlayer = TopDownActor.extend({
  init: function(options) {
    options.aki_attributes = _.extend(options.aki_attributes || {}, {
      group:   'player',
      tileset: 'player_tiles'
    })

    this._super(options);
  },

  getAkiObject: function() {
    var obj = this._super();
    akiba.controls.setControlKeys(obj, 'eight_way_std');
    return obj;
  }
});